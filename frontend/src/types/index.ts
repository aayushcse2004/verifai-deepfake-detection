export interface MediaFile {
  id: string;
  original_filename: string;
  file_type: 'video' | 'audio';
  file_size: number;
  duration?: number;
  file_hash: string;
  upload_timestamp: string;
}

export interface StageLog {
  stage: string;
  progress: number;
  timestamp: string;
  message: string;
}

export interface AnalysisJob {
  id: string;
  media_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  current_stage: string;
  progress: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  stage_logs?: StageLog[];
  media?: MediaFile;
}

export interface SpeakerSegment {
  id?: string;
  speaker_id: string;
  start_time: number;
  end_time: number;
  transcript?: string;
}

export interface EvidenceItem {
  id?: string;
  timestamp: number;
  evidence_type: string;
  description: string;
  score: number;
  metadata_json?: Record<string, any>;
}

export interface ModelStatus {
  name: string;
  version: string;
  operational_mode: 'active_model' | 'baseline_heuristic' | 'mock_adapter' | 'unavailable';
  confidence: number;
  status: string;
  details?: string;
}

export interface FaceSample {
  timestamp: number;
  track_id: string;
  bbox: number[];
  crop_filename: string;
}

export interface ForensicResult {
  analysis_id: string;
  overall_assessment: 'LOW EVIDENCE OF MANIPULATION' | 'INCONCLUSIVE' | 'POTENTIAL MANIPULATION DETECTED';
  overall_score: number;
  facial_score?: number | null;
  lip_sync_score?: number | null;
  active_speaker_score?: number | null;
  audio_score?: number | null;
  model_statuses: Record<string, ModelStatus>;
  speaker_segments: SpeakerSegment[];
  evidence_items: EvidenceItem[];
  transcription?: string;
  detailed_metrics: {
    facial?: Record<string, any>;
    lip_sync?: Record<string, any>;
    active_speaker?: Record<string, any>;
    audio?: Record<string, any>;
    diarization?: Record<string, any>;
    asr?: Record<string, any>;
    face_samples?: FaceSample[];
  };
  limitations: string[];
  disclaimer: string;
}

export interface SystemHealth {
  status: string;
  service: string;
  database: string;
  storage: string;
  device: string;
  models: Record<string, {
    name: string;
    version: string;
    operational_mode: string;
    available: boolean;
  }>;
}

export interface SystemSettings {
  max_upload_size_mb: number;
  allowed_extensions: string;
  device: string;
  whisper_model: string;
  weight_facial: number;
  weight_lip_sync: number;
  weight_active_speaker: number;
  weight_audio: number;
  total_analyses: number;
  system_status: string;
}

