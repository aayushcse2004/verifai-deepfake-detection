import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Terminal,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Copy,
  Check,
  Radio,
  Eye,
  Scan,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { getAnalysisStatus, cancelAnalysis, retryAnalysis } from '../services/api';
import { StageLog } from '../types';

export const ProcessingPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'>('PENDING');
  const [currentStage, setCurrentStage] = useState<string>('Initializing');
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<StageLog[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  const pipelineStages = [
    { id: 1, name: 'File Validation & Checksum', threshold: 5, category: 'Cryptographic' },
    { id: 2, name: 'Audio Extraction & Normalization', threshold: 15, category: 'Audio' },
    { id: 3, name: 'Frame Sampling & Streaming', threshold: 25, category: 'Video' },
    { id: 4, name: 'Face Detection & Spatial Tracking', threshold: 40, category: 'Vision' },
    { id: 5, name: 'CNN Facial Frequency Analysis', threshold: 55, category: 'Vision' },
    { id: 6, name: 'SyncNet Audio-Visual Synchrony', threshold: 65, category: 'Cross-Modal' },
    { id: 7, name: 'TalkNet Active Speaker Correlation', threshold: 75, category: 'Cross-Modal' },
    { id: 8, name: 'pyannote Speaker Diarization', threshold: 82, category: 'Audio' },
    { id: 9, name: 'OpenAI Whisper Speech Transcription', threshold: 88, category: 'Speech' },
    { id: 10, name: 'Multimodal Bayesian Fusion', threshold: 95, category: 'Fusion' },
    { id: 11, name: 'Forensic PDF Compilation', threshold: 100, category: 'Export' },
  ];

  // Elapsed timer
  useEffect(() => {
    if (status === 'COMPLETED' || status === 'FAILED') return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // Status polling
  useEffect(() => {
    if (!analysisId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const data = await getAnalysisStatus(analysisId);
        if (!isMounted) return;

        setStatus(data.status);
        setCurrentStage(data.current_stage || 'Processing');
        setProgress(data.progress);
        if (data.stage_logs) {
          setLogs(data.stage_logs);
        }

        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setTimeout(() => {
            navigate(`/results/${analysisId}`);
          }, 1200);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setErrorMessage(data.error_message || 'Pipeline encountered an unexpected error.');
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [analysisId, navigate]);

  const copyLogText = () => {
    const text = logs.map((l) => `[${l.timestamp}] (${l.progress}%) ${l.stage}: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#1E293B] text-xs font-mono text-[#06B6D4] mb-2">
            <Radio className="w-3.5 h-3.5 text-[#06B6D4] animate-pulse" />
            <span>Analysis ID: {analysisId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Forensic Pipeline Execution Telemetry
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Asynchronous multi-adapter inference across computer vision, speech acoustics, and temporal synchronization
          </p>
        </div>

        {status === 'COMPLETED' ? (
          <Link
            to={`/results/${analysisId}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-sm font-bold shadow-lg shadow-[#22C55E]/20 transition-all hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4" />
            Open Forensic Results
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : status === 'FAILED' || status === 'CANCELLED' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (analysisId) {
                  await retryAnalysis(analysisId);
                  setStatus('PROCESSING');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold transition-all shadow-md shadow-[#6366F1]/20"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Analysis
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 font-mono text-xs text-slate-400 bg-[#111827] px-4 py-2 rounded-xl border border-[#1E293B]">
            <Clock className="w-4 h-4 text-[#06B6D4]" />
            <span>Elapsed: <strong className="text-white">{formatTime(elapsedSeconds)}</strong></span>
            <span>•</span>
            <span className="text-[#22C55E] animate-pulse">Running</span>
            <span>•</span>
            <button
              onClick={async () => {
                if (analysisId) {
                  await cancelAnalysis(analysisId);
                  setStatus('CANCELLED');
                }
              }}
              className="text-[#EF4444] hover:underline flex items-center gap-1 font-sans"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Cyber Scanning HUD Card */}
      <div className="relative bg-[#111827] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6">
        {/* Animated Scanning Laser Line */}
        {status === 'PROCESSING' && (
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#06B6D4] to-transparent shadow-[0_0_15px_#06B6D4] animate-laser pointer-events-none z-10" />
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Active Forensic Stage
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5 mt-0.5">
              <Scan className="w-6 h-6 text-[#06B6D4] animate-spin" />
              {currentStage}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#06B6D4]">
              {progress}%
            </span>
          </div>
        </div>

        {/* Global Pipeline Progress Bar */}
        <div className="w-full bg-[#080D18] rounded-full h-4 border border-[#1E293B] overflow-hidden p-0.5">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              status === 'FAILED'
                ? 'bg-[#EF4444]'
                : status === 'COMPLETED'
                ? 'bg-[#22C55E]'
                : 'bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#22C55E]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Error notification if failed */}
        {status === 'FAILED' && (
          <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-3 text-sm text-[#EF4444]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Pipeline Execution Failed</span>
              <p className="text-xs mt-1 text-slate-300">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: 11 Pipeline Stages Breakdown + Live Terminal Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stages Checklist (Left column) */}
        <div className="lg:col-span-5 bg-[#111827] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white">11-Stage Inspection Pipeline</h4>
            <span className="text-[10px] font-mono text-[#06B6D4]">Sequential</span>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {pipelineStages.map((stage) => {
              const isDone = progress >= stage.threshold;
              const isCurrent = !isDone && progress >= stage.threshold - 15;
              return (
                <div
                  key={stage.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                    isDone
                      ? 'bg-[#22C55E]/5 border-[#22C55E]/20 text-slate-200'
                      : isCurrent
                      ? 'bg-[#6366F1]/10 border-[#6366F1]/40 text-white font-semibold shadow-inner'
                      : 'bg-[#080D18] border-[#1E293B] text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-slate-500">
                      {stage.id.toString().padStart(2, '0')}
                    </span>
                    <span className="truncate max-w-[200px]">{stage.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#111827] text-slate-400 border border-[#1E293B]">
                      {stage.category}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Log Output (Right column) */}
        <div className="lg:col-span-7 bg-[#080D18] border border-[#1E293B] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-[#06B6D4]" />
                <span>Forensic Engine Event Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyLogText}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#111827] border border-[#1E293B] hover:bg-[#1E293B] text-[10px] font-mono text-slate-300 transition-colors"
                >
                  {copiedLogs ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
                </button>
                <span className="text-[10px] font-mono text-slate-500">{logs.length} events</span>
              </div>
            </div>

            <div className="bg-black/50 rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-[380px] space-y-2 border border-white/5">
              {logs.length === 0 ? (
                <p className="text-slate-600 italic">Connecting to background task worker...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-slate-600 shrink-0 text-[11px]">[{log.timestamp}]</span>
                    <span className="text-[#06B6D4] shrink-0 font-bold text-[11px]">
                      {log.progress.toString().padStart(3, ' ')}%
                    </span>
                    <span className="text-slate-300 text-[11px]">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E293B] mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Status: <strong className="text-slate-300 uppercase">{status}</strong></span>
            <span>Orchestrator: <strong className="text-[#06B6D4]">FastAPI Worker Thread</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
