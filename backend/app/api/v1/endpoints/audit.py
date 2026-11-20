import os
import shutil
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.audit import AuditLog
from backend.app.models.media import MediaFile
from backend.app.models.analysis import AnalysisJob
from backend.app.services.audit_service import audit_service
from backend.app.core.security import calculate_sha256
from backend.app.core.config import settings

router = APIRouter()


@router.get("/logs")
def get_audit_trail(
    limit: int = 100,
    offset: int = 0,
    event_type: Optional[str] = None,
    investigation_id: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Retrieve immutable audit logs tracking digital forensics chain of custody."""
    logs = audit_service.get_logs(
        db, limit=limit, offset=offset, event_type=event_type, investigation_id=investigation_id
    )
    total_count = db.query(AuditLog).count()

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "event_type": log.event_type,
                "investigation_id": log.investigation_id,
                "file_hash": log.file_hash,
                "actor": log.actor,
                "action": log.action,
                "status": log.status,
                "details": log.details,
                "previous_hash": log.previous_hash,
                "entry_hash": log.entry_hash
            }
            for log in logs
        ]
    }


@router.get("/verify-chain")
def verify_audit_hash_chain(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Cryptographically verify the entire chain of custody audit trail.
    Ensures sequential integrity using SHA-256 hash chaining across all recorded forensic operations.
    """
    result = audit_service.verify_chain(db)
    return result


@router.post("/verify")
def verify_file_custody(
    file: Optional[UploadFile] = File(None),
    claimed_hash: Optional[str] = Form(None),
    investigation_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Cryptographically verify file integrity against recorded Chain of Custody.
    Accepts an uploaded file to compute live SHA-256 or an explicitly claimed hash string.
    """
    clean_claimed_hash = claimed_hash if isinstance(claimed_hash, str) else None
    clean_inv_id = investigation_id if isinstance(investigation_id, str) else None

    if not file and not clean_claimed_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either an uploaded file or a claimed SHA-256 digest."
        )

    calculated_hash = None
    if file:
        temp_path = os.path.join(settings.UPLOAD_DIR, f"verify_{file.filename}")
        try:
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            calculated_hash = calculate_sha256(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    else:
        calculated_hash = clean_claimed_hash.strip().lower()

    # Search in database for matching media
    query = db.query(MediaFile).filter(MediaFile.file_hash == calculated_hash)
    if clean_inv_id:
        query = query.join(AnalysisJob).filter(AnalysisJob.id == clean_inv_id)

    matched_media = query.first()

    matched_job = None
    if matched_media and matched_media.jobs:
        matched_job = matched_media.jobs[0]

    verified = matched_media is not None

    # Log this verification action in Audit Trail
    audit_service.log_event(
        db,
        event_type="HASH_VERIFIED",
        action=f"Cryptographic hash integrity verification performed for digest {calculated_hash[:12]}...",
        investigation_id=matched_job.id if matched_job else clean_inv_id,
        file_hash=calculated_hash,
        status="SUCCESS" if verified else "WARNING",
        details={
            "hash_matched": verified,
            "filename": matched_media.original_filename if matched_media else (file.filename if file else "Manual Hash Entry"),
            "media_id": matched_media.id if matched_media else None
        },
        actor="Forensic Examiner / Auditor"
    )

    return {
        "verified": verified,
        "computed_sha256": calculated_hash,
        "matched_record": {
            "media_id": matched_media.id,
            "original_filename": matched_media.original_filename,
            "file_size": matched_media.file_size,
            "upload_timestamp": matched_media.upload_timestamp.isoformat(),
            "investigation_id": matched_job.id if matched_job else None,
            "status": matched_job.status if matched_job else None
        } if matched_media else None,
        "assessment": (
            "INTEGRITY VERIFIED: SHA-256 digest strictly matches chain of custody database records."
            if verified else
            "UNVERIFIED: No registered forensic asset with this SHA-256 digest was found in the chain of custody."
        )
    }
