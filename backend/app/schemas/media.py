from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class MediaFileResponse(BaseModel):
    id: str
    original_filename: str
    file_type: str
    file_size: int
    duration: Optional[float] = 0.0
    file_hash: str
    upload_timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class MediaUploadResponse(BaseModel):
    media: MediaFileResponse
    analysis_id: str
    message: str

