import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.database.session import get_db
from backend.app.core.config import settings

# Import ML adapters to check status
from backend.app.ml.deepfake_detection.detector import deepfake_cnn_detector
from backend.app.ml.lip_sync.syncnet_detector import syncnet_detector
from backend.app.ml.active_speaker.talknet_detector import talknet_detector
from backend.app.ml.speaker_diarization.diarizer import speaker_diarizer
from backend.app.ml.speech_recognition.transcriber import whisper_transcriber
from backend.app.ml.audio_analysis.audio_forensics import audio_forensics_detector

router = APIRouter()


@router.get("")
def health_check(db: Session = Depends(get_db)):
    """
    Check system health, database accessibility, and status of all ML adapters.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    storage_status = "healthy"
    for d in [settings.UPLOAD_DIR, settings.REPORT_DIR, settings.FRAME_DIR]:
        if not os.path.exists(d):
            storage_status = f"directory missing: {d}"
            break

    models_info = {
        "deepfake_cnn": {
            "name": deepfake_cnn_detector.name,
            "version": deepfake_cnn_detector.version,
            "operational_mode": deepfake_cnn_detector.get_operational_mode(),
            "available": deepfake_cnn_detector.is_available()
        },
        "syncnet": {
            "name": syncnet_detector.name,
            "version": syncnet_detector.version,
            "operational_mode": syncnet_detector.get_operational_mode(),
            "available": syncnet_detector.is_available()
        },
        "talknet": {
            "name": talknet_detector.name,
            "version": talknet_detector.version,
            "operational_mode": talknet_detector.get_operational_mode(),
            "available": talknet_detector.is_available()
        },
        "speaker_diarization": {
            "name": speaker_diarizer.name,
            "version": speaker_diarizer.version,
            "operational_mode": speaker_diarizer.get_operational_mode(),
            "available": speaker_diarizer.is_available()
        },
        "whisper_asr": {
            "name": whisper_transcriber.name,
            "version": whisper_transcriber.version,
            "operational_mode": whisper_transcriber.get_operational_mode(),
            "available": whisper_transcriber.is_available()
        },
        "audio_forensics": {
            "name": audio_forensics_detector.name,
            "version": audio_forensics_detector.version,
            "operational_mode": audio_forensics_detector.get_operational_mode(),
            "available": audio_forensics_detector.is_available()
        }
    }

    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "database": db_status,
        "storage": storage_status,
        "device": settings.DEVICE,
        "models": models_info
    }
