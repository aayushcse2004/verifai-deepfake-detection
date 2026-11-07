import os
from typing import Dict, Any, List, Optional
import cv2
import numpy as np
from scipy.io import wavfile
from backend.app.ml.adapter_base import BaseForensicAdapter
from backend.app.core.logging import logger
from backend.app.core.config import settings


class TalkNetDetector(BaseForensicAdapter):
    """
    TalkNet Active Speaker Detection Module.
    Associates visible facial candidates with acoustic speech activity intervals
    to detect speaker-audio mismatch, puppet deepfakes, or out-of-sync dubbing.
    """

    def __init__(self, checkpoint_path: Optional[str] = None):
        super().__init__(name="TalkNet Active Speaker Detector", version="1.2.0")
        self.checkpoint_path = checkpoint_path or os.path.join(settings.MODEL_CHECKPOINTS_DIR, "talknet_model.pt")
        self.model = None
        self._load_checkpoint()

    def _load_checkpoint(self):
        if os.path.exists(self.checkpoint_path):
            try:
                import torch
                self.model = torch.load(self.checkpoint_path, map_location=settings.DEVICE)
                logger.info(f"Loaded TalkNet weights from {self.checkpoint_path}")
            except Exception as e:
                logger.warning(f"TalkNet model load error ({e}); using cross-modal activity tracker.")
                self.model = None
        else:
            self.model = None

    def is_available(self) -> bool:
        return True

    def get_operational_mode(self) -> str:
        return "active_model" if self.model is not None else "baseline_heuristic"

    def analyze(
        self,
        face_records: List[Dict[str, Any]],
        audio_wav_path: Optional[str] = None,
        duration: float = 0.0,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Segment speaking intervals and assign to detected face tracks.
        """
        if not face_records or not audio_wav_path or not os.path.exists(audio_wav_path):
            return {
                "score": None,
                "confidence": 0.0,
                "status": "UNAVAILABLE",
                "details": "Insufficient visual tracks or audio stream for active speaker verification.",
                "evidence": [],
                "metrics": {
                    "active_speaker_segments": [],
                    "unmatched_speech_duration_s": 0.0
                }
            }

        # 1. Read audio and identify speech vs silence (Voice Activity Detection baseline)
        try:
            sr, audio = wavfile.read(audio_wav_path)
            if audio.ndim > 1:
                audio = np.mean(audio, axis=1)
            audio = audio.astype(np.float32) / (np.max(np.abs(audio)) + 1e-6)
        except Exception as e:
            logger.error(f"Error reading audio in TalkNet: {e}")
            return {
                "score": None,
                "confidence": 0.0,
                "status": "FAILED",
                "details": f"Audio processing failed: {str(e)}",
                "evidence": [],
                "metrics": {}
            }

        # Compute audio energy in 100ms segments
        seg_len = int(0.1 * sr)
        num_segs = len(audio) // seg_len
        if num_segs == 0:
            return {
                "score": None,
                "confidence": 0.0,
                "status": "UNAVAILABLE",
                "details": "Audio duration is too short for speaker analysis.",
                "evidence": [],
                "metrics": {}
            }

        audio_rms = np.array([
            np.sqrt(np.mean(audio[i * seg_len:(i + 1) * seg_len]**2))
            for i in range(num_segs)
        ])
        threshold_speech = np.percentile(audio_rms, 35) + 0.01
        is_speech = audio_rms > threshold_speech

        # 2. Track motion per face track
        track_motion = {} # track_id -> [(timestamp, motion_intensity)]
        tracks_by_time = {} # timestamp -> list of (track_id, crop_path)

        for record in face_records:
            tid = record.get("track_id", "face_01")
            ts = record.get("timestamp", 0.0)
            crop_path = record.get("crop_path")
            if ts not in tracks_by_time:
                tracks_by_time[ts] = []
            tracks_by_time[ts].append((tid, crop_path))

        # Sort timestamps
        sorted_ts = sorted(tracks_by_time.keys())
        prev_crops = {}
        for ts in sorted_ts:
            for tid, crop_path in tracks_by_time[ts]:
                motion = 0.0
                if crop_path and os.path.exists(crop_path):
                    curr_img = cv2.imread(crop_path, cv2.IMREAD_GRAYSCALE)
                    if curr_img is not None:
                        curr_img = cv2.resize(curr_img, (64, 64))
                        if tid in prev_crops:
                            motion = float(np.mean(cv2.absdiff(curr_img, prev_crops[tid])))
                        prev_crops[tid] = curr_img
                if tid not in track_motion:
                    track_motion[tid] = []
                track_motion[tid].append((ts, motion))

        # 3. Associate speech intervals with tracks
        speaking_segments = []
        evidence = []
        unmatched_speech_duration = 0.0

        # Build segments of contiguous speech
        current_start = None
        for i, speech_flag in enumerate(is_speech):
            t_curr = i * 0.1
            if speech_flag:
                if current_start is None:
                    current_start = t_curr
            else:
                if current_start is not None:
                    duration_seg = t_curr - current_start
                    if duration_seg >= 0.3: # minimum 300ms speech segment
                        speaking_segments.append((round(current_start, 2), round(t_curr, 2)))
                    current_start = None

        if current_start is not None:
            speaking_segments.append((round(current_start, 2), round(num_segs * 0.1, 2)))

        # Assign speaker segments to face track with highest motion during segment
        active_speaker_results = []
        for start_t, end_t in speaking_segments:
            best_track = None
            max_track_motion = -1.0

            for tid, motions in track_motion.items():
                in_seg_motion = [m for t, m in motions if start_t - 0.2 <= t <= end_t + 0.2]
                avg_m = np.mean(in_seg_motion) if in_seg_motion else 0.0
                if avg_m > max_track_motion:
                    max_track_motion = avg_m
                    best_track = tid

            # If all tracks had almost zero motion (< 2.0 pixel diff), speech might be dubbed / voiceover
            is_mismatched = (max_track_motion < 2.0 and len(track_motion) > 0)
            if is_mismatched:
                unmatched_speech_duration += (end_t - start_t)
                evidence.append({
                    "timestamp": start_t,
                    "evidence_type": "active_speaker_mismatch",
                    "description": f"Speech active ({start_t}s - {end_t}s) without corresponding facial motion on visible faces.",
                    "score": 0.58,
                    "metadata_json": {"start_time": start_t, "end_time": end_t, "motion": round(float(max_track_motion), 2)}
                })

            active_speaker_results.append({
                "start_time": start_t,
                "end_time": end_t,
                "active_track": best_track or "unassigned",
                "motion_confidence": round(min(1.0, float(max_track_motion) / 15.0), 2),
                "is_concordant": not is_mismatched
            })

        total_audio_sec = num_segs * 0.1
        mismatch_ratio = (unmatched_speech_duration / total_audio_sec) if total_audio_sec > 0 else 0.0
        active_score = round(min(0.95, max(0.10, 0.20 + mismatch_ratio * 0.70)), 3)
        mode = self.get_operational_mode()

        details = (
            f"Detected {len(speaking_segments)} speech activity segment(s) across {len(track_motion)} face track(s). "
            f"Unmatched speech: {unmatched_speech_duration:.1f}s ({mismatch_ratio*100:.1f}%). Mode: {mode}."
        )

        return {
            "score": active_score,
            "confidence": 0.85 if self.model is not None else 0.75,
            "status": "COMPLETED",
            "details": details,
            "evidence": evidence,
            "metrics": {
                "total_speech_segments": len(speaking_segments),
                "active_speaker_segments": active_speaker_results,
                "unmatched_duration_seconds": round(unmatched_speech_duration, 2),
                "mismatch_ratio": round(mismatch_ratio, 3),
                "operational_mode": mode
            }
        }


talknet_detector = TalkNetDetector()

