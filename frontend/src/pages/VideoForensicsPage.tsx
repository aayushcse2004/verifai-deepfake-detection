import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Video,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  AlertTriangle,
  Scan,
  CheckCircle,
  FileSearch,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getAnalysisResults, getAnalysisHistory } from '../services/api';
import { ForensicResult, AnalysisJob } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';

export const VideoForensicsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId?: string }>();
  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [selectedId, setSelectedId] = useState<string>(analysisId || '');
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Video Player Controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeFrameSample, setActiveFrameSample] = useState<any>(null);

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
      .then((data) => {
        setResult(data);
        const samples = data.detailed_metrics?.face_samples || [];
        if (samples.length > 0) {
          setActiveFrameSample(samples[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const currentJob = history.find((j) => j.id === selectedId);
  const mediaFilename = currentJob?.media?.stored_filename;
  const videoSrc = mediaFilename
    ? `http://localhost:8000/storage/uploads/${mediaFilename}`
    : '/assets/hero.png';

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    const samples = result?.detailed_metrics?.face_samples || [];
    if (samples.length > 0) {
      const closest = samples.reduce((prev, curr) =>
        Math.abs(curr.timestamp - t) < Math.abs(prev.timestamp - t) ? curr : prev
      );
      if (Math.abs(closest.timestamp - t) < 1.0) {
        setActiveFrameSample(closest);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stepFrame = (frames: number) => {
    if (!videoRef.current) return;
    const fps = 25.0; // Nominal forensic inspection FPS
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + frames / fps));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const faceSamples = result?.detailed_metrics?.face_samples || [];
  const evidenceItems =
    result?.evidence_items?.filter(
      (e) => e.evidence_type.includes('face') || e.evidence_type.includes('facial')
    ) || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Forensic Laboratory' },
          { label: 'Video Forensics' },
        ]}
      />

      <PageHeader
        title="Interactive Forensic Video Laboratory"
        subtitle="Frame-by-frame spatial inspection, face bounding-box tracking, and suspicious anomaly markers"
        icon={<Video className="w-5 h-5" />}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video & Custom Player Controls (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden border-[#1E293B] bg-black">
              <div className="relative aspect-video w-full flex items-center justify-center bg-black group">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() =>
                    videoRef.current && setDuration(videoRef.current.duration || 10.0)
                  }
                  className="w-full h-full object-contain"
                />

                {/* Bounding Box Visualizer Overlay */}
                {activeFrameSample && activeFrameSample.bbox && (
                  <div
                    className="absolute border-2 border-[#06B6D4] bg-[#06B6D4]/15 rounded shadow-lg pointer-events-none transition-all"
                    style={{
                      left: `${Math.max(10, Math.min(80, (activeFrameSample.bbox[0] / 300) * 100))}%`,
                      top: `${Math.max(10, Math.min(70, (activeFrameSample.bbox[1] / 300) * 100))}%`,
                      width: '120px',
                      height: '140px',
                    }}
                  >
                    <span className="absolute -top-5 left-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#06B6D4] text-black font-bold whitespace-nowrap">
                      Track: {activeFrameSample.track_id}
                    </span>
                  </div>
                )}

                {/* Center Play Overlay */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute p-4 rounded-full bg-[#6366F1]/80 hover:bg-[#6366F1] text-white shadow-xl transition-transform hover:scale-110"
                    aria-label="Play video"
                  >
                    <Play className="w-8 h-8 fill-current ml-0.5" />
                  </button>
                )}
              </div>
            </Card>

            {/* Custom Transport Controls */}
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardContent className="p-4 space-y-3">
                {/* Timeline Slider with Suspicious Anomaly Markers */}
                <div className="relative pt-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 10}
                    step={0.04}
                    value={currentTime}
                    onChange={(e) => seekTo(parseFloat(e.target.value))}
                    className="w-full accent-[#6366F1] bg-[#1E293B] h-2 rounded-lg cursor-pointer"
                  />

                  {/* Evidence Markers along Timeline */}
                  {evidenceItems.map((ev, idx) => {
                    const pct = Math.min(100, (ev.timestamp / (duration || 10)) * 100);
                    return (
                      <button
                        key={idx}
                        onClick={() => seekTo(ev.timestamp)}
                        title={`Suspicious Frame (${ev.timestamp.toFixed(2)}s): ${ev.description}`}
                        className="absolute top-2 -mt-1 w-2.5 h-3.5 bg-[#EF4444] rounded-sm shadow-md hover:scale-125 transition-transform"
                        style={{ left: `${pct}%` }}
                      />
                    );
                  })}
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={togglePlay}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => stepFrame(-1)}
                      title="Step backward 1 frame (40ms)"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => stepFrame(1)}
                      title="Step forward 1 frame (40ms)"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>

                    <span className="text-white px-2">
                      {currentTime.toFixed(2)}s / {(duration || 10).toFixed(2)}s
                    </span>
                  </div>

                  {/* Playback Speed Switcher */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 mr-1">Speed:</span>
                    {[0.25, 0.5, 1, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changeSpeed(rate)}
                        className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                          playbackRate === rate
                            ? 'bg-[#6366F1]/20 border-[#6366F1] text-white font-bold'
                            : 'bg-[#080D18] border-[#1E293B] text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Sequential Frame Gallery */}
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Scan className="w-4 h-4 text-[#06B6D4]" />
                  Sampled Facial Frame Strips & Regions of Interest (ROI)
                </CardTitle>
                <CardDescription>
                  Spatial crops processed through facial frequency and artifact classifiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {faceSamples.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3">
                      No facial crops extracted for this asset.
                    </p>
                  ) : (
                    faceSamples.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveFrameSample(sample);
                          seekTo(sample.timestamp);
                        }}
                        className={`shrink-0 w-24 p-1.5 rounded-lg border text-left transition-all ${
                          activeFrameSample === sample
                            ? 'bg-[#06B6D4]/10 border-[#06B6D4]'
                            : 'bg-[#080D18] border-[#1E293B] hover:border-slate-500'
                        }`}
                      >
                        <div className="w-full h-16 rounded bg-[#111827] flex items-center justify-center overflow-hidden mb-1 relative border border-[#1E293B]">
                          {sample.crop_filename ? (
                            <img
                              src={`http://localhost:8000/storage/frames/${selectedId}/${sample.crop_filename}`}
                              alt={`Face ${sample.timestamp}s`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          <Scan className="w-6 h-6 text-slate-600 absolute" />
                        </div>
                        <p className="text-[10px] font-mono text-white truncate">{sample.timestamp}s</p>
                        <p className="text-[9px] font-mono text-slate-400">Track {sample.track_id}</p>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Frame-level Forensic Findings & Model Status */}
          <div className="space-y-6">
            {/* Suspicious Findings Card */}
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  Suspicious Video Keyframes
                </CardTitle>
                <Badge variant="warning">{evidenceItems.length} Flagged</Badge>
              </CardHeader>
              <CardContent className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {evidenceItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    No significant frame-level facial anomalies detected.
                  </p>
                ) : (
                  evidenceItems.map((ev, idx) => (
                    <div
                      key={idx}
                      onClick={() => seekTo(ev.timestamp)}
                      className="p-3 rounded-lg bg-[#080D18] border border-[#1E293B] hover:border-[#EF4444]/50 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#EF4444]">
                          {ev.timestamp.toFixed(2)}s
                        </span>
                        <Badge variant={ev.score > 0.65 ? 'danger' : 'warning'}>
                          Score: {ev.score.toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 font-sans">{ev.description}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Model Operational Status */}
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#6366F1]" />
                  Active Video Detection Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs font-mono text-slate-400">
                <div className="flex justify-between py-1 border-b border-[#1E293B]">
                  <span>Model Architecture:</span>
                  <span className="text-white font-semibold">Meso4 CNN (PyTorch)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E293B]">
                  <span>Operational Mode:</span>
                  <Badge variant="accent">
                    {result.model_statuses?.facial?.operational_mode || 'active_model'}
                  </Badge>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E293B]">
                  <span>Literature Benchmark AUC:</span>
                  <span className="text-[#06B6D4]">0.892 (FF++ c23)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Model Confidence:</span>
                  <span className="text-[#22C55E] font-bold">
                    {((result.model_statuses?.facial?.confidence || 0.85) * 100).toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Video className="w-8 h-8 text-slate-500" />}
          title="No Investigation Selected"
          description="Select an investigation from the dropdown above or upload a new media asset."
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
