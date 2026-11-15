# VerifAI Backend: Multimodal Media Forensics Engine

The backend for **VerifAI** is a high-performance asynchronous API and forensics processing service built on Python 3.11+, FastAPI, PyTorch (CUDA-accelerated), Pydantic v2, and SQLAlchemy. It orchestrates an 11-stage media forensics pipeline across computer vision, speech acoustics, lip synchronization, speaker diarization, hardware telemetry, and an immutable chain-of-custody audit trail.

---

## Directory Architecture

```
backend/
├── app/
│   ├── api/v1/                  # REST API endpoints & route groupings
│   │   ├── endpoints/
│   │   │   ├── media.py         # File ingestion, SHA-256 calculation, image/audio/video handling
│   │   │   ├── comparison.py    # Dual-asset diffing, 64-bit pHash, audio cross-correlation
│   │   │   ├── analysis.py      # Async worker execution, status, cancel/retry, PDF export
│   │   │   ├── system.py        # Real-time NVIDIA GPU & host CPU/RAM/Disk telemetry
│   │   │   ├── models_registry.py # Forensic model inventory & live diagnostic test execution
│   │   │   ├── evaluation.py    # Academic dataset benchmark metrics & confusion matrices
│   │   │   ├── audit.py         # Immutable chain-of-custody logs & SHA-256 hash verifier
│   │   │   ├── health.py        # System health & model operational status
│   │   │   └── settings.py      # Dynamic configuration & fusion weight controls
│   │   └── router.py            # Aggregated API v1 router
│   ├── core/                    # Core system infrastructure
│   │   ├── config.py            # Pydantic Settings loaded from .env (CUDA device auto-detect)
│   │   ├── security.py          # Path traversal prevention, cryptographic hashes
│   │   └── logging.py           # Structured event logging
│   ├── database/                # Persistence layer
│   │   ├── session.py           # Engine & SessionLocal (SQLite / PostgreSQL)
│   │   └── base.py              # DeclarativeBase model definitions
│   ├── models/                  # SQLAlchemy ORM entities
│   │   ├── media.py             # MediaFile schema (video, audio, static image)
│   │   ├── analysis.py          # AnalysisJob & AnalysisResult schemas
│   │   ├── evidence.py          # SpeakerSegment & EvidenceItem schemas
│   │   ├── settings.py          # SystemSetting schema
│   │   └── audit.py             # AuditLog immutable chain-of-custody schema
│   ├── schemas/                 # Pydantic v2 data transfer schemas
│   ├── ml/                      # Modular ML Adapters & Forensics Engines
│   │   ├── adapter_base.py      # Abstract Base Class for all forensic adapters
│   │   ├── face_detection/      # OpenCV Cascade & DNN face detection and spatial tracking
│   │   ├── deepfake_detection/  # CNN frequency-domain (2D-FFT) & texture analysis
│   │   ├── lip_sync/            # SyncNet audio-visual synchrony adapter
│   │   ├── active_speaker/      # TalkNet active speaker correlation adapter
│   │   ├── speaker_diarization/ # pyannote / acoustic spectral clustering
│   │   ├── speech_recognition/  # OpenAI Whisper ASR adapter
│   │   ├── audio_analysis/      # Librosa/SciPy Welch PSD & vocoder cutoff forensics
│   │   └── fusion/              # Multimodal Bayesian/heuristic fusion engine
│   ├── services/                # Business logic & background workers
│   │   ├── media_service.py     # FFmpeg audio extraction, 2D DCT pHash, OpenCV sampling
│   │   ├── comparison_service.py# Side-by-side comparative analysis service
│   │   ├── audit_service.py     # Append-only chain-of-custody audit logging
│   │   ├── analysis_worker.py   # 11-stage background pipeline coordinator
│   │   └── report_service.py    # ReportLab cryptographic PDF generator
│   └── main.py                  # FastAPI application entrypoint & static mounting
├── Dockerfile                   # Multi-stage production container
└── requirements.txt             # Pinned Python dependencies
```

---

## 11-Stage Forensic Pipeline

When an analysis job is initialized via `POST /api/v1/analysis/{analysis_id}/start`, the background worker executes sequentially through 11 forensic milestones:

```
[05%] Stage 1: File Validation & Checksum ──► Computes SHA-256 and probes container streams.
[15%] Stage 2: Audio Extraction           ──► Normalizes audio to 16kHz mono PCM WAV via FFmpeg.
[25%] Stage 3: Frame Sampling             ──► Samples video frames at 2.0 FPS into isolated storage.
[40%] Stage 4: Face Detection & Tracking  ──► OpenCV spatial tracking, candidate bounding boxes & crops.
[55%] Stage 5: Facial Manipulation CNN    ──► 2D FFT magnitude spectrum and Laplacian boundary variance.
[65%] Stage 6: SyncNet Lip-Sync Analysis  ──► Correlates mouth ROI velocity with audio energy envelope.
[75%] Stage 7: TalkNet Active Speaker     ──► Maps vocal bursts to visible facial movement concordance.
[82%] Stage 8: pyannote Diarization       ──► Clusters acoustic conversational speech turns.
[88%] Stage 9: Whisper Speech Recognition ──► Transcribes dialogue with timestamped alignment.
[92%] Stage 10: Multimodal Fusion Engine  ──► Bayesian confidence-weighted cross-modal risk synthesis.
[98%] Stage 11: Forensic PDF Generation   ──► Compiles cryptographic PDF report with SHA-256 seal.
```

---

## API Endpoints Reference

### Workspace & Media Ingestion
- `POST /api/v1/media/upload`: Ingests video, audio, or static image. Checks magic bytes, calculates SHA-256, and logs to Audit Trail.
- `POST /api/v1/media/compare`: Computes comparative diffing between two assets (SHA-256 match, 64-bit pHash Hamming distance, acoustic cross-correlation).
- `POST /api/v1/analysis/{id}/start`: Spawns async background analysis worker thread.
- `POST /api/v1/analysis/{id}/cancel`: Safely cancels an active or queued investigation.
- `POST /api/v1/analysis/{id}/retry`: Re-queues a failed or canceled investigation.
- `GET /api/v1/analysis/{id}/status`: Real-time stage progress percentage and pipeline logs.
- `GET /api/v1/analysis/{id}/results`: Full forensic payload with calibrated risk score and evidence markers.
- `GET /api/v1/analysis/history`: Paginated history with search by filename/hash and media type filter.
- `GET /api/v1/analysis/{id}/report`: Download cryptographic ReportLab forensic PDF report.
- `DELETE /api/v1/analysis/{id}`: Purges database records and cleans up stored media, frames, and PDF files.

### AI Intelligence & System Telemetry
- `GET /api/v1/system/monitor`: Live telemetry of CPU load, RAM usage, storage space, and NVIDIA GPU metrics (`NVIDIA GeForce GTX 1650`, VRAM usage, temperature).
- `GET /api/v1/models`: Central registry of all forensic models, versions, licenses, and operational modes.
- `POST /api/v1/models/{id}/test`: Executes an actual forward pass diagnostic test, reporting runtime latency and memory.
- `GET /api/v1/evaluation/benchmarks`: Standard academic dataset evaluations (FaceForensics++, DFDC, Celeb-DF, ASVspoof, FakeAVCeleb) with 2x2 confusion matrices.
- `GET /api/v1/audit/logs`: Immutable event stream tracking chain of custody.
- `POST /api/v1/audit/verify`: Attests file integrity against recorded chain-of-custody digests.
- `GET /api/v1/health`: System health and ML adapter operational states.
- `GET /api/v1/settings` & `PUT /api/v1/settings`: Dynamic multimodal weights and pipeline thresholds.

---

## Hardware Optimization & GPU Acceleration

VerifAI detects and leverages NVIDIA GPUs automatically:
- **PyTorch 2.5.1+cu121**: GPU tensor acceleration for neural network architectures.
- **VRAM Management**: Tracks memory allocation via `torch.cuda.memory_allocated()` and `nvidia-smi` queries.
- **Graceful Fallback**: If CUDA is unavailable or memory allocation fails, the system seamlessly transitions to high-performance CPU DSP pipelines.

---

## Running Backend Tests

Run the comprehensive 15-test suite:
```bash
.\.venv\Scripts\pytest.exe -v
```
All 15 tests pass in ~9 seconds covering endpoints, ML adapters, GPU monitoring, audit logging, and PDF generation.
