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
} from 'lucide-react';
import { getAnalysisStatus } from '../services/api';
import { StageLog } from '../types';

export const ProcessingPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('PENDING');
  const [currentStage, setCurrentStage] = useState<string>('Initializing');
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<StageLog[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pipelineStages = [
    { id: 1, name: 'File Validation', threshold: 5 },
    { id: 2, name: 'Audio Extraction', threshold: 15 },
    { id: 3, name: 'Frame Extraction', threshold: 25 },
    { id: 4, name: 'Face Detection', threshold: 40 },
    { id: 5, name: 'Facial Manipulation Analysis', threshold: 55 },
    { id: 6, name: 'Lip-Sync Analysis', threshold: 65 },
    { id: 7, name: 'Active Speaker Detection', threshold: 75 },
    { id: 8, name: 'Speaker Diarization', threshold: 82 },
    { id: 9, name: 'Speech Recognition', threshold: 88 },
    { id: 10, name: 'Multimodal Fusion', threshold: 95 },
    { id: 11, name: 'Report Generation', threshold: 100 },
  ];

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
          // Optional short timeout before auto-navigation
          setTimeout(() => {
            navigate(`/results/${analysisId}`);
          }, 1500);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setErrorMessage(data.error_message || 'Pipeline encountered a critical error.');
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [analysisId, navigate]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#1E293B] text-xs font-mono text-[#06B6D4] mb-2">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>Analysis ID: {analysisId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Forensic Pipeline Execution
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Executing 11 sequential forensic algorithms and neural model extractions
          </p>
        </div>

        {status === 'COMPLETED' && (
          <Link
            to={`/results/${analysisId}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-sm font-bold shadow-lg shadow-[#22C55E]/20 transition-all hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4" />
            View Forensic Results
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Primary Progress Card */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-[#94A3B8] uppercase">Current Operation</span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              {currentStage}
              {status === 'PROCESSING' && (
                <span className="inline-block w-2 h-2 rounded-full bg-[#06B6D4] animate-ping" />
              )}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black font-mono text-[#06B6D4]">{progress}%</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-[#080D18] rounded-full h-3.5 border border-[#1E293B] overflow-hidden p-0.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
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
          <h4 className="text-sm font-bold text-white mb-3">11-Stage Pipeline Progression</h4>
          <div className="space-y-2">
            {pipelineStages.map((stage) => {
              const isDone = progress >= stage.threshold;
              const isCurrent = !isDone && progress >= stage.threshold - 15;
              return (
                <div
                  key={stage.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                    isDone
                      ? 'bg-[#22C55E]/5 border-[#22C55E]/20 text-slate-200'
                      : isCurrent
                      ? 'bg-[#6366F1]/10 border-[#6366F1]/40 text-white font-semibold'
                      : 'bg-[#080D18] border-[#1E293B] text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400">
                      {stage.id.toString().padStart(2, '0')}
                    </span>
                    <span>{stage.name}</span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Log Output (Right column) */}
        <div className="lg:col-span-7 bg-[#080D18] border border-[#1E293B] rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Terminal className="w-4 h-4 text-[#06B6D4]" />
              <span>Pipeline Stage Telemetry</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{logs.length} events logged</span>
          </div>

          <div className="flex-1 bg-black/40 rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-96 space-y-2.5">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">Waiting for initial stage events...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                  <span className="text-[#06B6D4] shrink-0 font-bold">
                    {log.progress.toString().padStart(3, ' ')}%
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
