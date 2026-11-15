from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.audit import AuditLog
from backend.app.core.logging import logger


class AuditService:
    """Provides append-only logging for digital forensics chain of custody."""

    @staticmethod
    def log_event(
        db: Session,
        event_type: str,
        action: str,
        investigation_id: Optional[str] = None,
        file_hash: Optional[str] = None,
        status: str = "SUCCESS",
        details: Optional[Dict[str, Any]] = None,
        actor: str = "Forensic Engine"
    ) -> AuditLog:
        try:
            entry = AuditLog(
                event_type=event_type,
                action=action,
                investigation_id=investigation_id,
                file_hash=file_hash,
                status=status,
                details=details or {},
                actor=actor,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(entry)
            db.commit()
            db.refresh(entry)
            return entry
        except Exception as e:
            logger.error(f"Failed to record audit log: {e}")
            db.rollback()
            return None

    @staticmethod
    def get_logs(
        db: Session,
        limit: int = 100,
        offset: int = 0,
        event_type: Optional[str] = None,
        investigation_id: Optional[str] = None
    ) -> List[AuditLog]:
        query = db.query(AuditLog)
        if event_type:
            query = query.filter(AuditLog.event_type == event_type)
        if investigation_id:
            query = query.filter(AuditLog.investigation_id == investigation_id)
        return query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()


audit_service = AuditService()

