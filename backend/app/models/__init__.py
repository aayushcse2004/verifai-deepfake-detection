from sqlalchemy import text
from backend.app.database.session import Base, engine
from backend.app.models.media import MediaFile
from backend.app.models.analysis import AnalysisJob, AnalysisResult
from backend.app.models.evidence import SpeakerSegment, EvidenceItem
from backend.app.models.settings import SystemSetting
from backend.app.models.audit import AuditLog

__all__ = [
    "Base",
    "engine",
    "MediaFile",
    "AnalysisJob",
    "AnalysisResult",
    "SpeakerSegment",
    "EvidenceItem",
    "SystemSetting",
    "AuditLog"
]

def init_db():
    Base.metadata.create_all(bind=engine)

    # Automatic schema migration for new audit columns in existing databases
    with engine.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(audit_logs);")).fetchall()
            existing_cols = {row[1] for row in res}
            if existing_cols:
                if "previous_hash" not in existing_cols:
                    conn.execute(text("ALTER TABLE audit_logs ADD COLUMN previous_hash VARCHAR(64);"))
                if "entry_hash" not in existing_cols:
                    conn.execute(text("ALTER TABLE audit_logs ADD COLUMN entry_hash VARCHAR(64);"))
                conn.commit()
        except Exception:
            pass
