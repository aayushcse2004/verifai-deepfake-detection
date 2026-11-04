import io
import os
import pytest
from fastapi import UploadFile
from backend.app.database.session import SessionLocal
from backend.app.api.v1.endpoints.health import health_check
from backend.app.api.v1.endpoints.settings import get_settings, update_settings
from backend.app.api.v1.endpoints.media import upload_media
from backend.app.api.v1.endpoints.analysis import (
    get_analysis_status,
    get_analysis_history,
    get_analysis_results,
    delete_analysis
)
from backend.app.services.analysis_worker import analysis_worker
from backend.app.schemas.settings import SettingsUpdateRequest
from backend.app.core.security import validate_file_extension


def test_health_endpoint():
    db = SessionLocal()
    try:
        res = health_check(db)
        assert res["status"] == "online"
        assert res["database"] == "healthy"
        assert res["storage"] == "healthy"
        assert "deepfake_cnn" in res["models"]
        assert "syncnet" in res["models"]
        assert "talknet" in res["models"]
        assert "speaker_diarization" in res["models"]
        assert "whisper_asr" in res["models"]
        assert "audio_forensics" in res["models"]
    finally:
        db.close()


def test_settings_endpoints():
    db = SessionLocal()
    try:
        # GET settings
        curr = get_settings(db)
        assert curr.max_upload_size_mb >= 50
        assert "mp4" in curr.allowed_extensions

        # PUT settings
        req = SettingsUpdateRequest(weight_facial=0.40, weight_lip_sync=0.20)
        updated = update_settings(req, db)
        assert updated.weight_facial == 0.40
        assert updated.weight_lip_sync == 0.20
    finally:
        db.close()


def test_upload_invalid_extension():
    with pytest.raises(Exception) as exc_info:
        validate_file_extension("malware.exe")
    assert "Unsupported file extension" in str(exc_info.value)


def test_upload_and_pipeline_lifecycle():
    import numpy as np
    from scipy.io import wavfile

    sr = 16000
    duration = 1.0
    t = np.linspace(0, duration, int(sr * duration), False)
    audio_data = (np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)

    wav_io = io.BytesIO()
    wavfile.write(wav_io, sr, audio_data)
    wav_io.seek(0)

    # Wrap in FastAPI UploadFile
    upload_file = UploadFile(
        file=wav_io,
        filename="test_upload_sample.wav",
        headers={"content-type": "audio/wav"}
    )

    db = SessionLocal()
    try:
        # 1. Upload
        res = upload_media(upload_file, db)
        analysis_id = res.analysis_id
        assert analysis_id is not None
        assert res.media.original_filename == "test_upload_sample.wav"
        assert res.media.file_type == "audio"

        # 2. Status initially PENDING
        status = get_analysis_status(analysis_id, db)
        assert status.status == "PENDING"
        assert status.progress == 0

        # 3. Check history
        hist = get_analysis_history(limit=10, offset=0, db=db)
        assert any(item.id == analysis_id for item in hist)

        # 4. Execute 11-stage pipeline synchronously
        analysis_worker.run_pipeline(analysis_id)

        # 5. Check completion status
        db.expire_all()
        completed_status = get_analysis_status(analysis_id, db)
        assert completed_status.status == "COMPLETED"
        assert completed_status.progress == 100

        # 6. Check results
        results = get_analysis_results(analysis_id, db)
        assert results.overall_assessment in [
            "LOW EVIDENCE OF MANIPULATION",
            "INCONCLUSIVE",
            "POTENTIAL MANIPULATION DETECTED"
        ]
        assert results.overall_score is not None

        # 7. Clean up
        del_res = delete_analysis(analysis_id, db)
        assert "deleted successfully" in del_res["message"]
    finally:
        db.close()
