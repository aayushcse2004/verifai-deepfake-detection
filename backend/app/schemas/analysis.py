from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.media import MediaFileResponse
from backend.app.schemas.forensics import ForensicResultResponse


class StageLogEntry(BaseModel):
    stage: str
    progress: int
    timestamp: str
    message: str


class AnalysisJobResponse(BaseModel):
    id: str
    media_id: str
    status: str
    current_stage: str
    progress: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    stage_logs: Optional[List[Dict[str, Any]]] = []
    media: Optional[MediaFileResponse] = None

    model_config = ConfigDict(from_attributes=True)


class AnalysisStatusResponse(BaseModel):
    analysis_id: str
    status: str
    current_stage: str
    progress: int
    stage_logs: List[Dict[str, Any]] = []
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class AnalysisDetailResponse(BaseModel):
    job: AnalysisJobResponse
    result: Optional[ForensicResultResponse] = None

