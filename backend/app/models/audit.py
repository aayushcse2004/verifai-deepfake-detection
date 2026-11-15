import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, JSON
from backend.app.database.session import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    event_type = Column(String(100), nullable=False) # UPLOAD, ANALYSIS_START, STAGE_COMPLETE, REPORT_GENERATED, HASH_VERIFIED, CANCELLED, DELETED
    investigation_id = Column(String(36), nullable=True, index=True)
    file_hash = Column(String(64), nullable=True, index=True)
    actor = Column(String(100), default="System / Forensic Engine")
    action = Column(String(255), nullable=False)
    status = Column(String(50), default="SUCCESS") # SUCCESS, WARNING, FAILURE
    details = Column(JSON, default=dict)

