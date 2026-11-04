import os
from typing import Dict, Any, List, Optional
import numpy as np
from scipy.io import wavfile
from scipy.cluster.vq import kmeans2
from backend.app.ml.adapter_base import BaseForensicAdapter
from backend.app.core.logging import logger
from backend.app.core.config import settings


class SpeakerDiarizer(BaseForensicAdapter):
    """
    Speaker Diarization Module.
    Segments speech and assigns acoustic clusters to unique speakers (SPEAKER_00, SPEAKER_01).
    Integrates pyannote.audio when configured with HuggingFace auth;
    otherwise provides robust acoustic clustering via spectral centroid & energy profiling.
    """

    def __init__(self):
        super().__init__(name="Speaker Diarization (pyannote/spectral)", version="3.1.0")
        self.pyannote_pipeline = None
        self._init_pyannote()

    def _init_pyannote(self):
        hf_token = os.environ.get("HUGGINGFACE_TOKEN")
        if hf_token:
            try:
                from pyannote.audio import Pipeline
                self.pyannote_pipeline = Pipeline.from_pretrained(
                    "pyannote/speaker-diarization-3.1",
                    use_auth_token=hf_token
                )
                logger.info("Initialized pyannote.audio speaker diarization pipeline.")
            except Exception as e:
                logger.warning(f"pyannote.audio initialization warning ({e}); using acoustic clustering baseline.")
                self.pyannote_pipeline = None
        else:
            self.pyannote_pipeline = None

    def is_available(self) -> bool:
        return True

    def get_operational_mode(self) -> str:
        return "active_model" if self.pyannote_pipeline is not None else "baseline_heuristic"

    def analyze(self, audio_wav_path: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """
        Diarize speakers from audio WAV file into timestamped segments.
        """
        if not audio_wav_path or not os.path.exists(audio_wav_path):
            return {
                "score": None,
                "confidence": 0.0,
                "status": "UNAVAILABLE",
                "details": "No audio file available for speaker diarization.",
                "evidence": [],
                "segments": [],
                "metrics": {"total_speakers": 0}
            }

        try:
            sr, audio = wavfile.read(audio_wav_path)
            if audio.ndim > 1:
                audio = np.mean(audio, axis=1)
            audio = audio.astype(np.float32) / (np.max(np.abs(audio)) + 1e-6)
        except Exception as e:
            logger.error(f"Error reading WAV in diarizer: {e}")
            return {
                "score": None,
                "confidence": 0.0,
                "status": "FAILED",
                "details": str(e),
                "evidence": [],
                "segments": [],
                "metrics": {"total_speakers": 0}
            }

        total_duration = len(audio) / sr
        if total_duration < 1.0:
            return {
                "score": 0.1,
                "confidence": 0.5,
                "status": "COMPLETED",
                "details": "Audio is under 1 second; single speaker assigned.",
                "evidence": [],
                "segments": [{"speaker_id": "SPEAKER_00", "start_time": 0.0, "end_time": round(total_duration, 2), "transcript": ""}],
                "metrics": {"total_speakers": 1}
            }

        # Check for pyannote pipeline execution
        if self.pyannote_pipeline is not None:
            try:
                diarization = self.pyannote_pipeline(audio_wav_path)
                segments = []
                for turn, _, speaker in diarization.itertracks(yield_label=True):
                    segments.append({
                        "speaker_id": speaker,
                        "start_time": round(turn.start, 2),
                        "end_time": round(turn.end, 2),
                        "transcript": ""
                    })
                unique_speakers = sorted(list(set(s["speaker_id"] for s in segments)))
                return {
                    "score": 0.15,
                    "confidence": 0.90,
                    "status": "COMPLETED",
                    "details": f"pyannote detected {len(unique_speakers)} speakers across {len(segments)} turns.",
                    "evidence": [],
                    "segments": segments,
                    "metrics": {"total_speakers": len(unique_speakers), "operational_mode": "active_model"}
                }
            except Exception as e:
                logger.warning(f"pyannote run failed ({e}), falling back to clustering.")

        # Baseline Acoustic Spectral Clustering
        # Window size 0.75s with 0.25s step
        win_size = int(0.75 * sr)
        step_size = int(0.50 * sr)
        n_windows = max(1, (len(audio) - win_size) // step_size)

        features = []
        valid_windows = []

        for i in range(n_windows):
            chunk = audio[i * step_size: i * step_size + win_size]
            rms = np.sqrt(np.mean(chunk**2))
            if rms < 0.015:  # silence
                continue

            # Spectral features
            fft_chunk = np.abs(np.fft.rfft(chunk))
            freqs = np.fft.rfftfreq(len(chunk), 1.0 / sr)
            centroid = np.sum(freqs * fft_chunk) / (np.sum(fft_chunk) + 1e-6)
            rolloff_idx = np.where(np.cumsum(fft_chunk) >= 0.85 * np.sum(fft_chunk))[0]
            rolloff = freqs[rolloff_idx[0]] if len(rolloff_idx) > 0 else 0.0
            zcr = np.mean(np.abs(np.diff(np.sign(chunk)))) / 2.0

            features.append([centroid / 4000.0, rolloff / 8000.0, zcr * 10.0, rms * 10.0])
            valid_windows.append((i * step_size / sr, (i * step_size + win_size) / sr))

        segments = []
        if len(features) < 4:
            # Single speaker
            segments.append({
                "speaker_id": "SPEAKER_00",
                "start_time": 0.0,
                "end_time": round(total_duration, 2),
                "transcript": ""
            })
            unique_speakers = ["SPEAKER_00"]
        else:
            feat_arr = np.array(features)
            # Standardize
            feat_norm = (feat_arr - np.mean(feat_arr, axis=0)) / (np.std(feat_arr, axis=0) + 1e-6)

            # Determine if 1 or 2 speakers based on centroid variance
            centroid_variance = np.var(feat_arr[:, 0])
            k = 2 if centroid_variance > 0.04 and len(features) >= 8 else 1

            if k == 2:
                try:
                    centroids, labels = kmeans2(feat_norm, 2, minit='points')
                except Exception:
                    labels = np.zeros(len(features), dtype=int)
            else:
                labels = np.zeros(len(features), dtype=int)

            # Group consecutive windows
            curr_speaker = f"SPEAKER_{labels[0]:02d}"
            curr_start = valid_windows[0][0]
            curr_end = valid_windows[0][1]

            for idx in range(1, len(labels)):
                spk = f"SPEAKER_{labels[idx]:02d}"
                start_w, end_w = valid_windows[idx]

                if spk == curr_speaker and (start_w - curr_end) < 0.8:
                    curr_end = end_w
                else:
                    segments.append({
                        "speaker_id": curr_speaker,
                        "start_time": round(curr_start, 2),
                        "end_time": round(curr_end, 2),
                        "transcript": ""
                    })
                    curr_speaker = spk
                    curr_start = start_w
                    curr_end = end_w

            segments.append({
                "speaker_id": curr_speaker,
                "start_time": round(curr_start, 2),
                "end_time": round(min(total_duration, curr_end), 2),
                "transcript": ""
            })
            unique_speakers = sorted(list(set(s["speaker_id"] for s in segments)))

        mode = self.get_operational_mode()
        details = (
            f"Diarized {len(unique_speakers)} speaker(s) across {len(segments)} segment(s). "
            f"Acoustic clustering mode: {mode}."
        )

        return {
            "score": 0.15,
            "confidence": 0.78,
            "status": "COMPLETED",
            "details": details,
            "evidence": [],
            "segments": segments,
            "metrics": {
                "total_speakers": len(unique_speakers),
                "speaker_ids": unique_speakers,
                "segment_count": len(segments),
                "operational_mode": mode
            }
        }


speaker_diarizer = SpeakerDiarizer()
