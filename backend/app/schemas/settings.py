from typing import Dict, Any, Optional
from pydantic import BaseModel


class SystemSettingsResponse(BaseModel):
    max_upload_size_mb: int
    allowed_extensions: str
    device: str
    whisper_model: str
    weight_facial: float
    weight_lip_sync: float
    weight_active_speaker: float
    weight_audio: float
    total_analyses: int
    system_status: str


class SettingsUpdateRequest(BaseModel):
    max_upload_size_mb: Optional[int] = None
    weight_facial: Optional[float] = None
    weight_lip_sync: Optional[float] = None
    weight_active_speaker: Optional[float] = None
    weight_audio: Optional[float] = None
