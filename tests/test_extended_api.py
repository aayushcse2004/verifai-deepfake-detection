import os
import io
import pytest
import numpy as np
from scipy.io import wavfile
from fastapi import UploadFile
from backend.app.database.session import SessionLocal
from backend.app.models import init_db
from backend.app.api.v1.endpoints.system import get_system_monitor
from backend.app.api.v1.endpoints.models_registry import list_models, run_model_diagnostic
from backend.app.api.v1.endpoints.evaluation import get_benchmarks
from backend.app.api.v1.endpoints.audit import get_audit_trail, verify_file_custody
from backend.app.api.v1.endpoints.comparison import compare_two_media_assets
from backend.app.api.v1.endpoints.analysis import cancel_analysis, retry_analysis


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
    # Test getting audit trail
    logs = get_audit_trail(limit=10, offset=0, db=db)
    assert "total" in logs
    assert "items" in logs

    # Test verify hash with dummy hash
    verify_res = verify_file_custody(file=None, claimed_hash="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", db=db)
    assert "verified" in verify_res
    assert verify_res["verified"] is False # Dummy hash should not match


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
