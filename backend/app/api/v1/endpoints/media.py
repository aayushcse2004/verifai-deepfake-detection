import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.media import MediaFile
from backend.app.models.analysis import AnalysisJob
from backend.app.schemas.media import MediaUploadResponse, MediaFileResponse
from backend.app.core.config import settings
from backend.app.core.security import validate_file_extension, generate_secure_filename, calculate_sha256
from backend.app.core.logging import logger

router = APIRouter()


@router.post("/upload", response_model=MediaUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_media(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Securely upload media file (video or audio), validate format and size,
    compute SHA-256 digest, and initialize an AnalysisJob.
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
    except HTTPException:
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
    video_exts = {"mp4", "mov", "avi", "mkv"}
    file_type = "video" if ext in video_exts else "audio"

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
    job_record = AnalysisJob(
        media_id=media_record.id,
        status="PENDING",
        current_stage="Uploaded",
        progress=0,
        stage_logs=[{
            "stage": "Upload",
            "progress": 0,
            "timestamp": "00:00:00",
            "message": f"File '{file.filename}' uploaded successfully ({file_size / (1024*1024):.2f} MB)."
        }]
    )
    db.add(job_record)
    db.commit()
    db.refresh(media_record)
    db.refresh(job_record)

    logger.info(f"Uploaded media {media_record.id} -> Job {job_record.id}")

    return MediaUploadResponse(
        media=MediaFileResponse.model_validate(media_record),
        analysis_id=job_record.id,
        message="Media uploaded and ready for forensic analysis."
    )
