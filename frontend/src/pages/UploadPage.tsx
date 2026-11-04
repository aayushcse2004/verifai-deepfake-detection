import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileVideo,
  FileAudio,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  ShieldCheck,
  X,
} from 'lucide-react';
import { uploadMedia, startAnalysis } from '../services/api';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'video' | 'audio' | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wav', 'mp3', 'm4a'];
  const maxSizeBytes = 250 * 1024 * 1024; // 250MB

  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(ext)) {
      setError(`Unsupported file format '.${ext}'. Permitted: MP4, MOV, AVI, MKV, WAV, MP3, M4A.`);
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds 250 MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    setFile(selectedFile);
    const isVid = ['mp4', 'mov', 'avi', 'mkv'].includes(ext);
    setFileType(isVid ? 'video' : 'audio');

    // Create local object URL for preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Upload className="w-7 h-7 text-[#6366F1]" />
          Media Forensics Ingestion
        </h1>
        <p className="text-sm text-[#94A3B8]">
          Upload audio or video media to execute full-spectrum deepfake analysis and multimodal verification
        </p>
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

      {/* Upload Drag & Drop Area */}
      {!file ? (
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
            accept=".mp4,.mov,.avi,.mkv,.wav,.mp3,.m4a"
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
            Drag and drop your audio or video file here
          </h3>
          <p className="text-sm text-[#94A3B8] mb-4">
            or <span className="text-[#06B6D4] font-semibold underline">browse files</span> on your device
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Video: MP4, MOV, AVI, MKV</span>
            <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Audio: WAV, MP3, M4A</span>
            <span className="px-2.5 py-1 rounded bg-[#080D18] border border-[#1E293B]">Max Size: 250 MB</span>
          </div>
        </div>
      ) : (
        /* File Selected & Preview Card */
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1]">
                {fileType === 'video' ? <FileVideo className="w-5 h-5" /> : <FileAudio className="w-5 h-5" />}
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

          {/* Interactive Player Preview */}
          <div className="bg-[#080D18] rounded-xl overflow-hidden border border-[#1E293B] p-2 flex items-center justify-center">
            {fileType === 'video' && previewUrl ? (
              <video
                src={previewUrl}
                controls
                className="max-h-72 w-full object-contain rounded-lg"
              />
            ) : fileType === 'audio' && previewUrl ? (
              <div className="w-full py-8 px-4 flex flex-col items-center justify-center">
                <FileAudio className="w-12 h-12 text-[#22C55E] mb-3 animate-pulse" />
                <audio src={previewUrl} controls className="w-full max-w-md" />
              </div>
            ) : null}
          </div>

          {/* Analysis Pipeline Configuration Preview */}
          <div className="bg-[#080D18] rounded-xl p-4 border border-[#1E293B] space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#06B6D4]" />
              Active Modality Engines for this Media
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> CNN Face Texture
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> SyncNet Lip Motion
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> TalkNet Speaker
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> pyannote Diarization
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> Whisper ASR
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> Acoustic PSD
              </span>
            </div>
          </div>

          {/* Upload Progress Bar if uploading */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Uploading and hashing payload...</span>
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
                  : 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] shadow-[#6366F1]/25 hover:shadow-[#6366F1]/40'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {uploading ? 'Processing Ingestion...' : 'Start Multimodal Forensic Analysis'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
