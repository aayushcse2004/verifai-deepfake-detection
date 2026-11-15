import os
import subprocess
from typing import Dict, Any, List, Optional
import cv2
import numpy as np
import imageio_ffmpeg
from backend.app.core.logging import logger


class MediaService:
    def __init__(self):
        self.ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    def get_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extract metadata for video, audio, or static image file."""
        metadata = {
            "duration": 0.0,
            "width": 0,
            "height": 0,
            "fps": 0.0,
            "total_frames": 0,
            "has_video": False,
            "has_audio": False,
            "is_image": False,
            "codec": "unknown"
        }

        ext = os.path.splitext(file_path)[1].lower().lstrip(".")
        is_image = ext in {"png", "jpg", "jpeg", "webp"}
        is_audio_only = ext in {"wav", "mp3", "m4a", "aac", "flac"}

        if is_image:
            img = cv2.imread(file_path)
            if img is not None:
                h, w = img.shape[:2]
                metadata["has_video"] = True
                metadata["is_image"] = True
                metadata["width"] = w
                metadata["height"] = h
                metadata["total_frames"] = 1
                metadata["fps"] = 1.0
                metadata["duration"] = 0.0
                metadata["codec"] = ext.upper()
                return metadata

        # Try OpenCV only for video containers
        if not is_audio_only:
            cap = cv2.VideoCapture(file_path)
            if cap.isOpened():
                fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 0
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 0
                cap.release()

                if width > 0 and height > 0 and total_frames > 0:
                    metadata["has_video"] = True
                    metadata["width"] = width
                    metadata["height"] = height
                    metadata["fps"] = fps
                    metadata["total_frames"] = total_frames
                    if fps > 0:
                        metadata["duration"] = round(total_frames / fps, 2)

        # Check audio presence and duration with ffmpeg
        try:
            cmd = [self.ffmpeg_exe, "-nostdin", "-i", file_path]
            result = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True, timeout=10)
            stderr = result.stderr.lower()

            if "audio:" in stderr or "pcm" in stderr or "aac" in stderr or "mp3" in stderr:
                metadata["has_audio"] = True

            # If duration wasn't obtained from OpenCV (e.g. pure audio or non-standard container)
            if metadata["duration"] == 0.0 and not is_image:
                import re
                dur_match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", result.stderr)
                if dur_match:
                    hours, minutes, seconds = dur_match.groups()
                    metadata["duration"] = round(int(hours) * 3600 + int(minutes) * 60 + float(seconds), 2)
        except Exception as e:
            logger.warning(f"FFmpeg metadata extraction warning for {file_path}: {e}")

        return metadata

    def extract_audio(self, media_path: str, output_wav: str, sample_rate: int = 16000) -> bool:
        """
        Extract audio track normalized to 16kHz mono 16-bit PCM WAV.
        Works for video containers and audio files.
        """
        ext = os.path.splitext(media_path)[1].lower().lstrip(".")
        if ext in {"png", "jpg", "jpeg", "webp"}:
            return False

        try:
            os.makedirs(os.path.dirname(output_wav), exist_ok=True)
            cmd = [
                self.ffmpeg_exe,
                "-nostdin",
                "-y",                   # Overwrite output
                "-i", media_path,       # Input
                "-vn",                  # Disable video
                "-acodec", "pcm_s16le", # 16-bit PCM
                "-ar", str(sample_rate),# Normalized sample rate
                "-ac", "1",             # Mono channel
                output_wav
            ]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20)
            if res.returncode == 0 and os.path.exists(output_wav) and os.path.getsize(output_wav) > 0:
                return True
            else:
                logger.warning(f"Audio extraction produced empty file or failed for {media_path}")
                return False
        except Exception as e:
            logger.error(f"Error extracting audio from {media_path}: {e}")
            return False

    def extract_frames(
        self,
        video_path: str,
        output_dir: str,
        fps_sample: float = 2.0,
        max_frames: int = 120
    ) -> List[Dict[str, Any]]:
        """
        Extract sample frames at configurable intervals.
        Handles both video containers and static images.
        """
        os.makedirs(output_dir, exist_ok=True)
        extracted = []

        ext = os.path.splitext(video_path)[1].lower().lstrip(".")
        if ext in {"png", "jpg", "jpeg", "webp"}:
            img = cv2.imread(video_path)
            if img is not None:
                h, w = img.shape[:2]
                frame_filename = "frame_0000_0.00s.jpg"
                frame_path = os.path.join(output_dir, frame_filename)
                cv2.imwrite(frame_path, img)
                return [{
                    "frame_index": 0,
                    "sample_index": 0,
                    "timestamp": 0.0,
                    "path": frame_path,
                    "width": w,
                    "height": h
                }]
            return extracted

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Cannot open video for frame extraction: {video_path}")
            return extracted

        video_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        frame_interval = max(1, int(round(video_fps / fps_sample)))

        current_frame = 0
        saved_count = 0

        while saved_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break

            if current_frame % frame_interval == 0:
                timestamp = round(current_frame / video_fps, 2)
                frame_filename = f"frame_{saved_count:04d}_{timestamp:.2f}s.jpg"
                frame_path = os.path.join(output_dir, frame_filename)
                cv2.imwrite(frame_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 85])

                h, w = frame.shape[:2]
                extracted.append({
                    "frame_index": current_frame,
                    "sample_index": saved_count,
                    "timestamp": timestamp,
                    "path": frame_path,
                    "width": w,
                    "height": h
                })
                saved_count += 1

            current_frame += 1

        cap.release()
        return extracted

    def generate_thumbnail(self, video_path: str, output_path: str) -> Optional[str]:
        """Extract first valid frame as thumbnail."""
        ext = os.path.splitext(video_path)[1].lower().lstrip(".")
        if ext in {"png", "jpg", "jpeg", "webp"}:
            img = cv2.imread(video_path)
            if img is not None:
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                cv2.imwrite(output_path, img)
                return output_path
            return None

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None
        ret, frame = cap.read()
        cap.release()
        if ret:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            cv2.imwrite(output_path, frame)
            return output_path
        return None

    def compute_phash(self, file_path: str) -> Optional[str]:
        """
        Compute 64-bit Perceptual Hash (pHash) via 2D Discrete Cosine Transform (DCT)
        on 32x32 grayscale luminance representation.
        """
        try:
            ext = os.path.splitext(file_path)[1].lower().lstrip(".")
            if ext in {"wav", "mp3", "m4a", "aac", "flac"}:
                return None

            img = None
            if ext in {"png", "jpg", "jpeg", "webp"}:
                img = cv2.imread(file_path)
            else:
                cap = cv2.VideoCapture(file_path)
                if cap.isOpened():
                    ret, frame = cap.read()
                    cap.release()
                    if ret:
                        img = frame

            if img is None:
                return None

            # 1. Resize to 32x32 and convert to float32 grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            resized = cv2.resize(gray, (32, 32), interpolation=cv2.INTER_AREA).astype(np.float32)

            # 2. Compute 2D DCT
            dct = cv2.dct(resized)

            # 3. Extract top-left 8x8 DCT coefficients (excluding DC component at [0,0])
            dct_low = dct[:8, :8]
            dct_vals = dct_low.flatten()
            median_val = float(np.median(dct_vals[1:]))

            # 4. Generate 64-bit hash
            bits = "".join(["1" if val > median_val else "0" for val in dct_vals])
            hex_str = f"{int(bits, 2):016x}"
            return hex_str
        except Exception as e:
            logger.warning(f"Error computing pHash for {file_path}: {e}")
            return None


media_service = MediaService()
