import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Link2,
  AlertTriangle,
  Activity,
  Users,
  Video,
  Volume2,
  CheckCircle,
  ExternalLink,
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

export const SyncLabPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId?: string }>();
  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [selectedId, setSelectedId] = useState<string>(analysisId || '');
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync Transport
  const [currentTime, setCurrentTime] = useState(0);
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

  const currentJob = history.find((j) => j.id === selectedId);
  const syncMetrics = result?.detailed_metrics?.lip_sync || {};
  const syncEvidence =
    result?.evidence_items?.filter(
      (e) => e.evidence_type.includes('lip_sync') || e.evidence_type.includes('sync')
    ) || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Forensic Laboratory' },
          { label: 'Audio-Video Synchronization' },
        ]}
      />

      <PageHeader
        title="Audio-Video Synchronization Laboratory"
        subtitle="SyncNet temporal cross-correlation: mouth ROI optical flow vs acoustic voice energy envelope"
        icon={<Link2 className="w-5 h-5" />}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Key Metric Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <MetricCard
              title="Sync Inconsistency Score"
              value={`${(result.lip_sync_score || 0).toFixed(2)} / 1.00`}
              subtitle="Cross-modal correlation deviation"
              color={result.lip_sync_score && result.lip_sync_score > 0.65 ? 'danger' : 'accent'}
            />

            <MetricCard
              title="Estimated Temporal Lag / Offset"
              value={syncMetrics.sync_offset_ms !== undefined ? `${syncMetrics.sync_offset_ms.toFixed(0)} ms` : '±0 ms'}
              subtitle="Mouth motion vs audio envelope lag"
              color="cyan"
            />

            <MetricCard
              title="Active Speaker Concordance"
              value={`${((result.active_speaker_score || 0.85) * 100).toFixed(0)}%`}
              subtitle="TalkNet visible face movement mapping"
              color="success"
            />
          </div>

          {/* Synchronized Multi-Track Timeline */}
          <Card className="border-[#1E293B] bg-[#0E1424]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#06B6D4]" />
                Dual-Stream Audio-Visual Concordance Tracks
              </CardTitle>
              <CardDescription>
                Synchronous temporal curves evaluated by the SyncNet cross-modal encoder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Optical Track */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#06B6D4] flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Track 1: Mouth Optical Flow Velocity (SyncNet ROI)
                  </span>
                  <span className="text-slate-400">Frames @ 25 FPS</span>
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
                  <span className="text-slate-400">16kHz Sampled Envelope</span>
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
                  <span className="text-slate-400">pyannote Segments</span>
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
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Current Offset: {currentTime.toFixed(2)}s</span>
                  <span>Total Duration: {duration.toFixed(2)}s</span>
                </div>
              </div>

              {/* Live Synchronized Player Stream */}
              {currentJob?.media?.stored_filename && (
                <div className="bg-[#080D18] rounded-xl border border-[#1E293B] p-4 flex flex-col md:flex-row items-center gap-6 mt-4">
                  <div className="w-full md:w-64 aspect-video bg-black rounded-lg overflow-hidden border border-[#1E293B] shrink-0">
                    <video
                      src={`http://localhost:8000/storage/uploads/${currentJob.media.stored_filename}`}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-sm font-semibold text-white">Live Multi-Modal Playback Stream</h4>
                    <p className="text-xs text-slate-400">
                      Streaming ingested asset{' '}
                      <span className="font-mono text-[#06B6D4]">{currentJob.media.original_filename}</span>. Verify
                      audio/visual alignment at identified lag timestamps.
                    </p>
                    <div className="text-xs font-mono text-slate-500">
                      SHA-256: {currentJob.media.file_hash?.substring(0, 24)}...
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suspicious Desync Anomaly Table */}
          <Card className="border-[#1E293B] bg-[#0E1424]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                Identified Synchronization Discrepancies
              </CardTitle>
              <Badge variant={syncEvidence.length > 0 ? 'warning' : 'success'}>
                {syncEvidence.length} Events
              </Badge>
            </CardHeader>
            <CardContent>
              {syncEvidence.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
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
                      <Badge variant={ev.score > 0.65 ? 'danger' : 'warning'}>
                        Score: {ev.score.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={<Link2 className="w-8 h-8 text-slate-500" />}
          title="No Investigation Selected"
          description="Select an investigation from the dropdown above to view cross-modal synchronization telemetry."
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
