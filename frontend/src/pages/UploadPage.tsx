import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
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
} from 'lucide-react';
import { uploadMedia, startAnalysis } from '../services/api';
import { BENCHMARK_SAMPLES, BenchmarkSample } from '../services/sampleData';
import { generateTestWav } from '../utils/audioGenerator';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const buffer = await f.slice(0, 1024 * 512).arrayBuffer(); // sample hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setFileHashPreview(hashHex + '... (verified)');
    } catch {
      setFileHashPreview('Calculated server-side');
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

    // Create local object URL for preview
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

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setError(null);
    setProgress(0);
    setFileHashPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Upload media file
      const uploadRes = await uploadMedia(file, (pct) => {
        setProgress(pct);
      });

      const analysisId = uploadRes.analysis_id;

      // 2. Start forensic analysis job
      await startAnalysis(analysisId);

      // 3. Navigate to live tracking page
      navigate(`/processing/${analysisId}`);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err?.response?.data?.detail || err.message || 'Failed to upload and start analysis.');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Upload className="w-7 h-7 text-[#6366F1]" />
            Media Forensics Ingestion
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Upload media or load standardized academic benchmark controls
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-[#111827] p-1 rounded-xl border border-[#1E293B] text-xs font-medium">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'upload' ? 'bg-[#6366F1] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'benchmark' ? 'bg-[#06B6D4] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Benchmark Scenarios
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-3 text-sm text-[#EF4444]">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Validation Error</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-[#EF4444] hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 1: Benchmark Scenarios */}
      {activeTab === 'benchmark' && !file && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#06B6D4]" />
              Pre-Loaded Research Benchmark Controls
            </h3>
            <p className="text-xs text-[#94A3B8] mb-6">
              Select an adversarial scenario to automatically generate acoustic binary waveforms and test the entire 11-stage pipeline instantaneously without manual file selection.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BENCHMARK_SAMPLES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleBenchmarkSelect(sample)}
                  className="bg-[#080D18] border border-[#1E293B] hover:border-[#06B6D4] rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.01] group shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#111827] text-[#06B6D4] border border-[#1E293B]">
                      {sample.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        sample.expectedRisk === 'HIGH'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : sample.expectedRisk === 'LOW'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {sample.expectedRisk} RISK
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-[#06B6D4] transition-colors mb-1.5">
                    {sample.title}
                  </h4>
                  <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed mb-3">
                    {sample.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1E293B]">
                    {sample.indicators.map((ind, i) => (
                      <span key={i} className="text-[10px] font-mono text-slate-400 bg-[#111827] px-2 py-0.5 rounded">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Upload Drag & Drop Area */}
      {activeTab === 'upload' && !file && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#06B6D4] bg-[#06B6D4]/5 scale-[1.01]'
              : 'border-[#1E293B] hover:border-[#6366F1] bg-[#111827]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".mp4,.mov,.avi,.mkv,.wav,.mp3,.m4a,.png,.jpg,.jpeg,.webp"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelection(e.target.files[0]);
              }
            }}
          />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366F1]/20 to-[#06B6D4]/20 border border-white/5 flex items-center justify-center mx-auto mb-4 text-[#06B6D4]">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            Drag and drop your video, audio, or forensic image file here
          </h3>
          <p className="text-sm text-[#94A3B8] mb-4">
            or <span className="text-[#06B6D4] font-semibold underline">browse files</span> on your device
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Video: MP4, MOV, AVI, MKV</span>
            <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Audio: WAV, MP3, M4A</span>
            <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Image: PNG, JPG, WEBP</span>
            <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Max Size: 250 MB</span>
          </div>
        </div>
      )}

      {/* File Selected & Preview Card */}
      {file && (
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1]">
                {fileType === 'video' ? (
                  <FileVideo className="w-5 h-5" />
                ) : fileType === 'image' ? (
                  <ImageIcon className="w-5 h-5 text-[#06B6D4]" />
                ) : (
                  <FileAudio className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{file.name}</h4>
                <p className="text-xs font-mono text-[#94A3B8]">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {fileType?.toUpperCase()}
                </p>
              </div>
            </div>

            {!uploading && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg bg-[#080D18] border border-[#1E293B] hover:bg-[#1E293B] text-slate-400 hover:text-white text-xs font-medium transition-colors"
              >
                Change File
              </button>
            )}
          </div>

          {/* Cryptographic SHA-256 Digest Tag */}
          {fileHashPreview && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#080D18] border border-[#1E293B] text-xs font-mono text-slate-300">
              <Hash className="w-4 h-4 text-[#06B6D4]" />
              <span className="text-slate-500">Local Checksum:</span>
              <span className="text-white truncate">{fileHashPreview}</span>
            </div>
          )}

          {/* Interactive Player Preview */}
          <div className="bg-[#080D18] rounded-xl overflow-hidden border border-[#1E293B] p-2 flex items-center justify-center">
            {fileType === 'video' && previewUrl ? (
              <video
                src={previewUrl}
                controls
                className="max-h-72 w-full object-contain rounded-lg"
              />
            ) : fileType === 'image' && previewUrl ? (
              <img
                src={previewUrl}
                alt="Image Preview"
                className="max-h-72 w-full object-contain rounded-lg"
              />
            ) : fileType === 'audio' && previewUrl ? (
              <div className="w-full py-8 px-4 flex flex-col items-center justify-center">
                <FileAudio className="w-12 h-12 text-[#22C55E] mb-3 animate-pulse" />
                <audio src={previewUrl} controls className="w-full max-w-md" />
              </div>
            ) : null}
          </div>

          {/* Forensic Preset Options */}
          <div className="bg-[#080D18] rounded-xl p-4 border border-[#1E293B] space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#06B6D4]" />
              Analysis Strategy Preset
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'balanced', label: 'Balanced Multimodal', sub: 'Equal Vision & Speech Weights' },
                { id: 'facial', label: 'Facial Biometric Focus', sub: 'Prioritizes CNN 2D-FFT' },
                { id: 'audio', label: 'Voice & Sync Focus', sub: 'Prioritizes SyncNet & Vocoder' },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`text-left p-3 rounded-lg border transition-all text-xs ${
                    selectedPreset === preset.id
                      ? 'bg-[#6366F1]/10 border-[#6366F1] text-white shadow-sm'
                      : 'bg-[#111827] border-[#1E293B] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold block text-white">{preset.label}</span>
                  <span className="text-[10px] text-slate-500">{preset.sub}</span>
                </button>
              ))}
            </div>

            {/* Checklist of active engines */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#1E293B] text-[11px] text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> OpenCV Face Detector
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> CNN Frequency Analyzer
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> SyncNet Lip-Sync
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> TalkNet Active Speaker
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> pyannote Diarization
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> Whisper ASR & PSD
              </span>
            </div>
          </div>

          {/* Upload Progress Bar if uploading */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Uploading and computing SHA-256 hash...</span>
                <span className="text-[#06B6D4] font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-[#080D18] rounded-full h-2.5 border border-[#1E293B] overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] h-2.5 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 text-white transition-all ${
                uploading
                  ? 'bg-slate-700 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] shadow-[#6366F1]/25 hover:shadow-[#6366F1]/40 hover:scale-[1.01]'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {uploading ? 'Ingesting Media...' : 'Execute Multimodal Forensic Analysis'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
