import axios from 'axios';
import {
  AnalysisJob,
  ForensicResult,
  SystemHealth,
  SystemSettings,
  SystemMonitorData,
  ModelRegistryItem,
  BenchmarkDataset,
  AuditLogItem,
  ComparisonResult
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const uploadMedia = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ analysis_id: string; message: string; media: any }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

export const startAnalysis = async (analysisId: string): Promise<{ message: string; status: string }> => {
  const response = await api.post(`/analysis/${analysisId}/start`);
  return response.data;
};

export const cancelAnalysis = async (analysisId: string): Promise<{ message: string; status: string }> => {
  const response = await api.post(`/analysis/${analysisId}/cancel`);
  return response.data;
};

export const retryAnalysis = async (analysisId: string): Promise<{ message: string; status: string }> => {
  const response = await api.post(`/analysis/${analysisId}/retry`);
  return response.data;
};

export const getAnalysisStatus = async (analysisId: string): Promise<{
  analysis_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  current_stage: string;
  progress: number;
  stage_logs: any[];
  completed_at?: string;
  error_message?: string;
}> => {
  const response = await api.get(`/analysis/${analysisId}/status`);
  return response.data;
};

export const getAnalysisResults = async (analysisId: string): Promise<ForensicResult> => {
  const response = await api.get(`/analysis/${analysisId}/results`);
  return response.data;
};

export const getAnalysisHistory = async (
  limit = 50,
  offset = 0,
  search?: string,
  fileType?: string
): Promise<AnalysisJob[]> => {
  let url = `/analysis/history?limit=${limit}&offset=${offset}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (fileType) url += `&file_type=${encodeURIComponent(fileType)}`;
  const response = await api.get(url);
  return response.data;
};

export const deleteAnalysis = async (analysisId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/analysis/${analysisId}`);
  return response.data;
};

export const getSystemHealth = async (): Promise<SystemHealth> => {
  const response = await api.get('/health');
  return response.data;
};

export const getSystemMonitor = async (): Promise<SystemMonitorData> => {
  const response = await api.get('/system/monitor');
  return response.data;
};

export const getModelRegistry = async (): Promise<ModelRegistryItem[]> => {
  const response = await api.get('/models');
  return response.data;
};

export const runModelTest = async (modelId: string): Promise<{
  model_id: string;
  status: string;
  operational_mode: string;
  latency_ms: number;
  diagnostic_output?: any;
  message: string;
}> => {
  const response = await api.post(`/models/${modelId}/test`);
  return response.data;
};

export const getEvaluationBenchmarks = async (): Promise<{
  datasets: BenchmarkDataset[];
  summary: {
    total_datasets: number;
    multimodal_avg_auc: number;
    multimodal_avg_f1: number;
    tested_modalities: string[];
    disclaimer: string;
  };
}> => {
  const response = await api.get('/evaluation/benchmarks');
  return response.data;
};

export const getAuditLogs = async (
  limit = 100,
  offset = 0,
  eventType?: string,
  investigationId?: string
): Promise<{
  total: number;
  limit: number;
  offset: number;
  items: AuditLogItem[];
}> => {
  let url = `/audit/logs?limit=${limit}&offset=${offset}`;
  if (eventType) url += `&event_type=${encodeURIComponent(eventType)}`;
  if (investigationId) url += `&investigation_id=${encodeURIComponent(investigationId)}`;
  const response = await api.get(url);
  return response.data;
};

export const verifyCustodyHash = async (
  file?: File,
  claimedHash?: string,
  investigationId?: string
): Promise<{
  verified: boolean;
  computed_sha256: string;
  matched_record?: any;
  assessment: string;
}> => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (claimedHash) formData.append('claimed_hash', claimedHash);
  if (investigationId) formData.append('investigation_id', investigationId);

  const response = await api.post('/audit/verify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const verifyAuditHashChain = async (): Promise<{
  valid: boolean;
  total_records: number;
  chain_head?: string;
  message?: string;
  error?: string;
  broken_at_id?: string;
}> => {
  const response = await api.get('/audit/verify-chain');
  return response.data;
};

export const compareMediaAssets = async (fileA: File, fileB: File): Promise<ComparisonResult> => {
  const formData = new FormData();
  formData.append('file_a', fileA);
  formData.append('file_b', fileB);

  const response = await api.post('/media/compare', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getSettings = async (): Promise<SystemSettings> => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await api.put('/settings', data);
  return response.data;
};

export const triggerStorageCleanup = async (
  maxAgeDays: number = 14,
  dryRun: boolean = true,
  purgeOrphanedFrames: boolean = true
): Promise<{
  dry_run: boolean;
  max_age_days: number;
  files_deleted: number;
  bytes_freed: number;
  records_updated: number;
  details: string[];
}> => {
  const response = await api.post('/system/cleanup', null, {
    params: {
      max_age_days: maxAgeDays,
      dry_run: dryRun,
      purge_orphaned_frames: purgeOrphanedFrames,
    },
  });
  return response.data;
};

export const getReportDownloadUrl = (analysisId: string): string => {
  return `/api/v1/analysis/${analysisId}/report`;
};

export default api;
