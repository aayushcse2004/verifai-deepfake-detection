# Model Cards: VerifAI Forensic Engine

This document provides formal model cards for all AI models, neural architectures, and forensic signal processing algorithms deployed in **VerifAI**.

---

## 1. MesoNet-4: CNN Facial Manipulation Detector

- **Model ID**: `deepfake_cnn`
- **Architecture**: 4-layer convolutional deepfake artifact classifier (Afchar et al., IEEE WIFS).
- **Intended Use**: Detect subtle mesoscopic facial texture manipulation, boundary artifacts, and GAN synthesis noise across video frames.
- **Input Specifications**: Batch tensor of face crops `[B, 3, 256, 256]`, normalized to $[0.0, 1.0]$ float32.
- **Output**: Anomaly probability scalar `[0.0, 1.0]` where values $\ge 0.55$ indicate manipulation.
- **Checkpoint**: `models/checkpoints/deepfake_cnn_detector.pt` (121 KB PyTorch StateDict).
- **Acceleration**: Accelerated on CUDA GPUs (NVIDIA GeForce GTX 1650 verified) with automatic CPU fallback.
- **Combined Analysis**: Blended with 2D FFT magnitude spectrum (high-frequency checkerboard pattern detection) and Laplacian spatial edge variance.
- **Limitations**: Compression artifacts (H.264 CRF > 32) can attenuate high-frequency signals and induce false positives on low-bitrate streams.

---

## 2. SyncNet: Audio-Visual Cross-Modal Synchronizer

- **Model ID**: `syncnet`
- **Architecture**: Two-stream dual encoder (Chung & Zisserman, Oxford VGG).
  - **Visual Stream**: Convolutional network encoding lower 35% mouth ROI optical motion.
  - **Acoustic Stream**: Convolutional network encoding 16kHz audio Mel-spectrogram energy.
- **Intended Use**: Detect temporal synchronization offsets and artificial voice dubbing.
- **Input Specifications**:
  - Visual: Consecutive mouth crop frames `[B, 5, 48, 64]`.
  - Audio: Time-aligned 40ms acoustic energy chunks `[B, 1, 48, 64]`.
- **Output**: Cross-modal cosine embedding similarity and estimated temporal lag in milliseconds ($\text{offset}_{ms}$).
- **Checkpoint**: `models/checkpoints/syncnet_v2.model` (1.2 MB PyTorch model).
- **Forensic Thresholds**: Nominal human speech displays cross-correlation $> 0.25$ and offset between $-100$ ms and $+100$ ms. Offsets $> 250$ ms indicate temporal dubbing or synthetic lipsync.
- **Limitations**: Inaudible background whispering or severe occlusions of the mouth region reduce correlation confidence.

---

## 3. TalkNet: Active Speaker Detector

- **Model ID**: `talknet`
- **Architecture**: End-to-end active speaker detection network with cross-attention between face tracks and acoustic signals (Tao et al.).
- **Intended Use**: Determine whether visible individuals in multi-speaker videos are actively producing the recorded speech.
- **Input Specifications**: Bounding box face tracks synchronized with 16kHz mono audio.
- **Output**: Concordance score scalar per face track.
- **Operational Mode**: Self-reporting adapter (`active_model` when `talknet_weights.pt` is present; `baseline_heuristic` acoustic energy concordance fallback).
- **Limitations**: Low-resolution group scenes where multiple faces talk concurrently may degrade individual speaker attribution.

---

## 4. pyannote.audio: Speaker Diarizer

- **Model ID**: `speaker_diarizer`
- **Architecture**: SincNet acoustic embedding model with spectral clustering and voice activity detection (Bredin et al.).
- **Intended Use**: Segment audio stream into discrete speaker turns (`SPEAKER_00`, `SPEAKER_01`, etc.) to isolate manipulated audio splices.
- **Output**: Array of temporal speaker intervals `[start_time, end_time, speaker_id]`.
- **Operational Mode**: Native `pyannote.audio` neural pipeline with fallback to analytical MFCC centroid K-Means clustering.
- **Limitations**: Overlapping speech and reverberant room acoustics increase Diarization Error Rate (DER).

---

## 5. Whisper: Automatic Speech Recognition (ASR)

- **Model ID**: `whisper_asr`
- **Architecture**: Transformer encoder-decoder sequence-to-sequence model (Radford et al., OpenAI).
- **Intended Use**: Transcribe spoken words and produce word-level timestamps to detect audio splice insertion and transcript discordance.
- **Input Specifications**: 16kHz mono 80-channel log-Mel spectrogram.
- **Output**: Plaintext transcription and timestamped token segments.
- **Operational Mode**: Native `whisper` runtime with fallback to acoustic energy segmenter.
- **Limitations**: Heavy background music or non-lexical vocalizations may lead to hallucinated transcript fragments.

---

## 6. Analytical Vocoder & Spectral Forensics Engine

- **Model ID**: `audio_forensics`
- **Architecture**: Analytical Digital Signal Processing (DSP) based on Welch's Power Spectral Density (PSD) periodogram and Librosa signal analysis.
- **Intended Use**: Detect neural vocoder brickwall cutoffs (e.g. WaveGlow / HiFi-GAN 8kHz or 11kHz cutoffs) and sudden RMS energy splice discontinuities.
- **Output**: Spectral rolloff frequency ($\text{Hz}$), vocoder cutoff detected flag (`bool`), and splice discontinuity count.
- **Checkpoint**: None required (deterministic analytical DSP engine).
- **Limitations**: Low-pass filtering during legitimate audio mastering can mimic vocoder cutoff signatures.

