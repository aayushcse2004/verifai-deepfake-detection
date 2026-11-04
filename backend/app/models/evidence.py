import uuid
from sqlalchemy import Column, String, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class SpeakerSegment(Base):
    __tablename__ = "speaker_segments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), nullable=False)
    speaker_id = Column(String(50), nullable=False) # e.g. SPEAKER_00
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    transcript = Column(Text, nullable=True)

    job = relationship("AnalysisJob", back_populates="speaker_segments")


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(Float, nullable=False) # timestamp in seconds
    evidence_type = Column(String(100), nullable=False) # facial_manipulation, lip_sync_offset, audio_anomaly, speaker_mismatch
    description = Column(Text, nullable=False)
    score = Column(Float, nullable=False)
    metadata_json = Column(JSON, default=dict)

    job = relationship("AnalysisJob", back_populates="evidence_items")
