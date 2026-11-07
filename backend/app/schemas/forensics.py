from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class SpeakerSegmentSchema(BaseModel):
    id: Optional[str] = None
    speaker_id: str
    start_time: float
    end_time: float
    transcript: Optional[str] = ""

    model_config = ConfigDict(from_attributes=True)


class EvidenceItemSchema(BaseModel):
    id: Optional[str] = None
    timestamp: float
    evidence_type: str
    description: str
    score: float
    metadata_json: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class ModelStatusSchema(BaseModel):
    name: str
    version: str
    operational_mode: str # e.g. "active_model", "baseline_heuristic", "mock_adapter", "unavailable"
    confidence: float
    status: str # "COMPLETED", "SKIPPED", "FAILED", "RUNNING"
    details: Optional[str] = ""


class ForensicResultResponse(BaseModel):
    analysis_id: str
    overall_assessment: str
    overall_score: float
    facial_score: Optional[float] = None
    lip_sync_score: Optional[float] = None
    active_speaker_score: Optional[float] = None
    audio_score: Optional[float] = None
    model_statuses: Dict[str, ModelStatusSchema] = {}
    speaker_segments: List[SpeakerSegmentSchema] = []
    evidence_items: List[EvidenceItemSchema] = []
    transcription: Optional[str] = ""
    detailed_metrics: Dict[str, Any] = {}
    limitations: List[str] = []
    disclaimer: str = ""

    model_config = ConfigDict(from_attributes=True)

