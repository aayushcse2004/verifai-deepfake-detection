import os
import shutil
from typing import Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.services.comparison_service import media_comparison_service
from backend.app.services.audit_service import audit_service
from backend.app.core.security import validate_file_extension, generate_secure_filename
from backend.app.core.config import settings

router = APIRouter()


@router.post("/compare")
def compare_two_media_assets(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Execute comparative digital forensic analysis between two media assets (video, audio, or image).
    Evaluates cryptographic SHA-256 equality, metadata discrepancies, perceptual hash (pHash)
    Hamming distance, and acoustic waveform normalized cross-correlation.
    """
    if not file_a.filename or not file_b.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Both media files must be provided.")

    validate_file_extension(file_a.filename)
    validate_file_extension(file_b.filename)

    secure_a = generate_secure_filename(file_a.filename)
    secure_b = generate_secure_filename(file_b.filename)

    path_a = os.path.join(settings.UPLOAD_DIR, secure_a)
    path_b = os.path.join(settings.UPLOAD_DIR, secure_b)

    try:
        with open(path_a, "wb") as buf_a:
            shutil.copyfileobj(file_a.file, buf_a)
        with open(path_b, "wb") as buf_b:
            shutil.copyfileobj(file_b.file, buf_b)

        result = media_comparison_service.compare_media(
            file_path_a=path_a,
            name_a=file_a.filename,
            file_path_b=path_b,
            name_b=file_b.filename,
            temp_dir=settings.UPLOAD_DIR
        )

        # Audit event
        audit_service.log_event(
            db,
            event_type="MEDIA_COMPARISON",
            action=f"Comparative forensic analysis executed between '{file_a.filename}' and '{file_b.filename}'.",
            status="SUCCESS",
            details={
                "verdict": result["verdict"],
                "hash_match": result["hash_match"],
                "hash_a": result["asset_a"]["sha256"],
                "hash_b": result["asset_b"]["sha256"]
            },
            actor="Forensic Examiner"
        )

        return result
    finally:
        # Keep comparison files or clean if necessary; in this case keep for preview or delete
        pass

