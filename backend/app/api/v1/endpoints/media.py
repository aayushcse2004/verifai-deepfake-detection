import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.media import MediaFile
from backend.app.models.analysis import AnalysisJob
from backend.app.schemas.media import MediaUploadResponse, MediaFileResponse
from backend.app.core.config import settings
from backend.app.core.security import validate_file_extension, validate_file_signature, generate_secure_filename, calculate_sha256
from backend.app.services.audit_service import audit_service
from backend.app.core.logging import logger

router = APIRouter()


@router.post("/upload", response_model=MediaUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_media(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Securely upload media file (video, audio, or static image), validate format and size,
    compute cryptographic SHA-256 digest, create chain-of-custody audit log, and initialize an AnalysisJob.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided.")

    ext = validate_file_extension(file.filename)
    secure_name = generate_secure_filename(file.filename)
    dest_path = os.path.join(settings.UPLOAD_DIR, secure_name)

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(dest_path)
        if file_size > settings.max_upload_bytes:
            if os.path.exists(dest_path):
                os.remove(dest_path)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB."
            )

        # Validate magic byte binary signature to prevent MIME spoofing
        validate_file_signature(dest_path, ext)
    except HTTPException:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise
    except Exception as e:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        logger.error(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Calculate SHA-256
    file_hash = calculate_sha256(dest_path)

    # Determine file category
    image_exts = {"png", "jpg", "jpeg", "webp"}
    video_exts = {"mp4", "mov", "avi", "mkv"}
    if ext in image_exts:
        file_type = "image"
    elif ext in video_exts:
        file_type = "video"
    else:
        file_type = "audio"

    # Persist MediaFile record
    media_record = MediaFile(
        original_filename=file.filename,
        stored_filename=secure_name,
        file_type=file_type,
        file_size=file_size,
        file_hash=file_hash,
        duration=0.0
    )
    db.add(media_record)
    db.flush()

    # Create associated AnalysisJob
    job = AnalysisJob(
        media_id=media_record.id,
        status="PENDING",
        current_stage="Uploaded",
        progress=0,
        stage_logs=[{
            "stage": "Ingestion",
            "progress": 0,
            "timestamp": "00:00:00",
            "message": f"Media ingested securely ({file_size} bytes, SHA-256: {file_hash[:16]}...)"
        }]
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    db.refresh(media_record)

    # Record in digital forensics Chain of Custody
    audit_service.log_event(
        db,
        event_type="UPLOAD",
        action=f"Ingested media asset '{file.filename}' ({file_size} bytes, type={file_type}) with SHA-256 digest {file_hash[:16]}...",
        investigation_id=job.id,
        file_hash=file_hash,
        status="SUCCESS",
        details={
            "original_filename": file.filename,
            "file_size": file_size,
            "file_type": file_type,
            "sha256": file_hash
        },
        actor="Forensic Ingestion Gateway"
    )

    logger.info(f"Uploaded {file.filename} -> {secure_name} (Job: {job.id}, Hash: {file_hash[:8]})")

    return MediaUploadResponse(
        analysis_id=job.id,
        media=MediaFileResponse(
            id=media_record.id,
            original_filename=media_record.original_filename,
            stored_filename=media_record.stored_filename,
            file_type=media_record.file_type,
            file_size=media_record.file_size,
            file_hash=media_record.file_hash,
            duration=media_record.duration,
            upload_timestamp=media_record.upload_timestamp
        ),
        message="Media file uploaded and registered in Chain of Custody successfully."
    )
