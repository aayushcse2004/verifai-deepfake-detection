import os
from typing import List, Dict, Any, Tuple, Optional
import cv2
import numpy as np
from backend.app.core.logging import logger


class FaceDetector:
    def __init__(self):
        cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        profile_path = os.path.join(cv2.data.haarcascades, "haarcascade_profileface.xml")

        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        self.profile_cascade = cv2.CascadeClassifier(profile_path)
        self.version = "OpenCV-Haar-v4.9"

    def detect_in_image(
        self,
        image_bgr: np.ndarray,
        min_size: Tuple[int, int] = (45, 45)
    ) -> List[Dict[str, Any]]:
        """
        Detect faces in a single BGR image.
        Returns list of detections with [x, y, w, h], relative box, and face crop.
        """
        if image_bgr is None or image_bgr.size == 0:
            return []

        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        # Detect with reject levels / weights to obtain confidence
        faces, reject_levels, level_weights = self.face_cascade.detectMultiScale3(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=min_size,
            outputRejectLevels=True
        )

        detections = []
        h_img, w_img = image_bgr.shape[:2]

        for i, (x, y, w, h) in enumerate(faces):
            confidence = float(level_weights[i]) if len(level_weights) > i else 1.0
            norm_conf = min(1.0, max(0.4, confidence / 10.0))

            # Expand crop slightly with margin
            pad_x = int(w * 0.1)
            pad_y = int(h * 0.1)
            x1 = max(0, x - pad_x)
            y1 = max(0, y - pad_y)
            x2 = min(w_img, x + w + pad_x)
            y2 = min(h_img, y + h + pad_y)

            crop = image_bgr[y1:y2, x1:x2]

            detections.append({
                "bbox": [int(x), int(y), int(w), int(h)],
                "rel_bbox": [round(x / w_img, 4), round(y / h_img, 4), round(w / w_img, 4), round(h / h_img, 4)],
                "confidence": round(norm_conf, 3),
                "crop": crop
            })

        return detections

    def process_sampled_frames(
        self,
        frames: List[Dict[str, Any]],
        output_crops_dir: str
    ) -> Dict[str, Any]:
        """
        Process frames extracted from video, tracking faces and saving crops.
        """
        os.makedirs(output_crops_dir, exist_ok=True)
        all_face_records = []
        tracks = {} # track_id -> last_center
        next_track_id = 1

        for frame_info in frames:
            img = cv2.imread(frame_info["path"])
            if img is None:
                continue

            dets = self.detect_in_image(img)
            timestamp = frame_info["timestamp"]

            for det in dets:
                x, y, w, h = det["bbox"]
                center = (x + w / 2, y + h / 2)

                # Simple spatial tracking across consecutive frames
                assigned_id = None
                for tid, last_center in tracks.items():
                    dist = np.hypot(center[0] - last_center[0], center[1] - last_center[1])
                    if dist < (w * 1.5): # nearby face in consecutive sample
                        assigned_id = tid
                        tracks[tid] = center
                        break

                if assigned_id is None:
                    assigned_id = f"face_track_{next_track_id:02d}"
                    next_track_id += 1
                    tracks[assigned_id] = center

                # Save crop
                crop_filename = f"crop_{assigned_id}_{timestamp:.2f}s.jpg"
                crop_path = os.path.join(output_crops_dir, crop_filename)
                if det["crop"] is not None and det["crop"].size > 0:
                    cv2.imwrite(crop_path, det["crop"])

                all_face_records.append({
                    "track_id": assigned_id,
                    "timestamp": timestamp,
                    "bbox": det["bbox"],
                    "rel_bbox": det["rel_bbox"],
                    "confidence": det["confidence"],
                    "crop_filename": crop_filename,
                    "crop_path": crop_path
                })

        unique_tracks = list(tracks.keys())
        summary = {
            "total_face_instances": len(all_face_records),
            "unique_faces_tracked": len(unique_tracks),
            "face_records": all_face_records,
            "tracks": unique_tracks,
            "faces_detected": len(all_face_records) > 0
        }
        return summary


face_detector = FaceDetector()
