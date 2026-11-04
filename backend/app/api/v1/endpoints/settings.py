from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database.session import get_db
from backend.app.models.analysis import AnalysisJob
from backend.app.schemas.settings import SystemSettingsResponse, SettingsUpdateRequest
from backend.app.core.config import settings

router = APIRouter()


@router.get("", response_model=SystemSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    total = db.query(func.count(AnalysisJob.id)).scalar() or 0
    return SystemSettingsResponse(
        max_upload_size_mb=settings.MAX_UPLOAD_SIZE_MB,
        allowed_extensions=settings.ALLOWED_EXTENSIONS,
        device=settings.DEVICE,
        whisper_model=settings.WHISPER_MODEL,
        weight_facial=settings.WEIGHT_FACIAL,
        weight_lip_sync=settings.WEIGHT_LIP_SYNC,
        weight_active_speaker=settings.WEIGHT_ACTIVE_SPEAKER,
        weight_audio=settings.WEIGHT_AUDIO,
        total_analyses=total,
        system_status="operational"
    )


@router.put("", response_model=SystemSettingsResponse)
def update_settings(update_data: SettingsUpdateRequest, db: Session = Depends(get_db)):
    if update_data.max_upload_size_mb is not None:
        settings.MAX_UPLOAD_SIZE_MB = update_data.max_upload_size_mb
    if update_data.weight_facial is not None:
        settings.WEIGHT_FACIAL = update_data.weight_facial
    if update_data.weight_lip_sync is not None:
        settings.WEIGHT_LIP_SYNC = update_data.weight_lip_sync
    if update_data.weight_active_speaker is not None:
        settings.WEIGHT_ACTIVE_SPEAKER = update_data.weight_active_speaker
    if update_data.weight_audio is not None:
        settings.WEIGHT_AUDIO = update_data.weight_audio

    total = db.query(func.count(AnalysisJob.id)).scalar() or 0
    return SystemSettingsResponse(
        max_upload_size_mb=settings.MAX_UPLOAD_SIZE_MB,
        allowed_extensions=settings.ALLOWED_EXTENSIONS,
        device=settings.DEVICE,
        whisper_model=settings.WHISPER_MODEL,
        weight_facial=settings.WEIGHT_FACIAL,
        weight_lip_sync=settings.WEIGHT_LIP_SYNC,
        weight_active_speaker=settings.WEIGHT_ACTIVE_SPEAKER,
        weight_audio=settings.WEIGHT_AUDIO,
        total_analyses=total,
        system_status="operational"
    )
