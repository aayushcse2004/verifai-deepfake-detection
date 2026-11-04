import os
import subprocess
from typing import Dict, Any, List, Optional
import cv2
import imageio_ffmpeg
from backend.app.core.logging import logger


class MediaService:
    def __init__(self):
        self.ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    def get_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extract metadata for video or audio file using OpenCV and FFmpeg probe."""
        metadata = {
            "duration": 0.0,
            "width": 0,
            "height": 0,
            "fps": 0.0,
            "total_frames": 0,
            "has_video": False,
            "has_audio": False,
            "codec": "unknown"
        }

        ext = os.path.splitext(file_path)[1].lower().lstrip(".")
        is_audio_only = ext in {"wav", "mp3", "m4a", "aac", "flac"}

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
            if metadata["duration"] == 0.0:
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
        Works for both video containers (MP4, MKV, MOV, AVI) and audio formats (MP3, M4A, WAV).
        """
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
                logger.warning(f"Audio extraction produced empty file or failed: {res.stderr.decode('utf-8', errors='ignore')}")
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
        Avoids loading full video into RAM by streaming sequentially.
        Returns list of {frame_idx, timestamp, path, width, height}.
        """
        os.makedirs(output_dir, exist_ok=True)
        extracted = []

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


media_service = MediaService()
