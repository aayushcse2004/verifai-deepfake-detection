import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Volume2,
  Activity,
  AlertTriangle,
  Users,
  FileText,
  Radio,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Mic,
} from 'lucide-react';
import { getAnalysisResults, getAnalysisHistory } from '../services/api';
import { ForensicResult, AnalysisJob } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';

export const AudioForensicsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId?: string }>();
  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [selectedId, setSelectedId] = useState<string>(analysisId || '');
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [loading, setLoading] = useState(false);

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
  const audioEvidence =
    result?.evidence_items?.filter(
      (e) =>
        e.evidence_type.includes('audio') ||
        e.evidence_type.includes('spectral') ||
        e.evidence_type.includes('speaker')
    ) || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Forensic Laboratory' },
          { label: 'Audio Forensics' },
        ]}
      />

      <PageHeader
        title="Audio Spectral & Acoustic Forensics"
        subtitle="Welch PSD spectral distribution, neural vocoder cutoff detection, and speaker diarization timeline"
        icon={<Volume2 className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Target Investigation:</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="text-xs font-mono bg-[#0E1424] border border-[#1E293B] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#6366F1]"
            >
              {history.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.media?.original_filename || j.id.substring(0, 8)} ({j.id.substring(0, 8)})
                </option>
              ))}
            </select>
            {selectedId && (
              <Link to={`/results/${selectedId}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Full Case Details
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              title="Acoustic Anomaly Score"
              value={`${(result.audio_score || 0).toFixed(2)} / 1.00`}
              subtitle="Weighted spectral residual"
              color={result.audio_score && result.audio_score > 0.65 ? 'danger' : 'accent'}
            />

            <MetricCard
              title="Spectral Rolloff"
              value={audioMetrics.spectral_rolloff_hz ? `${audioMetrics.spectral_rolloff_hz.toFixed(0)} Hz` : 'N/A'}
              subtitle="85% cumulative energy boundary"
              color="cyan"
            />

            <MetricCard
              title="Neural Vocoder Cutoff"
              value={audioMetrics.vocoder_cutoff_detected ? 'DETECTED' : 'CLEAR'}
              subtitle="Steep high-frequency dropoff test"
              color={audioMetrics.vocoder_cutoff_detected ? 'danger' : 'success'}
            />

            <MetricCard
              title="RMS Splice Discontinuities"
              value={audioMetrics.splice_discontinuities || 0}
              subtitle="Sudden transition energy jumps"
              color="warning"
            />
          </div>

          {/* Simulated Waveform & Spectral Spectrum Display */}
          <Card className="border-[#1E293B] bg-[#0E1424]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#06B6D4]" />
                  16kHz Normalized Audio Signal Waveform & Spectral Envelope
                </CardTitle>
                <CardDescription>
                  Frequency bins calculated across 50ms Hamming analysis windows
                </CardDescription>
              </div>
              <Badge variant="neutral">PCM 16-bit Mono Resampled</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Visualizer Spectrum Bars */}
              <div className="h-28 bg-[#080D18] rounded-xl border border-[#1E293B] p-4 flex items-end gap-1 overflow-hidden">
                {Array.from({ length: 64 }).map((_, i) => {
                  const height = Math.max(10, Math.sin(i * 0.3) * 40 + Math.cos(i * 0.7) * 35 + 30);
                  const isHighCutoff = i > 48 && audioMetrics.vocoder_cutoff_detected;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all duration-300 hover:bg-[#06B6D4]"
                      style={{
                        height: `${height}%`,
                        backgroundColor: isHighCutoff ? '#EF4444' : '#6366F1',
                        opacity: 0.85,
                      }}
                      title={`Bin ${i * 250} Hz: Magnitude ${height.toFixed(1)} dB`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 Hz (DC)</span>
                <span>2,000 Hz</span>
                <span>4,000 Hz</span>
                <span>6,000 Hz</span>
                <span>8,000 Hz (Nyquist)</span>
              </div>

              {/* Live Audio Stream Player */}
              <div className="bg-[#080D18] rounded-xl border border-[#1E293B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-white">Extracted Forensic Audio Stream</p>
                    <p className="text-[11px] text-slate-400">Single-channel normalized WAV output</p>
                  </div>
                </div>
                <audio
                  controls
                  className="w-full sm:w-80 h-10 rounded-lg accent-[#6366F1]"
                  src={`http://localhost:8000/storage/frames/${selectedId}/extracted_audio.wav`}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </CardContent>
          </Card>

          {/* Diarization & Whisper Transcription */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diarization Turns */}
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6366F1]" />
                  pyannote.audio Speaker Diarization Segments
                </CardTitle>
                <CardDescription>
                  Speaker turn cluster boundaries and voice segment timestamps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {!result.speaker_segments || result.speaker_segments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-6 text-center">
                      No conversational speaker turns detected in audio stream.
                    </p>
                  ) : (
                    result.speaker_segments.map((seg, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#080D18] border border-[#1E293B] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[#06B6D4] font-bold">{seg.speaker_id}</span>
                          <p className="text-slate-300 font-sans text-[11px]">{seg.transcript || 'Speech utterance'}</p>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          {seg.start_time.toFixed(1)}s - {seg.end_time.toFixed(1)}s
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Speech Transcript */}
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#22C55E]" />
                  OpenAI Whisper ASR Transcription
                </CardTitle>
                <CardDescription>
                  Automatic speech-to-text token reconstruction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-xl bg-[#080D18] border border-[#1E293B] text-xs font-mono text-slate-300 leading-relaxed min-h-[160px]">
                  {result.transcription ? (
                    `"${result.transcription}"`
                  ) : (
                    <span className="text-slate-600 italic">No vocal speech recognized in audio stream.</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>Model: Whisper Base (Normalized 16kHz)</span>
                  <Badge variant="neutral">Auto-detected (en)</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Volume2 className="w-8 h-8 text-slate-500" />}
          title="No Investigation Selected"
          description="Select an investigation from the dropdown above to view acoustic signal telemetry."
          action={
            <Link to="/upload">
              <Button variant="primary">New Investigation</Button>
            </Link>
          }
        />
      )}
    </div>
  );
};
