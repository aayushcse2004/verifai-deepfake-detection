# VerifAI Frontend: Cybersecurity Media Forensics UI

The frontend for **VerifAI** is a dark-themed, high-performance single page application built with React 19, TypeScript, Vite, Tailwind CSS v4, and Recharts.

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

## Key Pages & User Flows

1. **Landing Page (`/`)**:
   - Hero section with gradient typography and quick platform statistics.
   - **Interactive Forensic Comparison Slider**: Live split-view slider demonstrating authentic capture vs diffusion synthesis overlay with simulated 2D-FFT and Laplacian edge anomalies.
   - **Modality Explorer**: Interactive tab switcher covering Computer Vision, Lip-Sync, Acoustic Forensics, and Multimodal Fusion.
   - 4-step workflow breakdown and academic BibTeX citation export.

2. **Dashboard (`/dashboard`)**:
   - High-level telemetry counters (Total Analyses, Videos Analyzed, Audio Files, System Status).
   - Live Model Health indicators directly queried from `GET /api/v1/health`.
   - Recent analyses audit table with direct view actions.

3. **Media Upload & Ingestion (`/upload`)**:
   - Drag-and-drop file uploader with extension validation and file size verification.
   - Instant local video and audio player preview before ingestion.
   - **Research Benchmark Scenarios**: One-click selection of 4 pre-configured test scenarios (Synthetic Face-Swap, AI Voice Clone, Authentic Press Briefing, Dubbed Translation) generating real binary waveforms on the fly.
   - Analysis strategy preset selector (Balanced Multimodal, Facial Focus, Voice/Sync Focus).

4. **Processing Telemetry (`/processing/:analysisId`)**:
   - High-tech scanning radar HUD with animated laser sweep.
   - Real-time polling across all 11 stages with progress percentage.
   - Terminal event stream displaying stage timestamps and operational logs with copy-to-clipboard functionality.
   - Automatic navigation to results upon pipeline completion.

5. **Forensic Results (`/results/:analysisId`)**:
   - Overall Assessment Banner with color-coded risk badge.
   - SVG Radial Gauge Meter indicating the normalized risk score (0-100%).
   - Radar chart and bar comparison charts across all four component dimensions.
   - Tabbed deep-dive:
     - Evidence Timeline with category filters (Facial, Sync, Audio, Speaker).
     - Speaker Diarization colored visual track with Whisper continuous speech transcript.
     - SyncNet AV synchrony metrics (offset ms, cross-modal correlation).
     - Acoustic spectral metrics (Welch PSD bands, dynamic range, splice points).
     - Model specifications & runtime modes.
   - Downloadable court-grade PDF report and JSON metadata export.

6. **Analysis Audit History (`/history`)**:
   - Searchable and filterable history of all processed media.
   - Actions to view results, download PDF reports, or delete analyses and disk files.

7. **Platform & Model Settings (`/settings`)**:
   - Sliders for multimodal fusion weights with automatic sum calculation.
   - Upload limit configuration and hardware execution flags.

---

## Component Architecture

```
frontend/src/
├── components/
│   ├── Navbar.tsx                   # Sticky navigation with live backend status
│   ├── Footer.tsx                   # Forensic legal disclaimers & tech stack
│   ├── RiskBadge.tsx                # Color-coded badge for 3 assessment tiers
│   ├── ModelStatusBadge.tsx         # Operational mode chips (Active / Baseline)
│   ├── GaugeMeter.tsx               # SVG circular score meter
│   ├── EvidenceTimeline.tsx         # Filterable chronological anomaly cards
│   ├── SpeakerTimeline.tsx          # Visual colored multi-speaker turn track
│   └── ForensicComparisonSlider.tsx # Interactive before/after split slider
├── pages/
│   ├── LandingPage.tsx
│   ├── Dashboard.tsx
│   ├── UploadPage.tsx
│   ├── ProcessingPage.tsx
│   ├── ResultsPage.tsx
│   ├── HistoryPage.tsx
│   └── SettingsPage.tsx
├── services/
│   ├── api.ts                       # Axios client & typed endpoint wrappers
│   └── sampleData.ts                # Research benchmark test scenarios
├── utils/
│   └── audioGenerator.ts            # Client-side 16kHz PCM WAV binary generator
├── types/
│   └── index.ts                     # TypeScript data interfaces
├── App.tsx                          # React Router definitions
├── index.css                        # Tailwind v4 theme, animations & cyber grid
└── main.tsx                         # React 19 root
```

---

## Development & Build Instructions

### Install Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

### Launch Development Server
```bash
npm run dev
```
Development server runs at `http://localhost:5173` with reverse proxy to `http://127.0.0.1:8000` for `/api` and `/storage`.

### Production Build
```bash
npm run build
```
Generates minified, production-ready static assets in `dist/`.
