import os
import tempfile
import numpy as np
import cv2
from scipy.io import wavfile
import pytest

from backend.app.ml.face_detection.face_detector import FaceDetector
from backend.app.ml.deepfake_detection.detector import DeepfakeCnnDetector
from backend.app.ml.lip_sync.syncnet_detector import SyncNetDetector
from backend.app.ml.active_speaker.talknet_detector import TalkNetDetector
from backend.app.ml.speaker_diarization.diarizer import SpeakerDiarizer
from backend.app.ml.speech_recognition.transcriber import WhisperTranscriber
from backend.app.ml.audio_analysis.audio_forensics import AudioForensicsDetector
from backend.app.ml.fusion.fusion_engine import MultimodalFusionEngine
from backend.app.services.report_service import ForensicReportService


def test_face_detector_synthetic_frame():
    detector = FaceDetector()
    # Blank frame - should detect 0 faces without crashing
    blank = np.zeros((300, 300, 3), dtype=np.uint8)
    dets = detector.detect_in_image(blank)
    assert isinstance(dets, list)
    assert len(dets) == 0


def test_deepfake_detector_artifact_analysis():
    detector = DeepfakeCnnDetector()
    assert detector.is_available() is True
    # Test with synthetic test patch
    test_patch = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    art = detector._analyze_frequency_artifacts(test_patch)
    assert "anomaly_score" in art
    assert "laplacian_var" in art
    assert 0.0 <= art["anomaly_score"] <= 1.0


def test_audio_forensics():
    analyzer = AudioForensicsDetector()
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sr = 16000
        t = np.linspace(0, 2.0, sr * 2, False)
        tone = (np.sin(2 * np.pi * 500 * t) * 30000).astype(np.int16)
        wavfile.write(tmp.name, sr, tone)
        tmp_path = tmp.name

    try:
        res = analyzer.analyze(tmp_path)
        assert res["status"] == "COMPLETED"
        assert res["score"] is not None
        assert "dynamic_range_db" in res["metrics"]
        assert "frequency_bands" in res["metrics"]
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_speaker_diarization():
    diarizer = SpeakerDiarizer()
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sr = 16000
        t = np.linspace(0, 3.0, sr * 3, False)
        # two different frequency tones simulating distinct voice pitches
        tone1 = np.sin(2 * np.pi * 300 * t[:sr * 1]) * 20000
        tone2 = np.sin(2 * np.pi * 800 * t[sr * 1:]) * 20000
        audio = np.concatenate([tone1, tone2]).astype(np.int16)
        wavfile.write(tmp.name, sr, audio)
        tmp_path = tmp.name

    try:
        res = diarizer.analyze(tmp_path)
        assert res["status"] == "COMPLETED"
        assert len(res["segments"]) >= 1
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_multimodal_fusion_engine():
    engine = MultimodalFusionEngine()

    # Scenario 1: Low manipulation evidence
    low_res = engine.fuse(
        facial_result={"score": 0.15, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
        lip_sync_result={"score": 0.12, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
        active_speaker_result={"score": 0.10, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
        audio_result={"score": 0.18, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
        diarization_result={"status": "COMPLETED", "confidence": 0.8, "segments": []},
        asr_result={"status": "COMPLETED", "confidence": 0.8, "segments": []}
    )
    assert low_res["overall_assessment"] == MultimodalFusionEngine.LABEL_LOW
    assert low_res["overall_score"] < 0.38

    # Scenario 2: High manipulation evidence
    high_res = engine.fuse(
        facial_result={
            "score": 0.88,
            "confidence": 0.9,
            "status": "COMPLETED",
            "evidence": [{"timestamp": 1.2, "evidence_type": "facial_manipulation", "description": "Border artifact", "score": 0.88}]
        },
        lip_sync_result={"score": 0.75, "confidence": 0.85, "status": "COMPLETED", "evidence": []},
        active_speaker_result={"score": 0.70, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
        audio_result={"score": 0.65, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
        diarization_result={"status": "COMPLETED", "confidence": 0.8, "segments": []},
        asr_result={"status": "COMPLETED", "confidence": 0.8, "segments": []}
    )
    assert high_res["overall_assessment"] == MultimodalFusionEngine.LABEL_HIGH
    assert high_res["overall_score"] >= 0.62
    assert len(high_res["evidence_items"]) == 1


def test_pdf_report_generation():
    reporter = ForensicReportService()
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        pdf_path = tmp.name

    try:
        engine = MultimodalFusionEngine()
        fusion = engine.fuse(
            facial_result={"score": 0.22, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
            lip_sync_result={"score": 0.18, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
            active_speaker_result={"score": 0.15, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
            audio_result={"score": 0.20, "confidence": 0.8, "status": "COMPLETED", "evidence": []},
            diarization_result={"status": "COMPLETED", "confidence": 0.8, "segments": []},
            asr_result={"status": "COMPLETED", "confidence": 0.8, "segments": []}
        )

        res_path = reporter.generate_pdf(
            output_pdf_path=pdf_path,
            media_info={"original_filename": "test.mp4", "file_hash": "a1b2c3d4", "file_size": 1024, "duration": 4.5, "file_type": "video"},
            job_info={"id": "test-uuid-1234"},
            fusion_result=fusion,
            segments=[{"speaker_id": "SPEAKER_00", "start_time": 0.0, "end_time": 4.5, "transcript": "Hello forensic test"}],
            transcription="Hello forensic test"
        )
        assert os.path.exists(res_path)
        assert os.path.getsize(res_path) > 1000
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

