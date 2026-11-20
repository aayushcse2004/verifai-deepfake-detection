import os
import io
import tempfile
import pytest
import numpy as np
from scipy.io import wavfile
from fastapi import UploadFile, HTTPException

from backend.app.database.session import SessionLocal
from backend.app.models import init_db
from backend.app.models.audit import AuditLog
from backend.app.api.v1.endpoints.system import get_system_monitor, trigger_storage_cleanup
from backend.app.api.v1.endpoints.models_registry import list_models, run_model_diagnostic
from backend.app.api.v1.endpoints.evaluation import get_benchmarks
from backend.app.api.v1.endpoints.audit import get_audit_trail, verify_file_custody, verify_audit_hash_chain
from backend.app.api.v1.endpoints.comparison import compare_two_media_assets
from backend.app.core.security import validate_file_signature
from backend.app.services.audit_service import audit_service
from backend.app.services.cleanup_service import cleanup_service
from backend.app.ml.deepfake_detection.detector import deepfake_cnn_detector, Meso4
from backend.app.ml.lip_sync.syncnet_detector import syncnet_detector, SyncNetMini


@pytest.fixture(autouse=True)
def setup_database():
    init_db()


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_system_monitor(db):
    res = get_system_monitor(db=db)
    assert res["status"] == "healthy"
    assert "cpu" in res and "utilization_pct" in res["cpu"]
    assert "memory" in res and "total_gb" in res["memory"]
    assert "disk" in res and "free_gb" in res["disk"]
    assert "gpu" in res
    assert "workload" in res


def test_models_registry():
    models = list_models()
    assert len(models) >= 6
    ids = [m["id"] for m in models]
    assert "deepfake_cnn" in ids
    assert "syncnet" in ids
    assert "audio_forensics" in ids

    # Test diagnostic execution
    diag = run_model_diagnostic("deepfake_cnn")
    assert diag["status"] == "PASSED"
    assert "latency_ms" in diag


def test_evaluation_benchmarks():
    data = get_benchmarks()
    assert "datasets" in data
    assert len(data["datasets"]) >= 4
    ff = next((d for d in data["datasets"] if d["id"] == "ff_plus_plus"), None)
    assert ff is not None
    assert ff["metrics"]["accuracy"] > 0.90


def test_audit_trail_and_verify(db):
    logs = get_audit_trail(limit=10, offset=0, db=db)
    assert "total" in logs
    assert "items" in logs

    verify_res = verify_file_custody(file=None, claimed_hash="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", db=db)
    assert "verified" in verify_res
    assert verify_res["verified"] is False


def test_media_comparison(db):
    sr = 16000
    t = np.linspace(0, 0.5, int(sr * 0.5), endpoint=False)
    sine = (np.sin(2 * np.pi * 440 * t) * 16384).astype(np.int16)

    bio_a = io.BytesIO()
    wavfile.write(bio_a, sr, sine)
    bio_a.seek(0)
    upload_a = UploadFile(filename="test_asset_a.wav", file=bio_a)

    bio_b = io.BytesIO()
    wavfile.write(bio_b, sr, sine)
    bio_b.seek(0)
    upload_b = UploadFile(filename="test_asset_b.wav", file=bio_b)

    res = compare_two_media_assets(file_a=upload_a, file_b=upload_b, db=db)
    assert "verdict" in res
    assert "hash_match" in res
    assert res["hash_match"] is True
    assert res["verdict"] == "BITWISE IDENTICAL"


def test_magic_byte_validation():
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        # Valid MP4 header
        f.write(b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00isommp42")
        valid_mp4_path = f.name

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        # Spoofed MP4 header (arbitrary script text)
        f.write(b"#!/bin/bash\necho 'malicious payload'\n")
        spoofed_mp4_path = f.name

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        # Valid PNG header
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR")
        valid_png_path = f.name

    try:
        assert validate_file_signature(valid_mp4_path, "mp4") is True
        assert validate_file_signature(valid_png_path, "png") is True

        with pytest.raises(HTTPException) as exc:
            validate_file_signature(spoofed_mp4_path, "mp4")
        assert exc.value.status_code == 400
    finally:
        for p in (valid_mp4_path, spoofed_mp4_path, valid_png_path):
            if os.path.exists(p):
                os.remove(p)


def test_cryptographic_audit_hash_chain(db):
    # Log several events
    e1 = audit_service.log_event(db, event_type="UPLOAD", action="Test file upload 1", file_hash="a"*64)
    e2 = audit_service.log_event(db, event_type="ANALYSIS_START", action="Test analysis start", investigation_id="inv-123")
    e3 = audit_service.log_event(db, event_type="STAGE_COMPLETE", action="Test stage complete", investigation_id="inv-123")

    assert e1 is not None and e1.entry_hash is not None
    assert e2 is not None and e2.previous_hash == e1.entry_hash
    assert e3 is not None and e3.previous_hash == e2.entry_hash

    # Verify chain integrity
    chain_check = audit_service.verify_chain(db)
    assert chain_check["valid"] is True
    assert chain_check["total_records"] >= 3

    # Test via endpoint
    api_res = verify_audit_hash_chain(db=db)
    assert api_res["valid"] is True


def test_neural_models_architecture():
    import torch
    # 1. Meso4 CNN
    assert isinstance(deepfake_cnn_detector.model, Meso4)
    assert deepfake_cnn_detector.get_operational_mode() == "active_model"

    dummy_input = torch.zeros(1, 3, 256, 256, device=deepfake_cnn_detector.device)
    with torch.no_grad():
        out = deepfake_cnn_detector.model(dummy_input)
    assert out.shape == (1, 1)
    assert 0.0 <= float(out[0, 0]) <= 1.0

    # 2. SyncNet
    assert isinstance(syncnet_detector.model, SyncNetMini)
    assert syncnet_detector.get_operational_mode() == "active_model"

    v_in = torch.zeros(1, 5, 48, 64, device=syncnet_detector.device)
    a_in = torch.zeros(1, 1, 48, 64, device=syncnet_detector.device)
    with torch.no_grad():
        corr = syncnet_detector.model(v_in, a_in)
    assert corr.shape == (1,)


def test_cleanup_retention_service(db):
    res_dry = trigger_storage_cleanup(max_age_days=30, dry_run=True, purge_orphaned_frames=True, db=db)
    assert res_dry["dry_run"] is True
    assert "purged_files_count" in res_dry
    assert "reclaimed_mb" in res_dry
