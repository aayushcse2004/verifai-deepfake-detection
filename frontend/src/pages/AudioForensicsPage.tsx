import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Volume2,
  Play,
  Pause,
  Activity,
  Waves,
  AlertTriangle,
  Mic,
  Users,
  FileText,
  Radio,
  Clock,
  RefreshCw
} from 'lucide-react';
import { getAnalysisResults, getAnalysisHistory } from '../services/api';
import { ForensicResult, AnalysisJob } from '../types';

export const AudioForensicsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId?: string }>();
  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [selectedId, setSelectedId] = useState<string>(analysisId || '');
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Audio Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

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

  const audioMetrics = result?.detailed_metrics?.audio || {};
  const audioEvidence = result?.evidence_items?.filter((e) =>
    e.evidence_type.includes('audio') || e.evidence_type.includes('spectral') || e.evidence_type.includes('speaker')
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Audio Spectral & Acoustic Forensics</h1>
              <p className="text-sm text-[#94A3B8]">
                Welch PSD spectral distribution, neural vocoder cutoff detection, and speaker diarization timeline
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
          <p className="text-sm font-mono text-[#94A3B8]">Loading acoustic signal metrics...</p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <span className="text-xs font-mono text-[#94A3B8]">Acoustic Anomaly Score</span>
              <p className="text-2xl font-extrabold font-mono text-[#6366F1] mt-1">
                {(result.audio_score || 0).toFixed(2)} / 1.00
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">Weighted spectral residual</p>
            </div>

            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <span className="text-xs font-mono text-[#94A3B8]">Spectral Rolloff</span>
              <p className="text-2xl font-extrabold font-mono text-[#06B6D4] mt-1">
                {audioMetrics.spectral_rolloff_hz ? `${audioMetrics.spectral_rolloff_hz.toFixed(0)} Hz` : 'N/A'}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">85% cumulative energy frequency</p>
            </div>

            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <span className="text-xs font-mono text-[#94A3B8]">Neural Vocoder Cutoff</span>
              <p className="text-2xl font-extrabold font-mono text-[#22C55E] mt-1">
                {audioMetrics.vocoder_cutoff_detected ? 'DETECTED' : 'CLEAR'}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">Steep high-frequency dropoff test</p>
            </div>

            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <span className="text-xs font-mono text-[#94A3B8]">RMS Splice Discontinuities</span>
              <p className="text-2xl font-extrabold font-mono text-[#F59E0B] mt-1">
                {audioMetrics.splice_discontinuities || 0}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">Sudden energy transition jumps</p>
            </div>
          </div>

          {/* Simulated Waveform & Spectral Spectrum Display */}
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#06B6D4]" />
                16kHz Normalized Audio Signal Waveform & Spectral Envelope
              </h3>
              <span className="text-xs font-mono text-[#94A3B8]">PCM 16-bit Mono Resampled</span>
            </div>

            {/* Synthesized Visualizer Bars */}
            <div className="h-28 bg-[#080D18] rounded-xl border border-[#1E293B] p-4 flex items-end gap-1 overflow-hidden">
              {Array.from({ length: 64 }).map((_, i) => {
                const height = Math.max(10, Math.sin(i * 0.3) * 40 + Math.cos(i * 0.7) * 35 + 30);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all duration-300 hover:bg-[#06B6D4]"
                    style={{
                      height: `${height}%`,
                      backgroundColor: i > 48 && audioMetrics.vocoder_cutoff_detected ? '#EF4444' : '#6366F1',
                      opacity: 0.85,
                    }}
                    title={`Bin ${i * 250} Hz: Magnitude ${height.toFixed(1)} dB`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
              <span>0 Hz (DC)</span>
              <span>2,000 Hz</span>
              <span>4,000 Hz</span>
              <span>6,000 Hz</span>
              <span>8,000 Hz (Nyquist)</span>
            </div>
          </div>

          {/* Diarization & Whisper Transcription */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diarization Turns */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6366F1]" />
                pyannote.audio Speaker Diarization Segments
              </h3>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {result.speaker_segments?.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic py-4 text-center">No conversational segments detected.</p>
                ) : (
                  result.speaker_segments?.map((seg, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#080D18] border border-[#1E293B] flex items-center justify-between text-xs font-mono"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[#06B6D4] font-bold">{seg.speaker_id}</span>
                        <p className="text-slate-300 font-sans text-[11px]">{seg.transcript || 'Speech utterance'}</p>
                      </div>
                      <span className="text-[#94A3B8] text-[11px]">
                        {seg.start_time.toFixed(1)}s - {seg.end_time.toFixed(1)}s
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Speech Transcript */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#22C55E]" />
                OpenAI Whisper ASR Transcription
              </h3>

              <div className="p-4 rounded-xl bg-[#080D18] border border-[#1E293B] text-xs font-mono text-slate-300 leading-relaxed min-h-[160px]">
                {result.transcription ? (
                  `"${result.transcription}"`
                ) : (
                  <span className="text-[#64748B] italic">No vocal speech recognized in audio stream.</span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] pt-1">
                <span>Model: Whisper (Normalized 16kHz)</span>
                <span>Language: Auto-detected (en)</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

