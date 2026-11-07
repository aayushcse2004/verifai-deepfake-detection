import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    media_id = Column(String(36), ForeignKey("media_files.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    current_stage = Column(String(100), default="Initialized")
    progress = Column(Integer, default=0) # 0 to 100
    stage_logs = Column(JSON, default=list) # List of logged stage events
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    # Relationships
    media = relationship("MediaFile", back_populates="jobs")
    result = relationship("AnalysisResult", uselist=False, back_populates="job", cascade="all, delete-orphan")
    speaker_segments = relationship("SpeakerSegment", back_populates="job", cascade="all, delete-orphan")
    evidence_items = relationship("EvidenceItem", back_populates="job", cascade="all, delete-orphan")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), nullable=False, unique=True)
    overall_assessment = Column(String(100), nullable=False) # LOW EVIDENCE OF MANIPULATION, INCONCLUSIVE, POTENTIAL MANIPULATION DETECTED
    overall_score = Column(Float, nullable=False) # 0.0 (genuine) to 1.0 (manipulated)
    facial_score = Column(Float, nullable=True)
    lip_sync_score = Column(Float, nullable=True)
    active_speaker_score = Column(Float, nullable=True)
    audio_score = Column(Float, nullable=True)
    model_statuses = Column(JSON, default=dict) # status/details of individual models
    result_json = Column(JSON, default=dict)    # comprehensive detailed forensics

    job = relationship("AnalysisJob", back_populates="result")

