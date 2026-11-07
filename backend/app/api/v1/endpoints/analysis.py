import os
import shutil
import threading
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database.session import get_db
from backend.app.models.media import MediaFile
from backend.app.models.analysis import AnalysisJob, AnalysisResult
from backend.app.models.evidence import SpeakerSegment, EvidenceItem
from backend.app.schemas.analysis import AnalysisStatusResponse, AnalysisJobResponse
from backend.app.schemas.forensics import ForensicResultResponse, SpeakerSegmentSchema, EvidenceItemSchema
from backend.app.services.analysis_worker import analysis_worker
from backend.app.core.config import settings
from backend.app.core.logging import logger

router = APIRouter()


@router.post("/{analysis_id}/start")
def start_analysis(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    Start media analysis asynchronously in background thread.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis job not found.")

    if job.status == "PROCESSING":
        return {"message": "Analysis is already running.", "analysis_id": analysis_id, "status": job.status}

    # Launch background thread for pipeline execution
    worker_thread = threading.Thread(
        target=analysis_worker.run_pipeline,
        args=(analysis_id,),
        daemon=True
    )
    worker_thread.start()

    return {
        "message": "Forensic analysis pipeline initialized.",
        "analysis_id": analysis_id,
        "status": "PROCESSING"
    }


@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse)
def get_analysis_status(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    Poll analysis progress, current stage, and pipeline log entries.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis job not found.")

    return AnalysisStatusResponse(
        analysis_id=job.id,
        status=job.status,
        current_stage=job.current_stage,
        progress=job.progress,
        stage_logs=job.stage_logs or [],
        completed_at=job.completed_at,
        error_message=job.error_message
    )


@router.get("/{analysis_id}/results", response_model=ForensicResultResponse)
def get_analysis_results(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve full multimodal forensic report, component scores, evidence, and transcription.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis job not found.")

    if job.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Analysis is not completed yet (current status: {job.status})."
        )

    res = db.query(AnalysisResult).filter(AnalysisResult.analysis_id == analysis_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis result record not found.")

    segments = db.query(SpeakerSegment).filter(SpeakerSegment.analysis_id == analysis_id).order_by(SpeakerSegment.start_time).all()
    evidence = db.query(EvidenceItem).filter(EvidenceItem.analysis_id == analysis_id).order_by(EvidenceItem.timestamp).all()

    result_json = res.result_json or {}
    fusion_meta = result_json.get("fusion", {})

    return ForensicResultResponse(
        analysis_id=job.id,
        overall_assessment=res.overall_assessment,
        overall_score=res.overall_score,
        facial_score=res.facial_score,
        lip_sync_score=res.lip_sync_score,
        active_speaker_score=res.active_speaker_score,
        audio_score=res.audio_score,
        model_statuses=res.model_statuses or {},
        speaker_segments=[SpeakerSegmentSchema.model_validate(s) for s in segments],
        evidence_items=[EvidenceItemSchema.model_validate(e) for e in evidence],
        transcription=result_json.get("transcription", ""),
        detailed_metrics=result_json.get("metrics", {}),
        limitations=fusion_meta.get("limitations", []),
        disclaimer=fusion_meta.get("disclaimer", "")
    )


@router.get("/history", response_model=List[AnalysisJobResponse])
def get_analysis_history(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Retrieve historical analyses ordered by newest first.
    """
    jobs = db.query(AnalysisJob).order_by(desc(AnalysisJob.created_at)).offset(offset).limit(limit).all()
    return [AnalysisJobResponse.model_validate(j) for j in jobs]


@router.get("/{analysis_id}/report")
def download_forensic_report(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    Download the generated forensic PDF verification document.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis job not found.")

    report_path = os.path.join(settings.REPORT_DIR, f"{analysis_id}.pdf")
    if not os.path.exists(report_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forensic PDF report not yet generated.")

    return FileResponse(
        path=report_path,
        media_type="application/pdf",
        filename=f"VerifAI_Forensic_Report_{analysis_id[:8]}.pdf"
    )


@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    Purge analysis records, uploaded media, extracted frames, and PDF report.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis job not found.")

    media = db.query(MediaFile).filter(MediaFile.id == job.media_id).first()

    # 1. Delete media file on disk
    if media and media.stored_filename:
        media_path = os.path.join(settings.UPLOAD_DIR, media.stored_filename)
        if os.path.exists(media_path):
            try:
                os.remove(media_path)
            except Exception as e:
                logger.warning(f"Failed to delete media file: {e}")

    # 2. Delete report PDF
    report_path = os.path.join(settings.REPORT_DIR, f"{analysis_id}.pdf")
    if os.path.exists(report_path):
        try:
            os.remove(report_path)
        except Exception as e:
            logger.warning(f"Failed to delete report PDF: {e}")

    # 3. Delete frames & crops directory
    frames_dir = os.path.join(settings.FRAME_DIR, analysis_id)
    if os.path.exists(frames_dir):
        try:
            shutil.rmtree(frames_dir, ignore_errors=True)
        except Exception as e:
            logger.warning(f"Failed to delete frame directory: {e}")

    # 4. Cascade delete DB records
    if media:
        db.delete(media)
    else:
        db.delete(job)
    db.commit()

    return {"message": f"Analysis {analysis_id} and associated storage deleted successfully."}

