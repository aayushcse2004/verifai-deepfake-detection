import os
from typing import Dict, Any, Optional
import numpy as np
from scipy.io import wavfile
from backend.app.core.security import calculate_sha256
from backend.app.services.media_service import media_service
from backend.app.core.logging import logger


class MediaComparisonService:
    """Provides side-by-side comparative forensics for two media assets."""

    def hamming_distance(self, hex1: str, hex2: str) -> int:
        """Compute bitwise Hamming distance between two hex string hashes."""
        try:
            val1 = int(hex1, 16)
            val2 = int(hex2, 16)
            xor_val = val1 ^ val2
            return bin(xor_val).count("1")
        except Exception:
            return 64

    def compare_audio_tracks(self, path_a: str, path_b: str, temp_dir: str) -> Dict[str, Any]:
        """Extract and compare audio waveforms using normalized cross-correlation."""
        wav_a = os.path.join(temp_dir, "cmp_a.wav")
        wav_b = os.path.join(temp_dir, "cmp_b.wav")

        has_a = media_service.extract_audio(path_a, wav_a)
        has_b = media_service.extract_audio(path_b, wav_b)

        if not has_a or not has_b:
            return {
                "comparable": False,
                "reason": "One or both assets lack an extractable audio stream.",
                "correlation": None
            }

        try:
            sr_a, data_a = wavfile.read(wav_a)
            sr_b, data_b = wavfile.read(wav_b)

            # Convert to float and take first 10 seconds or min duration
            min_len = min(len(data_a), len(data_b), sr_a * 10)
            if min_len < 1000:
                return {"comparable": False, "reason": "Audio stream duration insufficient.", "correlation": None}

            sig_a = data_a[:min_len].astype(np.float32)
            sig_b = data_b[:min_len].astype(np.float32)

            norm_a = np.linalg.norm(sig_a)
            norm_b = np.linalg.norm(sig_b)

            if norm_a == 0 or norm_b == 0:
                corr = 0.0
            else:
                corr = float(np.dot(sig_a, sig_b) / (norm_a * norm_b))

            corr_clamped = max(-1.0, min(1.0, corr))

            return {
                "comparable": True,
                "sample_rate": sr_a,
                "correlation": round(corr_clamped, 4),
                "acoustic_similarity_pct": round(max(0.0, corr_clamped) * 100, 2),
                "identical_audio": bool(np.array_equal(data_a, data_b))
            }
        except Exception as e:
            logger.error(f"Audio comparison error: {e}")
            return {"comparable": False, "reason": str(e), "correlation": None}
        finally:
            for p in [wav_a, wav_b]:
                if os.path.exists(p):
                    try:
                        os.remove(p)
                    except Exception:
                        pass

    def compare_media(
        self,
        file_path_a: str,
        name_a: str,
        file_path_b: str,
        name_b: str,
        temp_dir: str
    ) -> Dict[str, Any]:
        """Execute full comparative forensics suite between Asset A and Asset B."""
        # 1. Cryptographic Hashes
        hash_a = calculate_sha256(file_path_a)
        hash_b = calculate_sha256(file_path_b)
        hash_match = (hash_a == hash_b)

        # 2. Metadata Probing
        meta_a = media_service.get_metadata(file_path_a)
        meta_b = media_service.get_metadata(file_path_b)

        size_a = os.path.getsize(file_path_a)
        size_b = os.path.getsize(file_path_b)

        # 3. Perceptual Hashing (pHash)
        phash_a = media_service.compute_phash(file_path_a)
        phash_b = media_service.compute_phash(file_path_b)

        visual_similarity = None
        phash_distance = None

        if phash_a and phash_b:
            phash_distance = self.hamming_distance(phash_a, phash_b)
            # 64-bit hash: distance 0 = identical perceptual structure, distance <= 5 = near identical
            similarity_pct = max(0.0, (64 - phash_distance) / 64.0 * 100.0)
            visual_similarity = {
                "phash_a": phash_a,
                "phash_b": phash_b,
                "hamming_distance": phash_distance,
                "similarity_pct": round(similarity_pct, 2),
                "interpretation": (
                    "Visually identical structure" if phash_distance == 0 else
                    "High perceptual structural similarity (likely re-compressed or trimmed)" if phash_distance <= 5 else
                    "Moderate visual correlation (potential edit/filter)" if phash_distance <= 12 else
                    "Distinct visual content"
                )
            }

        # 4. Audio Waveform Comparison
        audio_comparison = self.compare_audio_tracks(file_path_a, file_path_b, temp_dir)

        # 5. Detected Differences Summary
        differences = []
        if hash_match:
            verdict = "BITWISE IDENTICAL"
            summary = "Both assets share identical cryptographic SHA-256 digests. No temporal or spatial deviation detected."
        else:
            verdict = "DIFFERENCES DETECTED"
            if size_a != size_b:
                diff_bytes = abs(size_a - size_b)
                differences.append(f"File size disparity: {diff_bytes:,} bytes difference.")
            if abs(meta_a["duration"] - meta_b["duration"]) > 0.1:
                differences.append(f"Temporal duration disparity: {meta_a['duration']}s vs {meta_b['duration']}s.")
            if meta_a["width"] != meta_b["width"] or meta_a["height"] != meta_b["height"]:
                differences.append(f"Resolution mismatch: {meta_a['width']}x{meta_a['height']} vs {meta_b['width']}x{meta_b['height']}.")
            if visual_similarity:
                differences.append(f"Visual pHash: {visual_similarity['interpretation']} (Hamming distance: {phash_distance}/64).")
            if audio_comparison.get("comparable"):
                differences.append(f"Audio correlation: {audio_comparison.get('acoustic_similarity_pct')}% acoustic similarity.")

            summary = "; ".join(differences) if differences else "Binary stream alteration detected without dimension changes."

        return {
            "verdict": verdict,
            "hash_match": hash_match,
            "asset_a": {
                "name": name_a,
                "sha256": hash_a,
                "size_bytes": size_a,
                "metadata": meta_a,
                "phash": phash_a
            },
            "asset_b": {
                "name": name_b,
                "sha256": hash_b,
                "size_bytes": size_b,
                "metadata": meta_b,
                "phash": phash_b
            },
            "visual_similarity": visual_similarity,
            "audio_comparison": audio_comparison,
            "differences": differences,
            "summary": summary
        }


media_comparison_service = MediaComparisonService()

