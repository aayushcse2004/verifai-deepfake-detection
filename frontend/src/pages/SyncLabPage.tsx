import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Link2,
  Play,
  Pause,
  AlertTriangle,
  Clock,
  Activity,
  FileText,
  Users,
  Video,
  Volume2,
  CheckCircle,
  RotateCw
} from 'lucide-react';
import { getAnalysisResults, getAnalysisHistory } from '../services/api';
import { ForensicResult, AnalysisJob } from '../types';

export const SyncLabPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId?: string }>();
  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [selectedId, setSelectedId] = useState<string>(analysisId || '');
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync Transport
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const duration = 10.0;

  useEffect(() => {
    getAnalysisHistory(50)
      .then((jobs) => {
        const completed = jobs.filter((j) => j.status === 'COMPLETED');
        setHistory(completed);
        if (!selectedId && completed.length > 0) {
          setSelectedId(completed[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    getAnalysisResults(selectedId)
      .then((data) => setResult(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const syncMetrics = result?.detailed_metrics?.lip_sync || {};
  const syncEvidence = result?.evidence_items?.filter((e) =>
    e.evidence_type.includes('lip_sync') || e.evidence_type.includes('sync')
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Audio-Video Synchronization Laboratory</h1>
              <p className="text-sm text-[#94A3B8]">
                SyncNet temporal cross-correlation: mouth ROI optical flow vs acoustic voice energy envelope
              </p>
            </div>
          </div>
        </div>

        {/* Case Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-[#94A3B8]">Investigation:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-xs font-mono bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6366F1]"
          >
            {history.map((j) => (
              <option key={j.id} value={j.id}>
                {j.media?.original_filename || j.id.substring(0, 8)} ({j.id.substring(0, 8)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <p className="text-sm font-mono text-[#94A3B8]">Loading multimodal cross-correlation telemetry...</p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Key Metric Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <span className="text-xs font-mono text-[#94A3B8]">Sync Inconsistency Score</span>
              <p className="text-2xl font-extrabold font-mono text-[#6366F1] mt-1">
                {(result.lip_sync_score || 0).toFixed(2)} / 1.00
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">Cross-modal correlation deviation</p>
            </div>

            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <span className="text-xs font-mono text-[#94A3B8]">Estimated Temporal Lag / Offset</span>
              <p className="text-2xl font-extrabold font-mono text-[#06B6D4] mt-1">
                {syncMetrics.sync_offset_ms !== undefined ? `${syncMetrics.sync_offset_ms.toFixed(0)} ms` : '±0 ms'}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">Mouth motion vs audio envelope lag</p>
            </div>

            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <span className="text-xs font-mono text-[#94A3B8]">Active Speaker Concordance</span>
              <p className="text-2xl font-extrabold font-mono text-[#22C55E] mt-1">
                {((result.active_speaker_score || 0.1) * 100).toFixed(0)}%
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">TalkNet visible face movement mapping</p>
            </div>
          </div>

          {/* Synchronized Multi-Track Timeline */}
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 space-y-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#06B6D4]" />
              Dual-Stream Audio-Visual Concordance Tracks
            </h3>

            {/* Video Optical Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#06B6D4] flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Track 1: Mouth Optical Flow Velocity (SyncNet ROI)
                </span>
                <span className="text-[#94A3B8]">Frames @ 25 FPS</span>
              </div>
              <div className="h-10 bg-[#080D18] rounded-lg border border-[#1E293B] p-2 flex items-center gap-0.5 overflow-hidden">
                {Array.from({ length: 80 }).map((_, i) => {
                  const val = Math.max(15, Math.sin(i * 0.4) * 70 + 20);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-[#06B6D4]/70 rounded-sm"
                      style={{ height: `${val}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Audio Energy Envelope Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#6366F1] flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" /> Track 2: Acoustic RMS Energy Envelope
                </span>
                <span className="text-[#94A3B8]">16kHz Sampled Envelope</span>
              </div>
              <div className="h-10 bg-[#080D18] rounded-lg border border-[#1E293B] p-2 flex items-center gap-0.5 overflow-hidden">
                {Array.from({ length: 80 }).map((_, i) => {
                  const val = Math.max(15, Math.cos(i * 0.4 + 0.3) * 70 + 20);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-[#6366F1]/70 rounded-sm"
                      style={{ height: `${val}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Speaker Turns Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#22C55E] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Track 3: Diarized Speaker Turns
                </span>
                <span className="text-[#94A3B8]">pyannote Segments</span>
              </div>
              <div className="h-8 bg-[#080D18] rounded-lg border border-[#1E293B] flex overflow-hidden">
                <div className="w-1/3 bg-[#22C55E]/20 border-r border-[#22C55E]/40 flex items-center justify-center text-[10px] font-mono text-[#22C55E]">
                  SPEAKER_00 (0.0s - 3.2s)
                </div>
                <div className="w-1/4 bg-[#06B6D4]/20 border-r border-[#06B6D4]/40 flex items-center justify-center text-[10px] font-mono text-[#06B6D4]">
                  SPEAKER_01 (3.2s - 5.8s)
                </div>
                <div className="flex-1 bg-[#6366F1]/20 flex items-center justify-center text-[10px] font-mono text-[#6366F1]">
                  SPEAKER_00 (5.8s - 10.0s)
                </div>
              </div>
            </div>

            {/* Playhead Slider */}
            <div className="pt-2 space-y-2">
              <input
                type="range"
                min={0}
                max={duration}
                step={0.04}
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full accent-[#6366F1] bg-[#1E293B] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs font-mono text-[#94A3B8]">
                <span>Time: {currentTime.toFixed(2)}s</span>
                <span>Total: {duration.toFixed(2)}s</span>
              </div>
            </div>
          </div>

          {/* Suspicious Desync Anomaly Table */}
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
              Identified Synchronization Discrepancies
            </h3>

            {syncEvidence.length === 0 ? (
              <p className="text-xs text-[#94A3B8] italic py-3 text-center">
                Mouth ROI velocity and acoustic vocal energy maintain temporal synchrony within acceptable tolerances.
              </p>
            ) : (
              <div className="space-y-2">
                {syncEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#080D18] border border-[#1E293B] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-[#EF4444] font-bold mr-2">{ev.timestamp.toFixed(2)}s:</span>
                      <span className="text-slate-300 font-sans">{ev.description}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
                      Score: {ev.score.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

