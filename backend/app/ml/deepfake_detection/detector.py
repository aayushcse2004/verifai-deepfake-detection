import os
from typing import Dict, Any, List, Optional
import cv2
import numpy as np
from backend.app.ml.adapter_base import BaseForensicAdapter
from backend.app.core.logging import logger
from backend.app.core.config import settings

# Attempt PyTorch import
try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


if TORCH_AVAILABLE:
    class Meso4(nn.Module):
        """
        MesoNet-4 deepfake facial manipulation detector (Afchar et al., IEEE WIFS).
        Detects meso-scale facial features and synthesis artifacts.
        """
        def __init__(self, num_classes: int = 1):
            super(Meso4, self).__init__()
            self.conv1 = nn.Conv2d(3, 8, kernel_size=3, padding=1, bias=False)
            self.bn1 = nn.BatchNorm2d(8)
            self.relu = nn.ReLU(inplace=True)
            self.maxpool1 = nn.MaxPool2d(kernel_size=2, stride=2)

            self.conv2 = nn.Conv2d(8, 8, kernel_size=5, padding=2, bias=False)
            self.bn2 = nn.BatchNorm2d(8)
            self.maxpool2 = nn.MaxPool2d(kernel_size=2, stride=2)

            self.conv3 = nn.Conv2d(8, 16, kernel_size=5, padding=2, bias=False)
            self.bn3 = nn.BatchNorm2d(16)
            self.maxpool3 = nn.MaxPool2d(kernel_size=2, stride=2)

            self.conv4 = nn.Conv2d(16, 16, kernel_size=5, padding=2, bias=False)
            self.bn4 = nn.BatchNorm2d(16)
            self.maxpool4 = nn.MaxPool2d(kernel_size=4, stride=4)

            self.dropout = nn.Dropout(0.5)
            self.adaptive_pool = nn.AdaptiveAvgPool2d((8, 8))
            self.fc1 = nn.Linear(16 * 8 * 8, 16)
            self.leaky_relu = nn.LeakyReLU(0.1)
            self.fc2 = nn.Linear(16, num_classes)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            x = self.relu(self.bn1(self.conv1(x)))
            x = self.maxpool1(x)
            x = self.relu(self.bn2(self.conv2(x)))
            x = self.maxpool2(x)
            x = self.relu(self.bn3(self.conv3(x)))
            x = self.maxpool3(x)
            x = self.relu(self.bn4(self.conv4(x)))
            x = self.maxpool4(x)
            x = self.adaptive_pool(x)
            x = self.dropout(x)
            x = x.view(x.size(0), -1)
            x = self.leaky_relu(self.fc1(x))
            x = self.dropout(x)
            x = self.fc2(x)
            return self.sigmoid(x)


class DeepfakeCnnDetector(BaseForensicAdapter):
    """
    CNN-based Facial Manipulation & Forensic Artifact Detector.
    Supports MesoNet-4 neural model checkpoint loading with CUDA GPU acceleration,
    combined with spatial/frequency domain artifact analysis (Laplacian variance,
    2D FFT high-frequency spectrum residuals, and YCrCb chrominance consistency).
    """

    def __init__(self, checkpoint_path: Optional[str] = None):
        super().__init__(name="CNN Facial Manipulation Detector", version="2.1.0-forensic")
        self.checkpoint_path = checkpoint_path or os.path.join(settings.MODEL_CHECKPOINTS_DIR, "deepfake_cnn_detector.pt")
        self.model = None
        self.device = None
        self._load_checkpoint()

    def _load_checkpoint(self):
        """Attempt to load PyTorch deepfake detection weights with CUDA acceleration."""
        if not TORCH_AVAILABLE:
            self.model = None
            return

        try:
            device_str = "cuda" if (torch.cuda.is_available() and settings.ENABLE_GPU) else "cpu"
            self.device = torch.device(device_str)

            if os.path.exists(self.checkpoint_path):
                meso = Meso4()
                checkpoint_data = torch.load(self.checkpoint_path, map_location=self.device, weights_only=True)
                if isinstance(checkpoint_data, dict):
                    meso.load_state_dict(checkpoint_data)
                meso.to(self.device)
                meso.eval()
                self.model = meso
                logger.info(f"Loaded Meso4 CNN deepfake weights onto {self.device} ({torch.cuda.get_device_name(0) if self.device.type == 'cuda' else 'CPU'}) from {self.checkpoint_path}")
            else:
                self.model = None
        except Exception as e:
            logger.warning(f"Could not initialize PyTorch weights ({e}), falling back to forensic heuristic baseline.")
            self.model = None

    def is_available(self) -> bool:
        return True # Always runnable via robust heuristic/CNN engine

    def get_operational_mode(self) -> str:
        return "active_model" if self.model is not None else "baseline_heuristic"

    def _analyze_frequency_artifacts(self, face_bgr: np.ndarray) -> Dict[str, float]:
        """
        Detect synthetic GAN/diffusion artifacts using frequency spectrum residuals:
        - High frequency attenuation or grid artifacts via 2D FFT.
        - Blurring / re-sampling anomalies using Laplacian variance.
        - Color channel discrepancy across RGB/YCbCr.
        """
        gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        if h < 20 or w < 20:
            return {"anomaly_score": 0.2, "laplacian_var": 50.0}

        # 1. Laplacian sharpness & edge consistency
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # 2. 2D FFT magnitude spectrum analysis
        dft = np.fft.fft2(gray)
        dft_shift = np.fft.fftshift(dft)
        magnitude_spectrum = 20 * np.log(np.abs(dft_shift) + 1e-6)

        # High frequency ring ratio
        center_y, center_x = h // 2, w // 2
        r_inner = min(h, w) // 6
        r_outer = min(h, w) // 3

        y, x = np.ogrid[:h, :w]
        dist_from_center = np.sqrt((x - center_x)**2 + (y - center_y)**2)

        high_freq_mask = (dist_from_center >= r_inner) & (dist_from_center <= r_outer)
        high_freq_energy = np.mean(magnitude_spectrum[high_freq_mask]) if np.any(high_freq_mask) else 0.0

        # Synthetic faces often exhibit either excessive smoothness or high-frequency checkerboard artifacts
        score = 0.15 # Baseline genuine expectation
        if high_freq_energy > 140.0:
            score += 0.35 # GAN checkerboard pattern anomaly
        elif high_freq_energy < 40.0 and laplacian_var < 50.0:
            score += 0.40 # Over-smoothed synthetic face or blending artifact

        # 3. YCrCb chrominance consistency check (common boundary artifacts in face-swaps)
        ycrcb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2YCrCb)
        cr_std = float(np.std(ycrcb[:, :, 1]))
        cb_std = float(np.std(ycrcb[:, :, 2]))
        if abs(cr_std - cb_std) > 18.0:
            score += 0.15

        return {
            "anomaly_score": min(0.95, max(0.05, score)),
            "laplacian_var": round(laplacian_var, 2),
            "high_freq_energy": round(float(high_freq_energy), 2)
        }

    def analyze(self, face_records: List[Dict[str, Any]], **kwargs) -> Dict[str, Any]:
        """
        Analyze face crops from video frames using CNN inference and artifact heuristics.
        """
        if not face_records:
            return {
                "score": None,
                "confidence": 0.0,
                "status": "UNAVAILABLE",
                "details": "No faces detected in media for facial manipulation evaluation.",
                "evidence": [],
                "metrics": {
                    "total_frames_analyzed": 0,
                    "suspicious_frames_count": 0,
                    "average_anomaly_score": 0.0
                }
            }

        suspicious_evidence = []
        frame_scores = []

        valid_crops = []
        valid_records = []
        for record in face_records:
            crop_path = record.get("crop_path")
            if crop_path and os.path.exists(crop_path):
                crop = cv2.imread(crop_path)
                if crop is not None and crop.size > 0:
                    valid_crops.append(crop)
                    valid_records.append(record)

        if not valid_crops:
            return {
                "score": None,
                "confidence": 0.0,
                "status": "UNAVAILABLE",
                "details": "Face crops were empty or unreadable.",
                "evidence": [],
                "metrics": {}
            }

        # If neural network is loaded, perform batch forward inference
        neural_scores = []
        if self.model is not None and TORCH_AVAILABLE:
            try:
                # Preprocess batch: resize to 256x256, RGB, normalized [0, 1]
                tensors = []
                for crop in valid_crops:
                    resized = cv2.resize(crop, (256, 256))
                    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
                    chw = np.transpose(rgb, (2, 0, 1)).astype(np.float32) / 255.0
                    tensors.append(chw)

                batch_np = np.stack(tensors, axis=0)
                with torch.no_grad():
                    batch_tensor = torch.from_numpy(batch_np).to(self.device)
                    outputs = self.model(batch_tensor)
                    neural_scores = outputs.cpu().numpy().flatten().tolist()

                if self.device.type == "cuda":
                    torch.cuda.empty_cache()
            except Exception as e:
                logger.error(f"Neural inference error: {e}. Defaulting to frequency heuristic.")
                neural_scores = []

        for idx, (crop, record) in enumerate(zip(valid_crops, valid_records)):
            timestamp = record.get("timestamp", 0.0)
            bbox = record.get("bbox", [])
            track_id = record.get("track_id", "face")

            art = self._analyze_frequency_artifacts(crop)
            freq_score = art["anomaly_score"]
            laplacian_val = art["laplacian_var"]

            if idx < len(neural_scores):
                # Fuse Meso4 CNN probability (60%) with frequency domain residual (40%)
                cnn_score = float(neural_scores[idx])
                anomaly_score = 0.60 * cnn_score + 0.40 * freq_score
            else:
                anomaly_score = freq_score

            frame_scores.append(anomaly_score)

            if anomaly_score >= 0.55:
                suspicious_evidence.append({
                    "timestamp": timestamp,
                    "evidence_type": "facial_manipulation",
                    "description": f"Facial texture / frequency anomaly detected on {track_id} (Laplacian: {laplacian_val}, Score: {anomaly_score:.2f})",
                    "score": round(anomaly_score, 3),
                    "metadata_json": {
                        "track_id": track_id,
                        "bbox": bbox,
                        "crop_filename": record.get("crop_filename")
                    }
                })

        # Calculate robust 85th percentile / mean for risk assessment
        mean_score = float(np.mean(frame_scores))
        max_score = float(np.max(frame_scores))
        p85_score = float(np.percentile(frame_scores, 85))
        aggregated_score = round(0.4 * mean_score + 0.6 * p85_score, 3)

        mode_str = self.get_operational_mode()
        status_detail = (
            f"Evaluated {len(frame_scores)} face instances across {len(set(r.get('track_id') for r in face_records))} track(s). "
            f"Operational mode: {mode_str}. Identified {len(suspicious_evidence)} suspicious frame(s)."
        )

        return {
            "score": aggregated_score,
            "confidence": 0.88 if self.model is not None else 0.76,
            "status": "COMPLETED",
            "details": status_detail,
            "evidence": suspicious_evidence,
            "metrics": {
                "total_faces_analyzed": len(frame_scores),
                "mean_facial_score": round(mean_score, 3),
                "max_facial_score": round(max_score, 3),
                "suspicious_faces_count": len(suspicious_evidence),
                "operational_mode": mode_str
            }
        }


deepfake_cnn_detector = DeepfakeCnnDetector()
