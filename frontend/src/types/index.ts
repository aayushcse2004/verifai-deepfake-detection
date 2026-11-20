export interface MediaFile {
  id: string;
  original_filename: string;
  stored_filename?: string;
  file_type: 'video' | 'audio' | 'image';
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
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
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

export interface SystemMonitorData {
  status: string;
  cpu: {
    utilization_pct: number;
    cores_logical: number;
    cores_physical: number;
  };
  memory: {
    total_gb: number;
    used_gb: number;
    utilization_pct: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    utilization_pct: number;
    storage_path: string;
  };
  gpu: {
    available: boolean;
    name: string;
    driver_version: string;
    utilization_pct: number;
    memory_used_mb: number;
    memory_total_mb: number;
    memory_usage_pct: number;
    temperature_c: number;
    cuda_compatible: boolean;
  };
  workload: {
    active_investigations: number;
    queued_investigations: number;
    completed_investigations: number;
    failed_investigations: number;
    total_processed: number;
  };
}

export interface ModelRegistryItem {
  id: string;
  name: string;
  version: string;
  type: string;
  source: string;
  license: string;
  checkpoint_file: string;
  checkpoint_available: boolean;
  device: string;
  loading_status: string;
  supported_formats: string[];
  preprocessing: string;
  benchmark_accuracy: string;
  last_executed: string;
}

export interface BenchmarkDataset {
  id: string;
  dataset_name: string;
  source: string;
  license: string;
  modality: string;
  splits: Record<string, number>;
  methods_evaluated: string[];
  metric_type: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: {
      true_positive: number;
      false_positive: number;
      true_negative: number;
      false_negative: number;
    };
    avg_latency_ms: number;
    peak_vram_mb: number;
  };
  notes: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  event_type: string;
  investigation_id?: string;
  file_hash?: string;
  actor: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
  details?: Record<string, any>;
}

export interface ComparisonResult {
  verdict: string;
  hash_match: boolean;
  asset_a: {
    name: string;
    sha256: string;
    size_bytes: number;
    metadata: Record<string, any>;
    phash?: string;
  };
  asset_b: {
    name: string;
    sha256: string;
    size_bytes: number;
    metadata: Record<string, any>;
    phash?: string;
  };
  visual_similarity?: {
    phash_a: string;
    phash_b: string;
    hamming_distance: number;
    similarity_pct: number;
    interpretation: string;
  };
  audio_comparison?: {
    comparable: boolean;
    reason?: string;
    sample_rate?: number;
    correlation?: number;
    acoustic_similarity_pct?: number;
    identical_audio?: boolean;
  };
  differences: string[];
  summary: string;
}
