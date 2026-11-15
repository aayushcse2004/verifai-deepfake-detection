import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Video,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  AlertTriangle,
  Layers,
  ChevronRight,
  Maximize2,
  Scan,
  CheckCircle,
  FileSearch,
  ExternalLink
} from 'lucide-react';
import { getAnalysisResults, getAnalysisHistory } from '../services/api';
import { ForensicResult, AnalysisJob } from '../types';

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
    const fps = 25.0; // Standard nominal video FPS
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
  const evidenceItems = result?.evidence_items?.filter((e) =>
    e.evidence_type.includes('face') || e.evidence_type.includes('facial')
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Interactive Forensic Video Laboratory</h1>
              <p className="text-sm text-[#94A3B8]">
                Frame-by-frame spatial inspection, face bounding-box tracking, and suspicious anomaly markers
              </p>
            </div>
          </div>
        </div>

        {/* Case Selector Dropdown */}
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
          <p className="text-sm font-mono text-[#94A3B8]">Loading forensic frame stream...</p>
        </div>
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video & Controls (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Player Container */}
            <div className="relative bg-black rounded-xl overflow-hidden border border-[#1E293B] shadow-2xl aspect-video flex items-center justify-center group">
              <video
                ref={videoRef}
                src="/assets/hero.png" // placeholder video stream or local source
                onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration || 10.0)}
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

              {/* Play Overlay */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute p-4 rounded-full bg-[#6366F1]/80 hover:bg-[#6366F1] text-white shadow-lg transition-transform hover:scale-110"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
              )}
            </div>

            {/* Custom Transport Controls */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4 space-y-3">
              {/* Timeline Slider with Suspicious Markers */}
              <div className="relative">
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
                      title={`Suspicious Frame (${ev.timestamp}s): ${ev.description}`}
                      className="absolute top-1 -mt-1 w-2.5 h-4 bg-[#EF4444] rounded-sm shadow-md hover:scale-125 transition-transform"
                      style={{ left: `${pct}%` }}
                    />
                  );
                })}
              </div>

              {/* Button Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#94A3B8]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-[#080D18] border border-[#1E293B] text-white hover:bg-white/5"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => stepFrame(-1)}
                    className="p-2 rounded-lg bg-[#080D18] border border-[#1E293B] hover:text-white"
                    title="Step backward 1 frame"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => stepFrame(1)}
                    className="p-2 rounded-lg bg-[#080D18] border border-[#1E293B] hover:text-white"
                    title="Step forward 1 frame"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <span className="text-white px-2">
                    {currentTime.toFixed(2)}s / {(duration || 10).toFixed(2)}s
                  </span>
                </div>

                {/* Playback Speed Buttons */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#64748B] mr-1">Speed:</span>
                  {[0.25, 0.5, 1, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`px-2 py-1 rounded text-[11px] font-mono border ${
                        playbackRate === rate
                          ? 'bg-[#6366F1]/20 border-[#6366F1] text-white'
                          : 'bg-[#080D18] border-[#1E293B] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Extracted Sequential Frame Gallery */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Scan className="w-4 h-4 text-[#06B6D4]" />
                Sampled Facial Frame Strips & ROIs
              </h3>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {faceSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveFrameSample(sample);
                      seekTo(sample.timestamp);
                    }}
                    className={`shrink-0 w-24 p-1.5 rounded-lg border text-left transition-all ${
                      activeFrameSample === sample
                        ? 'bg-[#06B6D4]/10 border-[#06B6D4]'
                        : 'bg-[#080D18] border-[#1E293B] hover:border-[#64748B]'
                    }`}
                  >
                    <div className="w-full h-16 rounded bg-[#111827] flex items-center justify-center overflow-hidden mb-1">
                      <Scan className="w-6 h-6 text-[#64748B]" />
                    </div>
                    <p className="text-[10px] font-mono text-white truncate">{sample.timestamp}s</p>
                    <p className="text-[9px] font-mono text-[#94A3B8]">Track {sample.track_id}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Frame-level Forensic Findings */}
          <div className="space-y-6">
            {/* Suspicious Findings Card */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  Suspicious Video Keyframes
                </h3>
                <span className="text-xs font-mono text-[#94A3B8]">{evidenceItems.length} Detected</span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {evidenceItems.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic py-4 text-center">
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
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
                          Score: {ev.score.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans">{ev.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Model Operational Status */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Active Video Detection Model</h3>
              <div className="space-y-2 text-xs font-mono text-[#94A3B8]">
                <div className="flex justify-between py-1 border-b border-[#1E293B]">
                  <span>Model:</span>
                  <span className="text-white">CNN Face Manipulation Detector</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E293B]">
                  <span>Operational Mode:</span>
                  <span className="text-[#06B6D4]">
                    {result.model_statuses?.facial?.operational_mode || 'baseline_heuristic'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Model Confidence:</span>
                  <span className="text-[#22C55E]">
                    {((result.model_statuses?.facial?.confidence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-sm font-mono text-[#94A3B8]">No investigation selected. Choose an investigation above.</p>
        </div>
      )}
    </div>
  );
};

