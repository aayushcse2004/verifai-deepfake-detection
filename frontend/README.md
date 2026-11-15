# VerifAI Frontend: Digital Media Forensics Interface

The frontend for **VerifAI** is a high-performance, dark-themed single page application built with React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, and Recharts.

---

## Visual Design System & Palette

- **Background**: `#080D18` (Obsidian Blue)
- **Cards & Panels**: `#111827` (Deep Slate Glass) with subtle borders `#1E293B`
- **Primary Accent**: `#6366F1` (Cyber Indigo)
- **Secondary Accent**: `#06B6D4` (Electric Cyan)
- **Success / Genuine**: `#22C55E` (Emerald Green)
- **Warning / Inconclusive**: `#F59E0B` (Amber)
- **Danger / Manipulated**: `#EF4444` (Rose / Red)
- **Text**: `#F8FAFC`

---

## Navigation Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERIFAI USER INTERFACES                         │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│    WORKSPACE     │  FORENSIC LABS   │ AI INTELLIGENCE  │  MANAGEMENT   │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ • Command Center │ • Video Lab      │ • Model Registry │ • Reports     │
│ • New Ingestion  │ • Audio Lab      │ • Evaluation Ctr │ • Audit Trail │
│ • Case History   │ • AV Sync Lab    │ • System Monitor │ • Settings    │
│ • Case Details   │ • Media Compare  │                  │               │
│                  │ • Evidence Grid  │                  │               │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

---

## Detailed Page Breakdown

### 1. Workspace
- **Command Center (`/dashboard`)**: Forensic counters, live model health indicators from `GET /api/v1/health`, recent case ledger, and quick-launch shortcuts into specialized forensic laboratories.
- **New Investigation (`/upload`)**: Drag-and-drop file uploader supporting video (`mp4, mov, avi, mkv`), audio (`wav, mp3, m4a`), and static forensic images (`png, jpg, jpeg, webp`). Includes local SHA-256 pre-calculation, instant media preview, and 4 pre-configured research benchmark scenarios with synthesized 16kHz audio streams.
- **Investigation Telemetry (`/processing/:id`)**: High-tech animated radar scanner, live 11-stage progress tracker, real-time log terminal with copy-to-clipboard, elapsed timer, and job cancellation/retry controls.
- **Investigation Details (`/results/:id`)**: Multimodal radar chart, radial risk gauge meter, calibrated overall score, 5-tab deep-dive explorer, raw JSON export, and ReportLab PDF download.
- **Investigation History (`/history`)**: Filterable audit ledger with search by filename/hash, media type badges (Video, Audio, Image), and cascading record deletion.

### 2. Forensic Laboratories
- **Video Forensics Lab (`/lab/video`)**: Interactive video player with frame-by-frame navigation ($-1$, $+1$ frame), variable speed playback ($0.25\times - 2\times$), suspicious keyframe markers, and face bounding box tracking overlays.
- **Audio Forensics Lab (`/lab/audio`)**: 16kHz PCM audio waveform visualizer, Welch PSD spectral envelope graph, OpenAI Whisper speech transcription, and neural vocoder cutoff indicators.
- **Audio-Visual Synchronization Lab (`/lab/sync`)**: Synchronized multi-track inspection correlating mouth-region optical flow velocity (SyncNet ROI) with acoustic RMS energy envelopes and pyannote speaker turn intervals.
- **Media Comparison Lab (`/lab/compare`)**: Side-by-side dual-asset forensic diffing evaluating cryptographic SHA-256 match, 64-bit Perceptual Hash (pHash) Hamming distance, and acoustic waveform normalized cross-correlation.
- **Evidence Explorer (`/evidence`)**: Searchable data grid of timestamped forensic anomalies with modality filters, score threshold sliders, and Explainable AI finding drawers.

### 3. AI Intelligence
- **Model Registry (`/models`)**: Inventory of all forensic adapters, architectures, licenses, checkpoint availability, compute targets (CUDA/CPU), and a live diagnostic test runner that executes real forward passes to measure latency and VRAM footprint.
- **Model Evaluation Center (`/evaluation`)**: Academic benchmark center reporting empirical metrics across standardized forensic datasets (FaceForensics++, DFDC, Celeb-DF, ASVspoof, FakeAVCeleb) with 2x2 confusion matrices, ROC-AUC, and latency.
- **System & GPU Monitor (`/system`)**: Real-time telemetry reporting NVIDIA GPU name (`NVIDIA GeForce GTX 1650`), VRAM utilization, GPU compute load, host CPU percentage, memory footprint, and disk volume headroom.

### 4. Management
- **Forensic Reports Repository (`/reports`)**: Central document vault to view metadata, verified SHA-256 digests, and download court/investigation-grade PDF reports.
- **Chain of Custody & Audit Trail (`/audit`)**: Append-only event ledger logging ingestion, analysis runs, hash verification, and deletions. Features an interactive cryptographic verifier that re-computes SHA-256 to attest integrity against the recorded ledger.
- **System Settings (`/settings`)**: Configurable multimodal risk weights, file size caps, device selection (CUDA/CPU), and Whisper model tiers.

---

## Production Build Verification

```bash
cd frontend
npm run build
```
Builds cleanly with Vite & TypeScript in ~3 seconds with 0 errors.
