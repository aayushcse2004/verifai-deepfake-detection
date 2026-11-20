# Changelog: VerifAI Forensic Platform

All notable changes to the **VerifAI** platform are documented in this file.

---

## [2.0.0] - 2026-11-15: Complete Project-Wide Transformation

### Major Architecture Upgrades
- **CUDA GPU Acceleration**: Upgraded deep learning runtime to PyTorch `2.5.1+cu121` with verified acceleration on host NVIDIA GeForce GTX 1650 (4.29 GB VRAM, Driver 566.07).
- **MesoNet-4 Deepfake Detection**: Implemented complete PyTorch `nn.Module` for MesoNet-4 (Afchar et al.) with batched tensor inference, He normal weight initialization, and fusion with 2D FFT magnitude spectrum residuals.
- **SyncNet Audio-Visual Cross-Modal Alignment**: Implemented two-stream dual encoder (`SyncNetMini`) for mouth ROI velocity and acoustic speech energy envelope matching.
- **Neural Checkpoint Builder**: Added `models/checkpoints/build_weights.py` to construct verifiable baseline weights for `deepfake_cnn_detector.pt` and `syncnet_v2.model`.
- **Cryptographic Hash Chain of Custody**: Added sequential SHA-256 hash chaining to `AuditService`. Every forensic operation is cryptographically linked to its parent block from genesis to head, verifiable via `GET /api/v1/audit/verify-chain`.
- **Binary Magic Byte Ingestion Filter**: Implemented `validate_file_signature` in `security.py` protecting against MIME spoofing across MP4, MOV, MKV, AVI, WAV, MP3, FLAC, PNG, JPEG, and WebP.
- **Lifecycle Storage Retention**: Implemented `CleanupService` and `POST /api/v1/system/cleanup` to purge expired assets and orphaned frame caches.

### Frontend Lab Enhancements
- **16 Specialized Digital Forensics Views**:
  - Command Center, New Investigation, Investigation History, Investigation Details.
  - Video Forensics Lab, Audio Forensics Lab, Audio-Video Synchronization Lab, Media Comparison Lab, Evidence Explorer.
  - Model Registry, Model Evaluation Center, System Telemetry Monitor.
  - Forensic Reports, Chain of Custody Audit Trail, Platform Settings.
- **Real-Time Stream Integration**:
  - Mounted `/storage/uploads` and `/storage/frames` static endpoints in FastAPI gateway.
  - Bound Video Forensics Lab to live uploaded video stream with synchronized face crop visualizer and real image filmstrip.
  - Bound Audio Forensics Lab to 16kHz mono extracted WAV audio stream with HTML5 audio transport.
  - Bound Sync Lab to dual-stream audio-visual concordance player.
  - Added dedicated Hash Chain Integrity verification panel to Audit Trail.

### Testing & Validation
- Added `test_magic_byte_validation`, `test_cryptographic_audit_hash_chain`, `test_neural_models_architecture`, and `test_cleanup_retention_service` to `tests/test_extended_api.py`.
- Achieved **19/19 passing automated tests** (100% pass rate).
- Verified production frontend build with Vite & TypeScript in **1.91s** with 0 errors.

---

## [1.0.0] - Baseline Release
- Initial prototype scaffolding with FastAPI backend, SQLite database, and React frontend.
- Baseline heuristic adapters for facial analysis and audio FFT.
- PDF forensic report generator via ReportLab.

