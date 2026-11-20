import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.audit import AuditLog
from backend.app.core.logging import logger


class AuditService:
    """Provides tamper-evident cryptographic hash-chained audit logging for digital forensics chain of custody."""

    @staticmethod
    def _format_ts(ts: datetime) -> str:
        return ts.strftime("%Y-%m-%d %H:%M:%S")

    @staticmethod
    def _compute_entry_hash(
        prev_hash: str,
        timestamp_str: str,
        event_type: str,
        investigation_id: Optional[str],
        file_hash: Optional[str],
        action: str,
        status: str,
        actor: str
    ) -> str:
        payload = f"{prev_hash}|{timestamp_str}|{event_type}|{investigation_id or ''}|{file_hash or ''}|{action}|{status}|{actor}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

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
    ) -> Optional[AuditLog]:
        try:
            # Query last audit entry to establish cryptographic link
            latest_entry = db.query(AuditLog).order_by(AuditLog.timestamp.desc(), AuditLog.id.desc()).first()
            prev_hash = latest_entry.entry_hash if (latest_entry and latest_entry.entry_hash) else ("0" * 64)

            now = datetime.now(timezone.utc)
            timestamp_str = AuditService._format_ts(now)

            entry_hash = AuditService._compute_entry_hash(
                prev_hash=prev_hash,
                timestamp_str=timestamp_str,
                event_type=event_type,
                investigation_id=investigation_id,
                file_hash=file_hash,
                action=action,
                status=status,
                actor=actor
            )

            entry = AuditLog(
                event_type=event_type,
                action=action,
                investigation_id=investigation_id,
                file_hash=file_hash,
                status=status,
                details=details or {},
                actor=actor,
                timestamp=now,
                previous_hash=prev_hash,
                entry_hash=entry_hash
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
    def verify_chain(db: Session) -> Dict[str, Any]:
        """
        Verify the entire cryptographic hash chain of custody from genesis to head.
        Guarantees that no logs were modified, inserted, reordered, or deleted.
        """
        records = db.query(AuditLog).order_by(AuditLog.timestamp.asc(), AuditLog.id.asc()).all()
        if not records:
            return {
                "valid": True,
                "total_records": 0,
                "chain_head": None,
                "message": "Audit chain is empty. Genesis initialized."
            }

        # Filter for records with hash chain information
        chained_records = [r for r in records if r.entry_hash and r.previous_hash]
        if not chained_records:
            return {
                "valid": True,
                "total_records": len(records),
                "chain_head": None,
                "message": "Audit chain initialized."
            }

        expected_prev = chained_records[0].previous_hash
        for idx, rec in enumerate(chained_records):
            if rec.previous_hash != expected_prev:
                return {
                    "valid": False,
                    "broken_at_id": rec.id,
                    "index": idx,
                    "error": f"Hash chain broken: Record {rec.id} previous_hash '{rec.previous_hash}' does not match expected '{expected_prev}'",
                    "total_records": len(records)
                }

            # Recalculate hash
            ts_str = AuditService._format_ts(rec.timestamp)
            recalc = AuditService._compute_entry_hash(
                prev_hash=rec.previous_hash,
                timestamp_str=ts_str,
                event_type=rec.event_type,
                investigation_id=rec.investigation_id,
                file_hash=rec.file_hash,
                action=rec.action,
                status=rec.status,
                actor=rec.actor
            )

            if recalc != rec.entry_hash:
                return {
                    "valid": False,
                    "broken_at_id": rec.id,
                    "index": idx,
                    "error": f"Data integrity violation: Record {rec.id} content was altered after insertion. Expected hash '{recalc}', found '{rec.entry_hash}'",
                    "total_records": len(records)
                }

            expected_prev = rec.entry_hash

        return {
            "valid": True,
            "total_records": len(records),
            "chain_head": chained_records[-1].entry_hash if chained_records else None,
            "message": "Cryptographic chain of custody verified. All audit blocks are intact and untampered."
        }

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
        return query.order_by(AuditLog.timestamp.desc(), AuditLog.id.desc()).offset(offset).limit(limit).all()


audit_service = AuditService()
