import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  X,
  Sparkles,
  Zap,
  Lock,
  Hash,
  ShieldAlert,
  Info,
  Check,
  FileSearch,
} from 'lucide-react';

import { uploadMedia, startAnalysis } from '../services/api';
import { BENCHMARK_SAMPLES, BenchmarkSample } from '../services/sampleData';
import { generateTestWav } from '../utils/audioGenerator';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Tabs } from '../components/common/Tabs';
import { useToast } from '../components/common/ToastContext';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'upload' | 'benchmark'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'video' | 'audio' | 'image' | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('balanced');
  const [fileHashPreview, setFileHashPreview] = useState<string>('');

  const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wav', 'mp3', 'm4a', 'png', 'jpg', 'jpeg', 'webp'];
  const maxSizeBytes = 250 * 1024 * 1024; // 250MB

  const computeSha256Quick = async (f: File) => {
    try {
      const buffer = await f.slice(0, 1024 * 512).arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setFileHashPreview(`${hashHex}... (Pre-calculated Client Digest)`);
    } catch {
      setFileHashPreview('Calculated server-side during ingestion');
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(ext)) {
      setError(`Unsupported file format '.${ext}'. Permitted: MP4, MOV, AVI, MKV, WAV, MP3, M4A, PNG, JPG, WEBP.`);
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds 250 MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    setFile(selectedFile);
    const isVid = ['mp4', 'mov', 'avi', 'mkv'].includes(ext);
    const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
    setFileType(isVid ? 'video' : isImg ? 'image' : 'audio');

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    computeSha256Quick(selectedFile);
  };

  const handleBenchmarkSelect = (sample: BenchmarkSample) => {
    let anomalyType: 'genuine' | 'faceswap' | 'voiceclone' | 'dubbed' = 'genuine';
    if (sample.category === 'Synthetic Face-Swap') anomalyType = 'faceswap';
    else if (sample.category === 'Acoustic AI Voice Clone') anomalyType = 'voiceclone';
    else if (sample.category === 'Dubbed Translation Lag') anomalyType = 'dubbed';

    const testFile = generateTestWav(sample.duration, anomalyType);
    handleFileSelection(testFile);
    setActiveTab('upload');
    showToast({
      type: 'info',
      title: 'Benchmark Scenario Selected',
      message: `Loaded synthetic test fixture: ${sample.title}`,
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleClearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setFileHashPreview('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartInvestigation = async () => {
    if (!file) {
      setError('Please select a media file to begin investigation.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadRes = await uploadMedia(file, (pct) => setProgress(pct));
      showToast({
        type: 'success',
        title: 'Ingestion Sealed',
        message: 'File verified with SHA-256 and appended to Chain of Custody.',
      });

      await startAnalysis(uploadRes.analysis_id);
      navigate(`/processing/${uploadRes.analysis_id}`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to ingest file. Check format and server connection.');
      setUploading(false);
      showToast({
        type: 'error',
        title: 'Ingestion Failed',
        message: err?.response?.data?.detail || 'Could not upload asset.',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="New Forensic Investigation"
        subtitle="Ingest digital audio, video, or imagery into the multimodal forensic pipeline with cryptographic chain-of-custody sealing"
        icon={<UploadCloud className="w-6 h-6" />}
        breadcrumbs={[{ label: 'Workspace', to: '/dashboard' }, { label: 'New Investigation' }]}
      />

      {/* 5-Step Pipeline Process Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
        {[
          { step: '01', title: 'Select Media', desc: 'Container probe' },
          { step: '02', title: 'Validate Header', desc: 'Magic bytes check' },
          { step: '03', title: 'Digest Seal', desc: 'SHA-256 block hash' },
          { step: '04', title: 'Configure AI', desc: 'Preset & weights' },
          { step: '05', title: 'Execution', desc: 'CUDA GPU inference' },
        ].map((s, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border ${
              (idx === 0 && !file) || (idx === 1 && file && !uploading) || (idx > 1 && uploading)
                ? 'bg-[#6366F1]/10 border-[#6366F1]/40 text-[#818CF8]'
                : 'bg-[#0E1424] border-[#1E293B] text-[#64748B]'
            }`}
          >
            <span className="text-[10px] text-[#06B6D4] font-bold block mb-1">STAGE {s.step}</span>
            <p className="font-semibold text-white truncate">{s.title}</p>
            <p className="text-[10px] text-[#64748B] truncate">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Tab Switcher: Direct Upload vs Benchmark Scenarios */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
        tabs={[
          { id: 'upload', label: 'Direct Media Ingestion', icon: <UploadCloud className="w-4 h-4" /> },
          { id: 'benchmark', label: 'Academic Benchmark Scenarios', icon: <Sparkles className="w-4 h-4" /> },
        ]}
      />

      {error && (
        <div className="p-4 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-white block">Ingestion Invalidation</span>
            <p className="text-[#FCA5A5] mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {activeTab === 'upload' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Zone (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-12 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[320px] ${
                  dragActive
                    ? 'border-[#06B6D4] bg-[#06B6D4]/10 scale-[1.01]'
                    : 'border-[#1E293B] bg-[#0E1424]/80 hover:border-[#6366F1]/50 hover:bg-[#0E1424]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".mp4,.mov,.avi,.mkv,.wav,.mp3,.m4a,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                />

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366F1]/20 to-[#06B6D4]/20 border border-[#6366F1]/30 flex items-center justify-center text-[#06B6D4] mb-4 shadow-xl">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  Drag and drop media asset here, or click to browse
                </h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mb-6">
                  Supports video, audio, and high-resolution face images up to 250 MB
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                  <Badge variant="accent">MP4 / MOV / AVI / MKV</Badge>
                  <Badge variant="primary">WAV / MP3 / M4A</Badge>
                  <Badge variant="success">PNG / JPG / WEBP</Badge>
                </div>
              </div>
            ) : (
              /* Selected Asset File Card & Preview */
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
                      {fileType === 'video' ? (
                        <FileVideo className="w-5 h-5" />
                      ) : fileType === 'image' ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : (
                        <FileAudio className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{file.name}</CardTitle>
                      <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {fileType?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      onClick={handleClearSelection}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
                      title="Clear Selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Media Preview Box */}
                  <div className="aspect-video bg-black rounded-xl overflow-hidden border border-[#1E293B] flex items-center justify-center relative">
                    {fileType === 'video' && previewUrl ? (
                      <video src={previewUrl} controls className="w-full h-full object-contain" />
                    ) : fileType === 'image' && previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    ) : fileType === 'audio' && previewUrl ? (
                      <div className="w-full px-8 py-6 text-center space-y-3">
                        <FileAudio className="w-12 h-12 text-[#6366F1] mx-auto animate-pulse" />
                        <audio src={previewUrl} controls className="w-full" />
                      </div>
                    ) : null}
                  </div>

                  {/* Cryptographic SHA-256 Digest Preview */}
                  <div className="p-3 rounded-lg bg-[#070A13] border border-[#1E293B] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-[#94A3B8]">
                      <Hash className="w-4 h-4 text-[#06B6D4]" />
                      <span>SHA-256 Pre-digest:</span>
                    </div>
                    <span className="text-white truncate max-w-[280px]">{fileHashPreview}</span>
                  </div>

                  {uploading && (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">Ingesting & verifying signatures...</span>
                        <span className="text-[#06B6D4] font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Forensic Pipeline Configuration Sidebar (1 Col) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Analysis Configuration</CardTitle>
                <Sliders className="w-4 h-4 text-[#06B6D4]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white">Detection Preset</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'fast', title: 'Rapid Triage', desc: 'Face detection & audio PSD' },
                      { id: 'balanced', title: 'Balanced Multimodal', desc: 'Full late-fusion pipeline (Recommended)' },
                      { id: 'thorough', title: 'Deep Forensic Scan', desc: 'Full pipeline with frame-stepping' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedPreset === preset.id
                            ? 'bg-[#6366F1]/10 border-[#6366F1] text-white'
                            : 'bg-[#070A13] border-[#1E293B] text-[#94A3B8] hover:border-[#334155]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{preset.title}</span>
                          {selectedPreset === preset.id && <Check className="w-3.5 h-3.5 text-[#06B6D4]" />}
                        </div>
                        <p className="text-[10px] text-[#64748B] mt-0.5">{preset.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pipeline Modules Enabled Indicator */}
                <div className="p-3.5 rounded-xl bg-[#070A13] border border-[#1E293B] space-y-2.5">
                  <span className="text-[10px] font-mono uppercase text-[#64748B] font-semibold block">
                    Enabled AI Modules
                  </span>
                  {[
                    'MesoNet-4 Facial Artifact CNN',
                    'SyncNet AV Lip-Sync Correlation',
                    'TalkNet Active Speaker Tracker',
                    'pyannote.audio Speaker Diarization',
                    'OpenAI Whisper Speech Recognizer',
                    'Welch PSD Acoustic Vocoder DSP',
                  ].map((mod, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{mod}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                    </div>
                  ))}
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  className="w-full font-bold shadow-lg shadow-[#06B6D4]/20"
                  disabled={!file || uploading}
                  isLoading={uploading}
                  onClick={handleStartInvestigation}
                >
                  {uploading ? 'Ingesting Asset...' : 'Launch Forensic Investigation'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Academic Benchmark Demonstration Scenarios */
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[#06B6D4]/30 bg-[#06B6D4]/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#06B6D4]" />
              <div className="text-xs">
                <span className="font-bold text-white block">Pre-configured Academic Benchmarks</span>
                <p className="text-[#94A3B8]">
                  Select an academic research test scenario to generate an instant synthetic media stream and test pipeline sensitivity.
                </p>
              </div>
            </div>
            <Badge variant="accent">Demo Suite</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BENCHMARK_SAMPLES.map((sample) => (
              <Card
                key={sample.id}
                interactive
                onClick={() => handleBenchmarkSelect(sample)}
                className="hover:border-[#06B6D4]/50"
              >
                <CardHeader>
                  <div>
                    <CardTitle className="text-sm">{sample.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {sample.category}
                    </Badge>
                  </div>
                  <Button variant="outline" size="xs">
                    Load Test <Play className="w-3 h-3 ml-1 fill-current" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{sample.description}</p>
                  <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                    <span>Expected Risk: {sample.expectedRisk}</span>
                    <span>Duration: {sample.duration}s</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
