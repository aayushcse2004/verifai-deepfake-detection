import os
from typing import Dict, Any, List, Optional
import numpy as np
from scipy.io import wavfile
from scipy import signal
from backend.app.ml.adapter_base import BaseForensicAdapter
from backend.app.core.logging import logger


class AudioForensicsDetector(BaseForensicAdapter):
    """
    Audio Forensics & Acoustic Artifact Detector.
    Analyzes spectral continuity, vocoder band-pass cutoff artifacts,
    RMS dynamics, and splice discontinuities in audio tracks.
    """

    def __init__(self):
        super().__init__(name="Acoustic Forensics & Spectral Analyzer", version="2.0.0")

    def is_available(self) -> bool:
        return True

    def get_operational_mode(self) -> str:
        return "baseline_heuristic"

    def analyze(self, audio_wav_path: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """
        Analyze audio signal for synthetic speech traits and editing splices.
        """
        if not audio_wav_path or not os.path.exists(audio_wav_path):
            return {
                "score": None,
                "confidence": 0.0,
                "status": "UNAVAILABLE",
                "details": "No audio file available for acoustic forensics.",
                "evidence": [],
                "metrics": {}
            }

        try:
            sr, raw_audio = wavfile.read(audio_wav_path)
            if raw_audio.ndim > 1:
                raw_audio = np.mean(raw_audio, axis=1)
            audio = raw_audio.astype(np.float32) / (np.max(np.abs(raw_audio)) + 1e-6)
        except Exception as e:
            logger.error(f"Error reading audio in forensics: {e}")
            return {
                "score": None,
                "confidence": 0.0,
                "status": "FAILED",
                "details": str(e),
                "evidence": [],
                "metrics": {}
            }

        total_samples = len(audio)
        duration_s = total_samples / sr
        if duration_s < 0.5:
            return {
                "score": 0.1,
                "confidence": 0.4,
                "status": "COMPLETED",
                "details": "Audio is too short for detailed acoustic forensics.",
                "evidence": [],
                "metrics": {"duration_seconds": round(duration_s, 2)}
            }

        # 1. RMS Energy Analysis
        win_len = int(0.05 * sr) # 50ms window
        n_windows = total_samples // win_len
        rms_curve = [
            np.sqrt(np.mean(audio[i * win_len:(i + 1) * win_len]**2))
            for i in range(n_windows)
        ]
        rms_curve = np.array(rms_curve)
        mean_rms = float(np.mean(rms_curve))
        peak_rms = float(np.max(rms_curve))
        dynamic_range_db = 20 * np.log10((peak_rms + 1e-5) / (mean_rms + 1e-5))

        # 2. Splice / Discontinuity Detection (sharp spikes in RMS first derivative)
        diff_rms = np.abs(np.diff(rms_curve))
        threshold_splice = np.mean(diff_rms) + 3.5 * np.std(diff_rms)
        splice_indices = np.where(diff_rms > threshold_splice)[0]

        evidence = []
        for idx in splice_indices[:5]: # Cap evidence at top 5
            t_event = round(idx * 0.05, 2)
            evidence.append({
                "timestamp": t_event,
                "evidence_type": "acoustic_discontinuity",
                "description": f"Abrupt energy transition / potential audio splice detected at {t_event}s.",
                "score": 0.52,
                "metadata_json": {"splice_delta": round(float(diff_rms[idx]), 4)}
            })

        # 3. Spectral Frequency Distribution & Vocoder Cutoff Analysis
        # Many neural vocoders (MelGAN, HiFi-GAN, WaveGlow) exhibit steep cutoff above 7.5kHz or 11kHz.
        freqs, psd = signal.welch(audio, sr, nperseg=min(2048, total_samples))
        low_band = np.sum(psd[(freqs >= 100) & (freqs < 1000)])
        mid_band = np.sum(psd[(freqs >= 1000) & (freqs < 4000)])
        high_band = np.sum(psd[(freqs >= 4000) & (freqs < 8000)])
        ultra_high_band = np.sum(psd[freqs >= 8000]) if sr >= 16000 else 1e-6
        total_energy = np.sum(psd) + 1e-6

        # Zero-crossing rate
        zcr = float(np.mean(np.abs(np.diff(np.sign(audio)))) / 2.0)

        # Spectral Centroid
        spectral_centroid = float(np.sum(freqs * psd) / total_energy)

        # Vocoder artifact heuristic: unnatural energy collapse in high frequency
        high_freq_ratio = float(ultra_high_band / total_energy)
        risk_score = 0.15 # Baseline genuine expectation

        if sr >= 16000 and high_freq_ratio < 0.001 and len(audio) > sr:
            # Steep high frequency truncation typical of band-limited synthetic TTS
            risk_score += 0.35
            evidence.append({
                "timestamp": round(min(duration_s / 2, 2.0), 2),
                "evidence_type": "vocoder_spectral_cutoff",
                "description": "Steep acoustic attenuation above 8 kHz detected (characteristic of neural vocoder / synthetic TTS).",
                "score": 0.62,
                "metadata_json": {"high_freq_ratio": round(high_freq_ratio, 5)}
            })

        if len(splice_indices) >= 3:
            risk_score += 0.20

        final_score = round(min(0.95, max(0.05, risk_score)), 3)

        spectral_distribution = {
            "low_pct": round(float(low_band / total_energy * 100), 1),
            "mid_pct": round(float(mid_band / total_energy * 100), 1),
            "high_pct": round(float(high_band / total_energy * 100), 1),
            "ultra_high_pct": round(float(ultra_high_band / total_energy * 100), 1)
        }

        details = (
            f"Analyzed {duration_s:.1f}s of audio (Sample Rate: {sr} Hz). "
            f"Spectral centroid: {spectral_centroid:.0f} Hz, Dynamic Range: {dynamic_range_db:.1f} dB. "
            f"Detected {len(splice_indices)} splice anomaly point(s)."
        )

        return {
            "score": final_score,
            "confidence": 0.78,
            "status": "COMPLETED",
            "details": details,
            "evidence": evidence,
            "metrics": {
                "duration_seconds": round(duration_s, 2),
                "sample_rate": sr,
                "mean_rms": round(mean_rms, 4),
                "dynamic_range_db": round(dynamic_range_db, 1),
                "spectral_centroid_hz": round(spectral_centroid, 1),
                "zero_crossing_rate": round(zcr, 4),
                "frequency_bands": spectral_distribution,
                "splice_points_detected": len(splice_indices),
                "operational_mode": "baseline_heuristic"
            }
        }


audio_forensics_detector = AudioForensicsDetector()

