import axios from 'axios';
import {
  AnalysisJob,
  ForensicResult,
  SystemHealth,
  SystemSettings
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

export const getAnalysisStatus = async (analysisId: string): Promise<{
  analysis_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
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

export const getAnalysisHistory = async (limit = 50): Promise<AnalysisJob[]> => {
  const response = await api.get(`/analysis/history?limit=${limit}`);
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

export const getSettings = async (): Promise<SystemSettings> => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await api.put('/settings', data);
  return response.data;
};

export const getReportDownloadUrl = (analysisId: string): string => {
  return `/api/v1/analysis/${analysisId}/report`;
};

export default api;

