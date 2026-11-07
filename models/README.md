# VerifAI: AI/ML Checkpoints & Model Zoo

This directory documents the neural model checkpoints, pretrained weights, architectures, and fallback mechanisms utilized by the VerifAI media forensics pipeline.

---

## Model Inventory & Checkpoint Paths

| Engine | Target Architecture | Default Checkpoint Path | Operational Fallback |
|---|---|---|---|
| **Facial Manipulation** | MesoInception-4 / EfficientNet-B4 / Xception | `models/checkpoints/deepfake_cnn_detector.pt` | 2D-FFT frequency spectrum analysis, Laplacian gradient variance & YCrCb chrominance consistency |
| **Audio-Visual Sync** | SyncNet (Chung & Zisserman) | `models/checkpoints/syncnet_v2.model` | Mouth ROI optical velocity vs acoustic RMS envelope cross-correlation across temporal lag [-8, +8 steps] |
| **Active Speaker** | TalkNet (Tao et al.) | `models/checkpoints/talknet_model.pt` | Multi-face motion velocity vs voice activity energy association |
| **Speaker Diarization** | pyannote.audio 3.1 | HuggingFace Hub (`pyannote/speaker-diarization-3.1`) | Acoustic spectral centroid & energy profiling with k-means clustering |
| **Speech Recognition** | OpenAI Whisper (v3) | PyTorch Hub (`whisper.load_model('base')`) | Acoustic voice activity turn alignment |
| **Face Detection** | OpenCV Haar Cascade / DNN | Built-in OpenCV Data (`haarcascade_frontalface_default.xml`) | Always active |
| **Audio Forensics** | Welch PSD / SciPy Signal | Algorithmic signal processing | Always active |

---

## Graceful Fallback Architecture

To ensure VerifAI is immediately demonstrable on any machine without requiring multi-gigabyte weight downloads or specific CUDA drivers, every ML module implements `BaseForensicAdapter`.

Each adapter exposes:
- `.is_available() -> bool`
- `.get_operational_mode() -> str`:
  - `active_model`: Pretrained neural checkpoint loaded into PyTorch and active on CPU/GPU.
  - `baseline_heuristic`: Pure signal processing or computer vision heuristic baseline.
  - `mock_adapter`: Synthetic test harness for testing.
  - `unavailable`: Modality missing (e.g. video file with no audio track).

The system transparently displays the operational mode of each model in both the UI results page and the compiled PDF report, maintaining academic integrity without presenting simulated outputs as real model predictions.

---

## Downloading Pretrained Checkpoints

If you wish to download and place weights for production evaluation:

### 1. SyncNet v2 Model
Download from the official SyncNet release:
```bash
# Save to: models/checkpoints/syncnet_v2.model
```

### 2. TalkNet Active Speaker Model
Download from the official TalkNet repository:
```bash
# Save to: models/checkpoints/talknet_model.pt
```

### 3. Deepfake CNN Detector
Export or place a PyTorch TorchScript/JIT model:
```bash
# Save to: models/checkpoints/deepfake_cnn_detector.pt
```

### 4. pyannote.audio 3.1
Set your Hugging Face authentication token in `.env`:
```env
HUGGINGFACE_TOKEN=hf_your_token_here
```
Accept user conditions at:
- `https://huggingface.co/pyannote/speaker-diarization-3.1`
- `https://huggingface.co/pyannote/segmentation-3.0`
