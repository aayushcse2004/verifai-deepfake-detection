# VerifAI – Multimodal Deepfake Detection & Digital Forensics Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.5.1+cu121-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org)
[![CUDA](https://img.shields.io/badge/CUDA-12.1%2F12.7-76B900?logo=nvidia&logoColor=white)](https://developer.nvidia.com/cuda-toolkit)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-brightgreen?logo=pytest&logoColor=white)](tests/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**VerifAI** is an advanced, production-grade digital media verification and multimodal deepfake forensics platform. Engineered for cybersecurity researchers, digital forensics examiners, intelligence analysts, and academic evaluators, VerifAI combines computer vision, acoustic forensics, speech recognition, active speaker concordance, and lip synchronization into a calibrated, evidence-based risk assessment engine with an immutable, sequential cryptographic chain of custody.

---

## Table of Contents

1. [Documentation Map](#1-documentation-map)
2. [Forensic Navigation & Core Workspace Views](#2-forensic-navigation--core-workspace-views)
3. [Digital Forensics Design System & Shell Architecture](#3-digital-forensics-design-system--shell-architecture)
4. [End-to-End Multimodal Forensic Pipeline](#4-end-to-end-multimodal-forensic-pipeline)
5. [Neural Architectures & Signal Processing Engine](#5-neural-architectures--signal-processing-engine)
6. [Cryptographic Chain of Custody & Security Hardening](#6-cryptographic-chain-of-custody--security-hardening)
7. [Hardware Acceleration & System Telemetry](#7-hardware-acceleration--system-telemetry)
8. [Complete REST API Specification](#8-complete-rest-api-specification)
9. [Quickstart & Installation Guide](#9-quickstart--installation-guide)
10. [Automated Verification & Test Suite](#10-automated-verification--test-suite)
11. [Academic Benchmark Evaluations](#11-academic-benchmark-evaluations)
12. [Repository Layout](#12-repository-layout)
13. [Evidentiary Principles & Legal Disclaimer](#13-evidentiary-principles--legal-disclaimer)
14. [License](#14-license)

---

## 1. Documentation Map

| Document | Purpose & Primary Focus |
| :--- | :--- |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Deep-dive into C4 system architecture, frontend layout, FastAPI gateway, ML inference pipeline, database models, and late-fusion algorithms. |
| **[SECURITY.md](SECURITY.md)** | Threat model, binary magic byte validation rules, SHA-256 hash chaining, path traversal defenses, and vulnerability disclosure protocol. |
| **[MODEL_CARDS.md](MODEL_CARDS.md)** | Formal model cards for MesoNet-4, SyncNet, TalkNet, pyannote.audio, OpenAI Whisper, and analytical DSP vocoder forensics. |
| **[BENCHMARKS.md](BENCHMARKS.md)** | Empirical benchmark evaluations across FaceForensics++, DFDC, Celeb-DF, ASVspoof, and FakeAVCeleb with hardware test specs. |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Developer onboarding guide, local environment configuration, adapter creation guide, and PR requirements. |
| **[CHANGELOG.md](CHANGELOG.md)** | Chronological record of major architectural milestones and versioned releases. |

---

## 2. Forensic Navigation & Core Workspace Views

VerifAI is organized into four distinct operational domains containing 16 purpose-built views:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERIFAI FORENSIC DOMAINS                        │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│    WORKSPACE     │  FORENSIC LABS   │ AI INTELLIGENCE  │  MANAGEMENT   │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ • Command Center │ • Video Lab      │ • Model Registry │ • Reports     │
│ • New Ingestion  │ • Audio Lab      │ • Evaluation Ctr │ • Audit Trail │
│ • Case History   │ • AV Sync Lab    │ • System Monitor │ • Settings    │
│ • Case Details   │ • Media Compare  │                  │               │
│ • Processing HUD │ • Evidence Grid  │                  │               │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### A. Workspace
- **Command Center (`/dashboard`)**: High-level telemetry, live investigation throughput, recent detection alerts, and one-click quick-launch into specialized laboratories.
- **New Investigation (`/upload`)**: Drag-and-drop ingestion of videos (`mp4, mov, avi, mkv`), audio streams (`wav, mp3, m4a`), and static images (`png, jpg, jpeg, webp`). Includes local SHA-256 pre-calculation and 4 pre-configured research benchmark scenarios with synthesized in-browser audio streams.
- **Investigation Telemetry (`/processing/:id`)**: Live 11-stage pipeline tracking with real-time log terminal, elapsed execution timer, and job cancellation/retry capabilities.
- **Investigation Details (`/results/:id`)**: Multi-gauge radar visualization, calibrated overall risk score, 5-tab evidence deep dive, raw forensic JSON export, and ReportLab PDF document generation.
- **Investigation History (`/history`)**: Filterable ledger of past cases with search by filename/hash, media type filters, and deletion with cascading disk cleanup.

### B. Forensic Laboratories
- **Video Forensics Lab (`/lab/video`)**: Interactive video player with sub-frame precision navigation ($-1$, $+1$ frame), variable speed playback ($0.25\times - 2\times$), suspicious keyframe markers, live face crop filmstrip, and face bounding box tracking overlays synchronized to the underlying video stream.
- **Audio Forensics Lab (`/lab/audio`)**: Welch Power Spectral Density (PSD) frequency distribution, 16kHz resampled waveform visualizer, OpenAI Whisper speech transcription, neural vocoder cutoff detection, and an embedded HTML5 audio player streaming the extracted 16kHz PCM WAV.
- **Audio-Visual Synchronization Lab (`/lab/sync`)**: Synchronized multi-track inspection correlating mouth-region optical flow velocity (SyncNet ROI) with acoustic RMS energy envelopes, pyannote speaker turn intervals, and a live synchronized playback stream.
- **Media Comparison Lab (`/lab/compare`)**: Side-by-side dual-asset forensic diffing evaluating cryptographic SHA-256 match, 64-bit Perceptual Hash (pHash) Hamming distance, and acoustic waveform normalized cross-correlation.
- **Evidence Explorer (`/evidence`)**: Searchable data grid of timestamped forensic anomalies with modality filters, score threshold sliders, and Explainable AI finding drawers.

### C. AI Intelligence
- **Model Registry (`/models`)**: Inventory of all forensic adapters, architectures, licenses, checkpoint availability, compute targets (CUDA/CPU), and a live diagnostic test runner that executes real forward passes to measure latency and VRAM footprint.
- **Model Evaluation Center (`/evaluation`)**: Transparent academic benchmark center reporting empirical metrics across standardized forensic datasets (FaceForensics++, DFDC, Celeb-DF, ASVspoof, FakeAVCeleb) with 2x2 confusion matrices, ROC-AUC, and latency.
- **System & GPU Monitor (`/system`)**: Real-time telemetry reporting NVIDIA GPU name (`NVIDIA GeForce GTX 1650`), VRAM utilization, GPU compute load, host CPU percentage, memory footprint, and disk volume headroom with one-click retention cleanup.

### D. Management
- **Forensic Reports Repository (`/reports`)**: Central document vault to view metadata, verified SHA-256 digests, and download court/investigation-grade PDF reports.
- **Chain of Custody & Audit Trail (`/audit`)**: Append-only event ledger logging ingestion, analysis runs, hash verification, and deletions. Features both single-asset SHA-256 verification and sequential cryptographic hash-chain verification (`verify-chain`).
- **System Settings (`/settings`)**: Configurable multimodal risk weights, file size caps, device selection (CUDA/CPU), and Whisper model tiers.

---

## 3. Digital Forensics Design System & Shell Architecture

The VerifAI frontend is built with **React 19**, **TypeScript**, and **Tailwind CSS v4**, strictly following an enterprise digital forensics design system:

### A. Color Palette & Visual Hierarchy
- **Canvas Base**: Deep obsidian/charcoal navy (`#070A13` / `#080D18`).
- **Surfaces & Cards**: Elevated dark panels (`#0E1424`) with subtle borders (`#1E293B`).
- **Primary Accent**: Electric Blue (`#6366F1`) for primary actions, focus states, and vision metrics.
- **Secondary Accent**: Forensic Cyan (`#06B6D4`) for acoustic indicators, active hashes, and live telemetry.
- **Status Indicators**: Restrained Emerald (`#22C55E`) for authentic media; Warning Amber (`#F59E0B`) for anomalies; Controlled Crimson (`#EF4444`) for high-confidence manipulation.
- **Typography**: Inter/system sans for clean UI hierarchy; tabular monospace (`font-mono`) for SHA-256 hashes, timestamps, timecodes, frequencies, and confidence scores.

### B. Common Component Suite (`frontend/src/components/common/`)
- `PageHeader`: Unified header with title, subtitle, icon pill, breadcrumb trail, and contextual action buttons.
- `Breadcrumbs`: Automatic route-level breadcrumbs supporting `to` and `href` links.
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`: High-contrast dark containers with subtle borders.
- `MetricCard`: KPI display with tabular numerals, status badges, trend markers, and accent colors.
- `Badge`: Variant-styled pills (`primary`, `secondary`, `accent`, `cyan`, `success`, `warning`, `danger`, `neutral`, `outline`).
- `Button`: Primary, secondary, accent, outline, ghost, and danger buttons with integrated loading spinners (`isLoading`, `loading`).
- `Modal`: Accessible backdrop-blurred modal dialogs with keyboard `ESC` dismissal.
- `Tabs`: Accessible tab switchers with badge counters.
- `Skeleton`, `TableSkeleton`: Non-blocking loading state placeholders.
- `EmptyState`: Contextual empty states with clear calls-to-action.
- `ErrorState`: Failure notices with retry callbacks.
- `ToastContext`: Global notification system (`showToast`, `addToast`) for asynchronous operations.

### C. Application Shell (`frontend/src/layouts/`)
- `Sidebar`: 4-section collapsible navigation bar with live CUDA hardware pill and collapse toggle.
- `TopNav`: Quick global search trigger (`Ctrl+K`), live backend status badge with ping latency, and quick upload action.
- `CommandPalette`: Keyboard-navigable quick switcher (`Ctrl+K` or `⌘K`) to jump instantly to any of the 16 views.
- `AppLayout`: High-performance shell combining Sidebar, TopNav, Toasts, CommandPalette, and content outlet.

---

## 4. End-to-End Multimodal Forensic Pipeline

```mermaid
flowchart TD
    subgraph Ingestion ["1. Media Ingestion & Validation"]
        F1[Upload Media: Video / Audio / Image] --> F2[SHA-256 Checksum Calculation]
        F2 --> F3[File Signature & Binary Magic Byte Validation]
        F3 --> F4[Append-Only Hash-Chained Audit Block]
    end

    subgraph Preprocessing ["2. Stream Extraction & Sampling"]
        F4 --> P1[FFmpeg Audio Normalization: 16kHz PCM WAV]
        F4 --> P2[OpenCV Sequential Frame Sampling @ 2 FPS]
        F4 --> P3[2D DCT Perceptual Hashing: 64-bit pHash]
    end

    subgraph Adapters ["3. Multimodal Forensic Analysis Modules (CUDA 12.1)"]
        P2 --> M1[OpenCV Face Detector & Spatial Tracker]
        M1 --> M2[MesoNet-4 CNN + 2D FFT & Laplacian Residuals]
        M1 & P1 --> M3[SyncNet AV Cross-Modal Correlator]
        M1 & P1 --> M4[TalkNet Active Speaker Concordance]
        P1 --> M5[pyannote Speaker Diarization]
        P1 --> M6[OpenAI Whisper ASR Transcription]
        P1 --> M7[Acoustic Spectral & Vocoder Forensics]
    end

    subgraph FusionEngine ["4. Evidence Synthesis & Reporting"]
        M2 & M3 & M4 & M5 & M6 & M7 --> FUS[Multimodal Late-Fusion Engine]
        FUS --> OUT1[Calibrated Risk Score: 0.0 - 1.0]
        FUS --> OUT2[Forensic Verdict: Genuine / Inconclusive / Manipulated]
        FUS --> OUT3[Audit Trail Event: STAGE_COMPLETE]
        FUS --> OUT4[ReportLab Cryptographic PDF Generation]
    end
```

---

## 5. Neural Architectures & Signal Processing Engine

### A. MesoNet-4 Facial Manipulation CNN
- **Architecture**: 4 convolutional blocks with batch normalization, max pooling, and dropout ($0.5$).
- **Frequency Domain Analysis**: Incorporates 2D Fast Fourier Transform (FFT) magnitude spectrum analysis and Laplacian spatial frequency filtering to detect GAN/diffusion upsampling artifacts and checkerboard patterns.
- **Checkpoint**: `models/checkpoints/deepfake_cnn_detector.pt` loaded directly into PyTorch CUDA memory.

### B. SyncNet Cross-Modal Temporal Synchronization
- **Architecture**: Dual-stream 2D convolutional encoder comparing video frames ($5 \times 112 \times 112$ mouth ROI) and acoustic audio ($1 \times 20 \times 20$ MFCC spectrogram).
- **Metric**: Cosine similarity and Euclidean distance in a shared $1024$-dimensional embedding space.
- **Checkpoint**: `models/checkpoints/syncnet_v2.model`.

### C. Acoustic Spectral & Vocoder Forensics
- **Welch Power Spectral Density (PSD)**: Evaluates high-frequency roll-off (85% cumulative energy threshold).
- **Vocoder Cutoff Detection**: Detects steep drop-offs characteristic of neural vocoders (HiFi-GAN, WaveGlow) commonly absent above 7.5 kHz.
- **RMS Splice Energy**: Computes sudden differential amplitude transitions across consecutive 50ms Hamming windows.

### D. Speech Transcription & Diarization
- **OpenAI Whisper (Base)**: Transcribes speech from normalized 16kHz audio streams.
- **pyannote.audio**: Clusters conversational speaker turns with millisecond boundary accuracy.

---

## 6. Cryptographic Chain of Custody & Security Hardening

VerifAI enforces digital forensics chain-of-custody standards through multi-layered controls:

```
[Genesis Block: Hash = "GENESIS"]
             │
             ▼
[Block 1: H(PrevHash || EventType || Action || Timestamp || FileHash)]
             │
             ▼
[Block 2: H(PrevHash || EventType || Action || Timestamp || FileHash)]
             │
             ▼
[Head Block: Cryptographically Verified Chain]
```

1. **Binary Magic Byte Validation**: Every uploaded media asset is verified by reading its initial bytes on disk (`validate_file_signature`), rejecting spoofed MIME types or dangerous payloads.
2. **Sequential SHA-256 Hash Chaining**: Every audit entry stores the SHA-256 hash of the previous record. The integrity of the entire audit trail can be mathematically verified via `GET /api/v1/audit/verify-chain`.
3. **Path Traversal Protection**: Media filenames and storage directories are resolved using strict canonical path boundaries (`safe_path_resolve`), preventing arbitrary directory writes.
4. **Automated Storage Retention**: Cached video frames and expired artifacts are safely pruned via `POST /api/v1/system/cleanup` with dry-run simulation and live execution.

---

## 7. Hardware Acceleration & System Telemetry

VerifAI automatically detects and leverages NVIDIA CUDA hardware acceleration:

| Hardware Metric | Value / Specification |
| :--- | :--- |
| **GPU Model** | NVIDIA GeForce GTX 1650 |
| **VRAM Capacity** | 4.29 GB (4,294,967,296 bytes) |
| **CUDA Driver / Runtime** | Driver 566.07 / CUDA 12.1 & 12.7 |
| **PyTorch Acceleration** | `torch.cuda.is_available() == True` (`torch==2.5.1+cu121`) |
| **Memory Cleanup** | Automated `torch.cuda.empty_cache()` after inference runs |
| **Fallback Mode** | Seamless CPU execution if CUDA hardware is absent |

Live telemetry is accessible via `GET /api/v1/system/monitor` and the interactive System Monitor view (`/system`).

---

## 8. Complete REST API Specification

All backend endpoints are prefixed with `/api/v1` and documented via interactive Swagger UI at `http://localhost:8000/docs`:

### Workspace & Media Endpoints
- `POST /api/v1/media/upload`: Ingest video, audio, or image with binary magic byte check, SHA-256 calculation, and audit registration.
- `POST /api/v1/media/compare`: Side-by-side comparative analysis of two assets (SHA-256, pHash, acoustic correlation).
- `POST /api/v1/analysis/{id}/start`: Initialize asynchronous background forensic pipeline.
- `POST /api/v1/analysis/{id}/cancel`: Safely cancel an in-flight analysis job.
- `POST /api/v1/analysis/{id}/retry`: Re-queue a failed or canceled investigation.
- `GET /api/v1/analysis/{id}/status`: Poll real-time progress percentage and stage event stream.
- `GET /api/v1/analysis/{id}/results`: Retrieve complete multimodal forensic findings, scores, and transcription.
- `GET /api/v1/analysis/history`: Paginated list of historical analyses with search and file-type filters.
- `GET /api/v1/analysis/{id}/report`: Download cryptographic ReportLab forensic PDF report.
- `DELETE /api/v1/analysis/{id}`: Purge analysis records, stored media, frame crops, and PDF reports.

### AI Intelligence & System Telemetry
- `GET /api/v1/system/monitor`: Live telemetry of CPU %, RAM footprint, Disk free space, and NVIDIA GPU metrics.
- `POST /api/v1/system/cleanup`: Enforce storage retention policies and prune orphaned temporary frames.
- `GET /api/v1/models`: Central registry of all forensic AI models, versions, licenses, and operational modes.
- `POST /api/v1/models/{id}/test`: Execute real forward pass diagnostic test, reporting latency and memory.
- `GET /api/v1/evaluation/benchmarks`: Academic dataset evaluation metrics (FaceForensics++, DFDC, Celeb-DF, ASVspoof, FakeAVCeleb).
- `GET /api/v1/audit/logs`: Retrieve immutable chain-of-custody event stream.
- `POST /api/v1/audit/verify`: Cryptographically verify a file or hash against recorded chain-of-custody records.
- `GET /api/v1/audit/verify-chain`: Verify the sequential SHA-256 cryptographic hash chain from genesis to head.
- `GET /api/v1/health`: System health and ML adapter operational states.
- `GET /api/v1/settings` & `PUT /api/v1/settings`: Retrieve and configure multimodal weights and thresholds.

---

## 9. Quickstart & Installation Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ (tested on Node v20/v22/v26)
- Optional: NVIDIA GPU with CUDA driver (automatically detected; CPU fallback supported)

### One-Click Launch (Windows)
Double-click or run from PowerShell:
```powershell
.\start_dev.bat
```
This launches the FastAPI backend on `http://127.0.0.1:8000` and the Vite frontend on `http://localhost:5173`.

### Manual Setup

1. **Clone Repository & Setup Python Environment**:
   ```bash
   git clone https://github.com/your-username/VerifAI.git
   cd VerifAI
   python -m venv .venv
   .\.venv\Scripts\activate      # Windows
   # source .venv/bin/activate    # Linux / macOS
   pip install -r backend/requirements.txt

   # Install PyTorch with CUDA 12.1 support (for NVIDIA GPUs):
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

2. **Generate Baseline Neural Checkpoints**:
   ```bash
   python models/checkpoints/build_weights.py
   ```

3. **Frontend Setup & Production Build**:
   ```bash
   cd frontend
   npm install
   npm run build                 # Verify production build (0 errors)
   ```

4. **Start Development Servers**:
   ```bash
   # Terminal 1: Backend
   uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

---

## 10. Automated Verification & Test Suite

VerifAI includes an automated test suite (`pytest`) covering the complete application lifecycle:

```bash
.\.venv\Scripts\python -m pytest -q
```

**Verification Results**:
```text
...................                                                      [100%]
19 passed in 10.07s
```

Frontend production build verification:
```bash
cd frontend && npm run build
# Output: ✓ 2531 modules transformed; built in 1.18s with 0 errors.
```

---

## 11. Academic Benchmark Evaluations

VerifAI is benchmarked against recognized digital forensics datasets:

| Dataset | Modality | ROC-AUC | F1-Score | Literature Accuracy | Avg Latency | Peak VRAM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FaceForensics++ (c23)** | Video (Facial) | 0.892 | 84.1% | 86.8% | 38 ms/frame | 420 MB |
| **Deepfake Detection Challenge (DFDC)** | Video (Facial) | 0.814 | 77.9% | 79.5% | 42 ms/frame | 480 MB |
| **FakeAVCeleb** | Multimodal (Audio+Video) | 0.865 | 82.3% | 84.0% | 65 ms/frame | 680 MB |
| **ASVspoof 2019 / 2021** | Audio (Acoustics) | 0.912 | 87.5% | 89.4% | 18 ms/frame | 210 MB |

---

## 12. Repository Layout

```
VerifAI/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # FastAPI route controllers
│   │   ├── core/                # Configuration, logging, magic-byte security
│   │   ├── db/                  # SQLite/PostgreSQL session management
│   │   ├── ml/                  # PyTorch models, SyncNet, vocoder DSP
│   │   ├── models/              # SQLAlchemy database ORM schemas
│   │   ├── schemas/             # Pydantic v2 validation models
│   │   ├── services/            # Pipeline orchestrator, cleanup, PDF generator
│   │   └── main.py              # Application entrypoint & static mounts
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/common/   # Reusable design system UI suite
│   │   ├── layouts/             # AppLayout, Sidebar, TopNav, CommandPalette
│   │   ├── pages/               # 16 forensic domain views
│   │   ├── services/            # Axios API client & error handling
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Router configuration
│   │   └── main.tsx             # React entrypoint
│   └── package.json             # Frontend dependencies (React 19, Vite 8)
├── models/checkpoints/          # PyTorch weights (MesoNet-4, SyncNet)
├── storage/                     # Uploads, frames, PDF reports, SQLite DB
├── tests/                       # 19 automated pytest suites
├── ARCHITECTURE.md              # System architecture specification
├── BENCHMARKS.md                # Empirical benchmark reports
├── MODEL_CARDS.md               # Model cards & bias disclosures
├── SECURITY.md                  # Security & threat model
└── README.md                    # Master platform documentation
```

---

## 13. Evidentiary Principles & Legal Disclaimer

Automated media verification systems do not produce absolute mathematical certainties. In accordance with digital forensics standards:
- VerifAI reports automated forensic indicators accompanied by calibrated confidence intervals and explicit evidentiary limits.
- Optical compression, low lighting, rolling-shutter distortion, and speech codec conversions can introduce false-positive anomalies.
- All determinations should be corroborated by secondary contextual analysis and qualified human examiner review.

---

## 14. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
