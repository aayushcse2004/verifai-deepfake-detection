# Contributing to VerifAI

Thank you for your interest in contributing to **VerifAI**! We welcome academic researchers, computer vision engineers, and digital forensics specialists.

---

## 1. Development Environment Setup

### Prerequisites
- **Python**: 3.11.x (with `pip` and `virtualenv`).
- **Node.js**: 18+ (tested on Node v20/v22/v26).
- **FFmpeg**: Installed and accessible on system `PATH`.
- **GPU (Optional but Recommended)**: NVIDIA GPU with CUDA 12.1+ driver support.

### Clone and Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/VerifAI.git
cd VerifAI

# 2. Setup Python Virtual Environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# 3. Install Backend Dependencies
pip install -r backend/requirements.txt

# Install PyTorch with CUDA support (for NVIDIA GPUs):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 4. Generate Baseline Neural Checkpoints
python models/checkpoints/build_weights.py

# 5. Setup Frontend
cd frontend
npm install
cd ..
```

---

## 2. Running Locally

### Start Backend API Server
```bash
# From workspace root:
.venv\Scripts\uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at `http://localhost:8000/docs`.

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
Workstation UI will be accessible at `http://localhost:5173`.

---

## 3. Adding a New Forensic Adapter

All detection models and signal processing modules in VerifAI must follow the **Forensic Adapter Pattern**:

1. Subclass `BaseForensicAdapter` in `backend/app/ml/adapter_base.py`:
   ```python
   from backend.app.ml.adapter_base import BaseForensicAdapter

   class CustomDetector(BaseForensicAdapter):
       def __init__(self):
           super().__init__(name="Custom Detector", version="1.0.0")

       def is_available(self) -> bool:
           return True

       def get_operational_mode(self) -> str:
           return "active_model" if self.model is not None else "baseline_heuristic"

       def analyze(self, **kwargs) -> dict:
           # Return standard score, confidence, status, details, evidence, and metrics
           return {
               "score": 0.15,
               "confidence": 0.85,
               "status": "COMPLETED",
               "details": "Custom analysis completed.",
               "evidence": [],
               "metrics": {}
           }
   ```
2. Register the adapter in `backend/app/api/v1/endpoints/models_registry.py` under `MODEL_DEFINITIONS`.
3. Incorporate the adapter into `backend/app/ml/fusion/fusion_engine.py`.
4. Add unit test coverage in `tests/test_ml_pipeline.py`.

---

## 4. Testing & Validation Guidelines

Before submitting a Pull Request, ensure that all tests pass and the frontend compiles cleanly:

```bash
# 1. Run Python Test Suite
pytest -v

# 2. Verify Frontend TypeScript Compilation
cd frontend
npm run build
cd ..
```

All 19 automated tests must pass with 0 errors.

