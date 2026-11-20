import os
import shutil
import time
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.models.analysis import AnalysisJob
from backend.app.models.media import MediaFile
from backend.app.services.audit_service import audit_service


class CleanupService:
    """
    Manages forensic data retention, purge of orphaned temporary frames,
    and disk space reclaiming in compliance with forensic lifecycle policies.
    """

    @staticmethod
    def inspect_and_cleanup(
        db: Session,
        max_age_days: int = 14,
        dry_run: bool = True,
        purge_orphaned_frames: bool = True
    ) -> Dict[str, Any]:
        """
        Inspect storage directories, identify expired or orphaned assets,
        and optionally purge them.
        """
        now = time.time()
        age_threshold_sec = max_age_days * 86400
        purged_files = []
        purged_dirs = []
        bytes_reclaimed = 0

        # 1. Clean temporary verification files in UPLOAD_DIR
        if os.path.exists(settings.UPLOAD_DIR):
            for fname in os.listdir(settings.UPLOAD_DIR):
                fpath = os.path.join(settings.UPLOAD_DIR, fname)
                if not os.path.isfile(fpath):
                    continue

                is_temp = fname.startswith("verify_")
                mtime = os.path.getmtime(fpath)
                is_expired = (now - mtime) > age_threshold_sec

                if is_temp or is_expired:
                    size = os.path.getsize(fpath)
                    bytes_reclaimed += size
                    purged_files.append({"filename": fname, "size_bytes": size, "reason": "temp_or_expired"})
                    if not dry_run:
                        try:
                            os.remove(fpath)
                        except Exception as e:
                            logger.warning(f"Could not delete {fpath}: {e}")

        # 2. Inspect orphaned frame directories in FRAME_DIR
        if purge_orphaned_frames and os.path.exists(settings.FRAME_DIR):
            active_job_ids = {row[0] for row in db.query(AnalysisJob.id).all()}

            for dname in os.listdir(settings.FRAME_DIR):
                dpath = os.path.join(settings.FRAME_DIR, dname)
                if not os.path.isdir(dpath):
                    continue

                # Directory names in FRAME_DIR are investigation/job IDs
                is_orphan = dname not in active_job_ids
                mtime = os.path.getmtime(dpath)
                is_expired = (now - mtime) > age_threshold_sec

                if is_orphan or is_expired:
                    # Calculate directory size
                    dir_size = 0
                    for root, _, files in os.walk(dpath):
                        for f in files:
                            fp = os.path.join(root, f)
                            dir_size += os.path.getsize(fp)

                    bytes_reclaimed += dir_size
                    purged_dirs.append({
                        "directory": dname,
                        "size_bytes": dir_size,
                        "reason": "orphaned_investigation" if is_orphan else "expired_retention"
                    })

                    if not dry_run:
                        try:
                            shutil.rmtree(dpath, ignore_errors=True)
                        except Exception as e:
                            logger.warning(f"Could not delete dir {dpath}: {e}")

        reclaimed_mb = round(bytes_reclaimed / (1024 * 1024), 2)

        # 3. If live execution, record audit trail entry
        if not dry_run and (purged_files or purged_dirs):
            audit_service.log_event(
                db,
                event_type="CLEANUP",
                action=f"Storage cleanup executed: {len(purged_files)} files, {len(purged_dirs)} dirs purged ({reclaimed_mb} MB reclaimed)",
                status="SUCCESS",
                details={
                    "files_count": len(purged_files),
                    "dirs_count": len(purged_dirs),
                    "reclaimed_mb": reclaimed_mb,
                    "retention_days": max_age_days
                },
                actor="System Retention Policy Engine"
            )

        return {
            "dry_run": dry_run,
            "max_age_days": max_age_days,
            "purged_files_count": len(purged_files),
            "purged_directories_count": len(purged_dirs),
            "reclaimed_bytes": bytes_reclaimed,
            "reclaimed_mb": reclaimed_mb,
            "purged_files_preview": purged_files[:20],
            "purged_dirs_preview": purged_dirs[:20]
        }


cleanup_service = CleanupService()

