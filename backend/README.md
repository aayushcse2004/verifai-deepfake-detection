# VerifAI Backend: Multimodal Media Forensics Engine

The backend for **VerifAI** is a high-performance asynchronous API and forensics processing service built on Python 3.11+, FastAPI, Pydantic v2, and SQLAlchemy. It orchestrates an 11-stage media forensics pipeline across computer vision, speech acoustics, lip synchronization, and speaker diarization.

---

## Architecture Overview

```
backend/
├── app/
│   ├── api/v1/                  # REST API endpoints & route groupings
│   │   ├── endpoints/
│   │   │   ├── media.py         # File ingestion, SHA-256 calculation, validation
│   │   │   ├── analysis.py      # Async worker execution, status polling, results, PDF export
│   │   │   ├── health.py        # System health & model operational status
│   │   │   └── settings.py      # Dynamic configuration & fusion weight controls
│   │   └── router.py            # API v1 aggregated router
│   ├── core/                    # Core system infrastructure
│   │   ├── config.py            # Pydantic Settings loaded from .env
│   │   ├── security.py          # Path traversal prevention, cryptographic hashes
│   │   └── logging.py           # Structured event logging
│   ├── database/                # Persistence layer
│   │   ├── session.py           # Engine & SessionLocal (SQLite / PostgreSQL)
│   │   └── base.py              # DeclarativeBase model definitions
│   ├── models/                  # SQLAlchemy ORM entities
│   │   ├── media.py             # MediaFile schema
│   │   ├── analysis.py          # AnalysisJob & AnalysisResult schemas
│   │   ├── evidence.py          # SpeakerSegment & EvidenceItem schemas
│   │   └── settings.py          # SystemSetting schema
│   ├── schemas/                 # Pydantic v2 data transfer schemas
│   │   ├── media.py
│   │   ├── analysis.py
│   │   ├── forensics.py
│   │   └── settings.py
│   ├── ml/                      # Modular ML Adapters & Forensics Engines
│   │   ├── adapter_base.py      # Abstract Base Class for all forensic adapters
│   │   ├── face_detection/      # OpenCV Haar & DNN face detection and tracking
│   │   ├── deepfake_detection/  # CNN frequency-domain (2D-FFT) & texture analysis
│   │   ├── lip_sync/            # SyncNet audio-visual synchrony adapter
│   │   ├── active_speaker/      # TalkNet active speaker correlation adapter
│   │   ├── speaker_diarization/ # pyannote / acoustic spectral clustering
│   │   ├── speech_recognition/  # OpenAI Whisper ASR adapter
│   │   ├── audio_analysis/      # Librosa/SciPy Welch PSD & splice forensics
│   │   └── fusion/              # Multimodal Bayesian/heuristic fusion engine
│   ├── services/                # Background business logic
│   │   ├── media_service.py     # FFmpeg audio extraction & OpenCV frame sampling
│   │   ├── analysis_worker.py   # 11-stage background pipeline coordinator
│   │   └── report_service.py    # ReportLab cryptographic PDF generator
│   └── main.py                  # FastAPI application entrypoint & static mounting
├── Dockerfile                   # Production container definition
└── requirements.txt             # Pinned Python dependencies
```

---

## 11-Stage Forensic Pipeline

When an analysis job is initialized via `POST /api/v1/analysis/{analysis_id}/start`, the background worker executes sequentially through 11 forensic milestones:

1. **File Validation (5%)**: Checks MIME types, extensions, and calculates cryptographic SHA-256 digests.
2. **Audio Extraction (15%)**: Isolates and normalizes audio track to 16kHz mono 16-bit PCM WAV using bundled FFmpeg.
3. **Frame Sampling (25%)**: Sequentially samples frames at 2.0 FPS to conserve RAM without full-video memory buffering.
4. **Face Detection & Tracking (40%)**: Detects faces with OpenCV, assigns spatial track IDs across timestamps, and extracts crops.
5. **Facial Manipulation Analysis (55%)**: Evaluates 2D-FFT high-frequency residuals, Laplacian variance, and YCrCb chrominance consistency.
6. **Lip-Sync Analysis (65%)**: SyncNet cross-correlates mouth ROI optical motion velocity against speech acoustic energy.
7. **Active Speaker Detection (75%)**: TalkNet associates vocal bursts with visible facial movement across multi-subject scenes.
8. **Speaker Diarization (82%)**: Segments multi-speaker conversational turns (`SPEAKER_00`, `SPEAKER_01`).
9. **Speech Recognition (88%)**: Transcribes spoken dialogue with timestamped alignment using OpenAI Whisper.
10. **Acoustic Forensics & Fusion (95%)**: Welch PSD analysis, vocoder cutoff detection, and cross-modal evidence synthesis.
11. **Report Generation (100%)**: Compiles a court-grade PDF verification document via ReportLab.

---

## REST API Reference

### Media Ingestion
- `POST /api/v1/media/upload`
  - Accepts: `multipart/form-data` with `file`
  - Supported: MP4, MOV, AVI, MKV, WAV, MP3, M4A (up to 250MB)
  - Returns: Media metadata and generated `analysis_id`

### Analysis Pipeline
- `POST /api/v1/analysis/{id}/start`
  - Launches async worker execution thread
- `GET /api/v1/analysis/{id}/status`
  - Returns current stage, progress percentage (0-100%), and live log events
- `GET /api/v1/analysis/{id}/results`
  - Returns complete forensic report payload, scores, evidence items, and transcript
- `GET /api/v1/analysis/{id}/report`
  - Streams downloadable court-grade PDF verification report
- `GET /api/v1/analysis/history`
  - Paginated list of previous media analyses (newest first)
- `DELETE /api/v1/analysis/{id}`
  - Purges analysis records, uploaded media file, extracted frames, and PDF report

### Health & Settings
- `GET /api/v1/health`
  - Operational health, DB status, storage accessibility, and adapter modes
- `GET /api/v1/settings`
  - Active fusion weights, max upload size, and hardware device
- `PUT /api/v1/settings`
  - Updates configurable weights and upload limits

---

## Setup & Running Locally

### 1. Initialize Virtual Environment
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

### 2. Run Database Migrations / Table Initialization
Database tables are automatically created on backend startup via `backend/app/models/init_db()`.

### 3. Launch the Backend Server
```powershell
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive API Documentation (Swagger): `http://127.0.0.1:8000/docs`
- Alternative Documentation (ReDoc): `http://127.0.0.1:8000/redoc`

---

## Running Automated Backend Tests

```powershell
.\.venv\Scripts\pytest.exe -v
```

The test suite covers:
- `tests/test_api.py`: Upload validation, size limits, health checks, settings updates, and full pipeline lifecycle.
- `tests/test_ml_pipeline.py`: Face detection on synthetic frames, deepfake artifact analysis, acoustic forensics, speaker diarization, multimodal fusion engine classification, and PDF generation.
