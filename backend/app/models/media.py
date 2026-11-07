import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False, unique=True)
    file_type = Column(String(50), nullable=False)  # 'video' or 'audio'
    file_size = Column(Integer, nullable=False)     # in bytes
    duration = Column(Float, nullable=True, default=0.0) # in seconds
    file_hash = Column(String(64), nullable=False) # SHA-256
    upload_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    jobs = relationship("AnalysisJob", back_populates="media", cascade="all, delete-orphan")

