from typing import Dict, Any, List, Optional
from backend.app.core.config import settings
from backend.app.core.logging import logger


class MultimodalFusionEngine:
    """
    Central Forensic Fusion Engine.
    Aggregates multi-source evidence from facial CNN, audio-visual lip sync (SyncNet),
    active speaker correlation (TalkNet), acoustic forensics, and speaker diarization.
    Employs dynamic confidence-weighted heuristic risk assessment with missing-modality compensation.
    """

    LABEL_LOW = "LOW EVIDENCE OF MANIPULATION"
    LABEL_INCONCLUSIVE = "INCONCLUSIVE"
    LABEL_HIGH = "POTENTIAL MANIPULATION DETECTED"

    def __init__(
        self,
        weight_facial: Optional[float] = None,
        weight_lip_sync: Optional[float] = None,
        weight_active_speaker: Optional[float] = None,
        weight_audio: Optional[float] = None
    ):
        self.w_facial = weight_facial if weight_facial is not None else settings.WEIGHT_FACIAL
        self.w_lip_sync = weight_lip_sync if weight_lip_sync is not None else settings.WEIGHT_LIP_SYNC
        self.w_active_spk = weight_active_speaker if weight_active_speaker is not None else settings.WEIGHT_ACTIVE_SPEAKER
        self.w_audio = weight_audio if weight_audio is not None else settings.WEIGHT_AUDIO

    def fuse(
        self,
        facial_result: Dict[str, Any],
        lip_sync_result: Dict[str, Any],
        active_speaker_result: Dict[str, Any],
        audio_result: Dict[str, Any],
        diarization_result: Dict[str, Any],
        asr_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Fuse individual module results into a unified forensic report payload.
        """
        components = [
            ("facial", facial_result, self.w_facial),
            ("lip_sync", lip_sync_result, self.w_lip_sync),
            ("active_speaker", active_speaker_result, self.w_active_spk),
            ("audio", audio_result, self.w_audio),
        ]

        active_weights_sum = 0.0
        weighted_score_sum = 0.0
        confidence_product_sum = 0.0

        component_scores = {}
        model_statuses = {}
        all_evidence = []

        # 1. Gather status and scores
        for name, res, base_weight in components:
            score = res.get("score")
            conf = res.get("confidence", 0.0)
            status = res.get("status", "UNAVAILABLE")
            evidence = res.get("evidence", [])
            all_evidence.extend(evidence)

            component_scores[f"{name}_score"] = score

            model_statuses[name] = {
                "name": name.replace("_", " ").title(),
                "version": res.get("metrics", {}).get("version", "1.0"),
                "operational_mode": res.get("metrics", {}).get("operational_mode", "baseline_heuristic"),
                "confidence": round(conf, 3),
                "status": status,
                "details": res.get("details", "")
            }

            if score is not None and status == "COMPLETED":
                effective_weight = base_weight * max(0.2, conf)
                active_weights_sum += effective_weight
                weighted_score_sum += (score * effective_weight)
                confidence_product_sum += conf

        # Add diarization and ASR status
        model_statuses["speaker_diarization"] = {
            "name": "Speaker Diarization",
            "version": diarization_result.get("metrics", {}).get("version", "3.1"),
            "operational_mode": diarization_result.get("metrics", {}).get("operational_mode", "baseline_heuristic"),
            "confidence": round(diarization_result.get("confidence", 0.8), 2),
            "status": diarization_result.get("status", "COMPLETED"),
            "details": diarization_result.get("details", "")
        }

        model_statuses["speech_recognition"] = {
            "name": "Speech Recognition",
            "version": asr_result.get("metrics", {}).get("version", "Whisper-v3"),
            "operational_mode": asr_result.get("metrics", {}).get("operational_mode", "mock_adapter"),
            "confidence": round(asr_result.get("confidence", 0.85), 2),
            "status": asr_result.get("status", "COMPLETED"),
            "details": asr_result.get("details", "")
        }

        # 2. Compute final overall score with missing-modality compensation
        if active_weights_sum > 0:
            overall_score = round(weighted_score_sum / active_weights_sum, 3)
            overall_confidence = round(confidence_product_sum / (len([c for c in components if c[1].get("status") == "COMPLETED"]) or 1), 2)
        else:
            overall_score = 0.50 # completely inconclusive if all models unavailable
            overall_confidence = 0.0

        # 3. Classify Assessment Label
        if overall_score < 0.38:
            overall_assessment = self.LABEL_LOW
        elif overall_score < 0.62:
            overall_assessment = self.LABEL_INCONCLUSIVE
        else:
            overall_assessment = self.LABEL_HIGH

        # 4. Sort evidence items chronologically by timestamp
        all_evidence.sort(key=lambda x: x.get("timestamp", 0.0))

        # 5. Limitations & Warnings
        limitations = [
            "Video compression codecs (H.264/HEVC) and motion blur can introduce high-frequency boundary artifacts mimicking facial manipulation.",
            "Network streaming latency, Bluetooth microphone delay, or dubbing can produce audio-visual synchronization offsets without deepfake synthesis.",
            "Acoustic spectral cutoffs can occur naturally in legacy telephony, low-bitrate MP3 encoding, or band-pass studio filtering.",
            "Results represent automated forensic indicators with heuristic fusion weights; they do not constitute legal proof of authenticity."
        ]

        disclaimer = (
            "DISCLAIMER: VerifAI automated forensic risk scoring is an investigative aid designed to highlight "
            "potential structural, acoustic, and temporal anomalies. It must be evaluated in conjunction with human "
            "expert review, chain-of-custody verification, and contextual intelligence."
        )

        return {
            "overall_assessment": overall_assessment,
            "overall_score": overall_score,
            "overall_confidence": overall_confidence,
            "facial_score": component_scores.get("facial_score"),
            "lip_sync_score": component_scores.get("lip_sync_score"),
            "active_speaker_score": component_scores.get("active_speaker_score"),
            "audio_score": component_scores.get("audio_score"),
            "model_statuses": model_statuses,
            "evidence_items": all_evidence,
            "detailed_metrics": {
                "facial": facial_result.get("metrics", {}),
                "lip_sync": lip_sync_result.get("metrics", {}),
                "active_speaker": active_speaker_result.get("metrics", {}),
                "audio": audio_result.get("metrics", {}),
                "diarization": diarization_result.get("metrics", {}),
                "asr": asr_result.get("metrics", {})
            },
            "limitations": limitations,
            "disclaimer": disclaimer
        }


multimodal_fusion_engine = MultimodalFusionEngine()

