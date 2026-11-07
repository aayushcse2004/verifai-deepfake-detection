import os
import traceback
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from backend.app.database.session import SessionLocal
from backend.app.models.media import MediaFile
from backend.app.models.analysis import AnalysisJob, AnalysisResult
from backend.app.models.evidence import SpeakerSegment, EvidenceItem
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.security import calculate_sha256
from backend.app.services.media_service import media_service
from backend.app.services.report_service import report_service

# ML Adapters
from backend.app.ml.face_detection.face_detector import face_detector
from backend.app.ml.deepfake_detection.detector import deepfake_cnn_detector
from backend.app.ml.lip_sync.syncnet_detector import syncnet_detector
from backend.app.ml.active_speaker.talknet_detector import talknet_detector
from backend.app.ml.speaker_diarization.diarizer import speaker_diarizer
from backend.app.ml.speech_recognition.transcriber import whisper_transcriber
from backend.app.ml.audio_analysis.audio_forensics import audio_forensics_detector
from backend.app.ml.fusion.fusion_engine import multimodal_fusion_engine


class AnalysisWorker:
    """Orchestrates end-to-end 11-stage multimodal forensics pipeline."""

    def _update_stage(self, db: Session, job: AnalysisJob, stage_name: str, progress: int, log_msg: str):
        job.current_stage = stage_name
        job.progress = progress
        now_str = datetime.now(timezone.utc).strftime("%H:%M:%S")

        logs = list(job.stage_logs or [])
        logs.append({
            "stage": stage_name,
            "progress": progress,
            "timestamp": now_str,
            "message": log_msg
        })
        job.stage_logs = logs
        db.commit()
        logger.info(f"[{job.id[:8]}] Stage {progress}% - {stage_name}: {log_msg}")

    def run_pipeline(self, analysis_id: str):
        db: Session = SessionLocal()
        try:
            job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
            if not job:
                logger.error(f"Analysis job {analysis_id} not found.")
                return

            media = db.query(MediaFile).filter(MediaFile.id == job.media_id).first()
            if not media:
                job.status = "FAILED"
                job.error_message = "Associated media record not found."
                db.commit()
                return

            job.status = "PROCESSING"
            db.commit()

            media_path = os.path.join(settings.UPLOAD_DIR, media.stored_filename)
            if not os.path.exists(media_path):
                job.status = "FAILED"
                job.error_message = f"Media file not found on disk: {media.stored_filename}"
                db.commit()
                return

            # Setup directory structure for this analysis
            analysis_frame_dir = os.path.join(settings.FRAME_DIR, analysis_id)
            analysis_crop_dir = os.path.join(analysis_frame_dir, "faces")
            os.makedirs(analysis_crop_dir, exist_ok=True)

            audio_wav_path = os.path.join(analysis_frame_dir, "extracted_audio.wav")
            report_pdf_path = os.path.join(settings.REPORT_DIR, f"{analysis_id}.pdf")

            # ----------------------------------------------------
            # STAGE 1: File Validation (5%)
            # ----------------------------------------------------
            self._update_stage(db, job, "File Validation", 5, "Verifying integrity and cryptographic checksum.")
            file_hash = calculate_sha256(media_path)
            meta = media_service.get_metadata(media_path)
            media.duration = meta.get("duration", 0.0)
            db.commit()

            # ----------------------------------------------------
            # STAGE 2: Audio Extraction (15%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Audio Extraction", 15, "Isolating and normalizing audio track to 16kHz PCM WAV.")
            has_audio = media_service.extract_audio(media_path, audio_wav_path)
            if not has_audio and not meta["has_video"]:
                raise ValueError("Media contains neither valid video frames nor an audio stream.")

            # ----------------------------------------------------
            # STAGE 3: Frame Extraction (25%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Frame Extraction", 25, "Sampling sequential video frames at interval.")
            sampled_frames = []
            if meta["has_video"]:
                sampled_frames = media_service.extract_frames(media_path, analysis_frame_dir, fps_sample=2.0)
                self._update_stage(db, job, "Frame Extraction", 30, f"Extracted {len(sampled_frames)} video frames.")
            else:
                self._update_stage(db, job, "Frame Extraction", 30, "Audio-only media; frame sampling skipped.")

            # ----------------------------------------------------
            # STAGE 4: Face Detection (40%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Face Detection", 40, "Detecting and tracking facial candidates across frames.")
            face_summary = {"face_records": [], "tracks": [], "faces_detected": False}
            if sampled_frames:
                face_summary = face_detector.process_sampled_frames(sampled_frames, analysis_crop_dir)
                detected_count = len(face_summary.get("face_records", []))
                unique_tracks = len(face_summary.get("tracks", []))
                self._update_stage(
                    db, job, "Face Detection", 45,
                    f"Identified {detected_count} face instances across {unique_tracks} unique track(s)."
                )

            # ----------------------------------------------------
            # STAGE 5: Facial Manipulation Analysis (55%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Facial Manipulation Analysis", 55, "Scanning face crops for CNN synthesis & blending artifacts.")
            facial_res = deepfake_cnn_detector.analyze(face_summary.get("face_records", []))
            self._update_stage(
                db, job, "Facial Manipulation Analysis", 60,
                f"Facial analysis: score={facial_res.get('score')}, mode={facial_res.get('metrics', {}).get('operational_mode')}."
            )

            # ----------------------------------------------------
            # STAGE 6: Lip-Sync Analysis (65%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Lip-Sync Analysis", 65, "Evaluating audio-visual synchrony and mouth motion lag via SyncNet.")
            lip_sync_res = syncnet_detector.analyze(
                face_summary.get("face_records", []),
                audio_wav_path if has_audio else None
            )

            # ----------------------------------------------------
            # STAGE 7: Active Speaker Detection (75%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Active Speaker Detection", 75, "Correlating acoustic voice activity with visible speakers via TalkNet.")
            active_spk_res = talknet_detector.analyze(
                face_summary.get("face_records", []),
                audio_wav_path if has_audio else None,
                duration=media.duration or 0.0
            )

            # ----------------------------------------------------
            # STAGE 8: Speaker Diarization (82%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Speaker Diarization", 82, "Segmenting multi-speaker conversational turns.")
            diarization_res = speaker_diarizer.analyze(audio_wav_path if has_audio else None)

            # ----------------------------------------------------
            # STAGE 9: Speech Recognition (88%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Speech Recognition", 88, "Transcribing speech audio with OpenAI Whisper.")
            asr_res = whisper_transcriber.analyze(
                audio_wav_path if has_audio else None,
                speaker_segments=diarization_res.get("segments", [])
            )

            # ----------------------------------------------------
            # STAGE 10: Audio Forensics & Multimodal Fusion (95%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Multimodal Fusion", 92, "Executing acoustic forensics and cross-modal evidence fusion.")
            audio_res = audio_forensics_detector.analyze(audio_wav_path if has_audio else None)

            fusion_result = multimodal_fusion_engine.fuse(
                facial_result=facial_res,
                lip_sync_result=lip_sync_res,
                active_speaker_result=active_spk_res,
                audio_result=audio_res,
                diarization_result=diarization_res,
                asr_result=asr_res
            )

            # Save speaker segments and evidence into database
            speaker_segments_data = asr_res.get("segments", []) or diarization_res.get("segments", [])
            for seg in speaker_segments_data:
                db_seg = SpeakerSegment(
                    analysis_id=job.id,
                    speaker_id=seg.get("speaker_id", "SPEAKER_00"),
                    start_time=seg.get("start_time", 0.0),
                    end_time=seg.get("end_time", 0.0),
                    transcript=seg.get("transcript", "")
                )
                db.add(db_seg)

            for ev in fusion_result.get("evidence_items", []):
                db_ev = EvidenceItem(
                    analysis_id=job.id,
                    timestamp=ev.get("timestamp", 0.0),
                    evidence_type=ev.get("evidence_type", "anomaly"),
                    description=ev.get("description", ""),
                    score=ev.get("score", 0.0),
                    metadata_json=ev.get("metadata_json", {})
                )
                db.add(db_ev)

            # Save AnalysisResult
            analysis_res_record = AnalysisResult(
                analysis_id=job.id,
                overall_assessment=fusion_result["overall_assessment"],
                overall_score=fusion_result["overall_score"],
                facial_score=fusion_result.get("facial_score"),
                lip_sync_score=fusion_result.get("lip_sync_score"),
                active_speaker_score=fusion_result.get("active_speaker_score"),
                audio_score=fusion_result.get("audio_score"),
                model_statuses=fusion_result.get("model_statuses", {}),
                result_json={
                    "face_detection": {
                        "total_faces": len(face_summary.get("face_records", [])),
                        "unique_tracks": len(face_summary.get("tracks", [])),
                        "samples": [
                            {
                                "timestamp": r["timestamp"],
                                "track_id": r["track_id"],
                                "bbox": r["bbox"],
                                "crop_filename": r["crop_filename"]
                            }
                            for r in face_summary.get("face_records", [])[:15]
                        ]
                    },
                    "fusion": fusion_result,
                    "transcription": asr_res.get("transcription", ""),
                    "metrics": fusion_result.get("detailed_metrics", {})
                }
            )
            db.add(analysis_res_record)
            db.commit()

            # ----------------------------------------------------
            # STAGE 11: Report Generation (100%)
            # ----------------------------------------------------
            self._update_stage(db, job, "Report Generation", 98, "Compiling forensic PDF verification document.")
            media_info = {
                "original_filename": media.original_filename,
                "file_hash": file_hash,
                "file_size": media.file_size,
                "duration": media.duration,
                "file_type": media.file_type
            }
            job_info = {"id": job.id, "created_at": job.created_at}

            report_service.generate_pdf(
                output_pdf_path=report_pdf_path,
                media_info=media_info,
                job_info=job_info,
                fusion_result=fusion_result,
                segments=speaker_segments_data,
                transcription=asr_res.get("transcription", "")
            )

            job.status = "COMPLETED"
            job.current_stage = "Analysis Completed"
            job.progress = 100
            job.completed_at = datetime.now(timezone.utc)
            db.commit()

            self._update_stage(db, job, "Completed", 100, f"Forensic analysis concluded: {fusion_result['overall_assessment']}.")
            logger.info(f"Job {analysis_id} finished successfully.")

        except Exception as e:
            logger.error(f"Analysis worker failed for job {analysis_id}: {e}\n{traceback.format_exc()}")
            if job:
                job.status = "FAILED"
                job.error_message = str(e)
                job.completed_at = datetime.now(timezone.utc)
                db.commit()
        finally:
            db.close()


analysis_worker = AnalysisWorker()

