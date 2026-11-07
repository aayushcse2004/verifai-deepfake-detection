from backend.app.database.session import Base, engine
from backend.app.models.media import MediaFile
from backend.app.models.analysis import AnalysisJob, AnalysisResult
from backend.app.models.evidence import SpeakerSegment, EvidenceItem
from backend.app.models.settings import SystemSetting

__all__ = [
    "Base",
    "engine",
    "MediaFile",
    "AnalysisJob",
    "AnalysisResult",
    "SpeakerSegment",
    "EvidenceItem",
    "SystemSetting"
]

def init_db():
    Base.metadata.create_all(bind=engine)

