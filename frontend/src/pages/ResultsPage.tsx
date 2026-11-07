import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  FileDown,
  Video,
  Mic,
  Users,
  Volume2,
  Info,
  Layers,
  FileText,
  Copy,
  Check,
  Activity,
  Code2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import { getAnalysisResults, getReportDownloadUrl } from '../services/api';
import { ForensicResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ModelStatusBadge } from '../components/ModelStatusBadge';
import { GaugeMeter } from '../components/GaugeMeter';
import { EvidenceTimeline } from '../components/EvidenceTimeline';
import { SpeakerTimeline } from '../components/SpeakerTimeline';

export const ResultsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'lipsync' | 'speaker' | 'audio' | 'models'>('evidence');
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!analysisId) return;
    getAnalysisResults(analysisId)
      .then((data) => setResult(data))
      .catch((err) => {
        console.error('Error fetching results:', err);
        setError(err?.response?.data?.detail || 'Failed to load forensic analysis results.');
      })
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">Aggregating Forensic Telemetry...</h3>
        <p className="text-xs text-[#94A3B8]">Compiling multimodal scores, face tracks, and audio features</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center mx-auto mb-4 text-[#EF4444]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Analysis Results Unavailable</h2>
        <p className="text-sm text-[#94A3B8] mb-6">{error || 'Could not find record for this analysis ID.'}</p>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] hover:bg-[#1E293B] text-white text-xs font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Radar data
  const chartData = [
    { subject: 'Facial CNN', score: Math.round((result.facial_score || 0) * 100), fullMark: 100 },
    { subject: 'Lip-Sync', score: Math.round((result.lip_sync_score || 0) * 100), fullMark: 100 },
    { subject: 'Active Speaker', score: Math.round((result.active_speaker_score || 0) * 100), fullMark: 100 },
    { subject: 'Audio PSD', score: Math.round((result.audio_score || 0) * 100), fullMark: 100 },
  ];

  // Bar comparison data
  const barData = [
    { name: 'Facial', score: Math.round((result.facial_score || 0) * 100) },
    { name: 'Lip-Sync', score: Math.round((result.lip_sync_score || 0) * 100) },
    { name: 'Speaker', score: Math.round((result.active_speaker_score || 0) * 100) },
    { name: 'Audio', score: Math.round((result.audio_score || 0) * 100) },
  ];

  const formatScore = (s?: number | null) => (s !== null && s !== undefined ? `${Math.round(s * 100)}%` : 'N/A');

  const copyId = () => {
    navigator.clipboard.writeText(result.analysis_id);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `verifai_${result.analysis_id.slice(0, 8)}.json`);
    dlAnchor.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Report Download */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs text-[#06B6D4]">ANALYSIS ID: {result.analysis_id}</span>
            <button
              onClick={copyId}
              title="Copy Analysis ID"
              className="text-slate-400 hover:text-white transition-colors"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Forensic Media Verification Report
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadJson}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] hover:bg-[#1E293B] text-slate-300 text-xs font-semibold transition-colors"
            title="Export raw forensic JSON"
          >
            <Code2 className="w-3.5 h-3.5 text-[#06B6D4]" />
            Export JSON
          </button>

          <a
            href={getReportDownloadUrl(result.analysis_id)}
            target="_blank"
            rel="noreferrer"
            download
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white text-xs font-bold shadow-lg shadow-[#6366F1]/20 transition-all hover:scale-105"
          >
            <FileDown className="w-4 h-4" />
            Download PDF Report
          </a>
        </div>
      </div>

      {/* Main Assessment Banner & Risk Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Assessment Summary */}
        <div className="lg:col-span-8 bg-[#111827] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#94A3B8]">
              Automated Forensic Determination
            </span>
            <div className="mt-3 mb-4">
              <RiskBadge assessment={result.overall_assessment} size="lg" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              VerifAI synthesized multi-modal features across facial textures, audio-visual lip synchrony,
              active speaker concordance, and acoustic frequency distribution.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#1E293B] mt-6">
            <div>
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Facial Artifacts</span>
              <p className="text-lg font-mono font-bold text-white">{formatScore(result.facial_score)}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Lip-Sync Lag</span>
              <p className="text-lg font-mono font-bold text-white">{formatScore(result.lip_sync_score)}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Active Speaker</span>
              <p className="text-lg font-mono font-bold text-white">{formatScore(result.active_speaker_score)}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Acoustic Splices</span>
              <p className="text-lg font-mono font-bold text-white">{formatScore(result.audio_score)}</p>
            </div>
          </div>
        </div>

        {/* Right Radial Gauge Meter */}
        <div className="lg:col-span-4 bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl flex items-center justify-center">
          <GaugeMeter
            score={result.overall_score}
            label="Overall Risk Index"
            subLabel="Normalized Heuristic Fusion Score"
          />
        </div>
      </div>

      {/* 4 Component Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'Facial Manipulation',
            score: result.facial_score,
            sub: 'CNN Frequency & Texture Anomaly',
            icon: Video,
            statusKey: 'facial',
            color: 'text-[#6366F1]',
          },
          {
            title: 'Lip-Sync Inconsistency',
            score: result.lip_sync_score,
            sub: 'SyncNet AV Offset Correlation',
            icon: Mic,
            statusKey: 'lip_sync',
            color: 'text-[#06B6D4]',
          },
          {
            title: 'Active Speaker Mismatch',
            score: result.active_speaker_score,
            sub: 'TalkNet Voice-Face Association',
            icon: Users,
            statusKey: 'active_speaker',
            color: 'text-[#22C55E]',
          },
          {
            title: 'Acoustic Discontinuity',
            score: result.audio_score,
            sub: 'Spectral PSD & Splice Forensics',
            icon: Volume2,
            statusKey: 'audio',
            color: 'text-[#F59E0B]',
          },
        ].map((comp, idx) => {
          const Icon = comp.icon;
          const mod = result.model_statuses[comp.statusKey];
          return (
            <div key={idx} className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${comp.color}`} />
                {mod && <ModelStatusBadge mode={mod.operational_mode} status={mod.status} />}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{comp.title}</h4>
                <p className="text-[11px] text-[#94A3B8]">{comp.sub}</p>
              </div>

              <div className="pt-2 border-t border-[#1E293B] flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Risk Score:</span>
                <span className="text-xl font-mono font-extrabold text-white">
                  {formatScore(comp.score)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid: Radar vs Component Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-6 bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl flex flex-col items-center">
          <div className="w-full mb-2">
            <h3 className="text-base font-bold text-white">Multimodal Risk Distribution</h3>
            <p className="text-xs text-[#94A3B8]">Cross-modal profile across 4 detection dimensions</p>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Radar
                  name="Risk Score"
                  dataKey="score"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Comparison */}
        <div className="lg:col-span-6 bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl flex flex-col items-center">
          <div className="w-full mb-2">
            <h3 className="text-base font-bold text-white">Component Risk vs Baseline</h3>
            <p className="text-xs text-[#94A3B8]">Comparative percentage breakdown</p>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="score" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deep-Dive Explorer Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-[#1E293B] gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'evidence', label: `Evidence Timeline (${result.evidence_items.length})`, icon: Activity },
            { id: 'speaker', label: 'Speaker Diarization & Speech', icon: Users },
            { id: 'lipsync', label: 'Lip-Sync Telemetry', icon: Mic },
            { id: 'audio', label: 'Acoustic Forensics & PSD', icon: Volume2 },
            { id: 'models', label: 'Model Specifications', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#06B6D4] text-[#06B6D4]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Evidence Timeline */}
        {activeTab === 'evidence' && <EvidenceTimeline items={result.evidence_items} />}

        {/* Tab 2: Speaker Diarization & Whisper Transcription */}
        {activeTab === 'speaker' && (
          <div className="space-y-6">
            <SpeakerTimeline segments={result.speaker_segments} />
            {result.transcription && (
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 shadow-xl space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#06B6D4]" />
                  Whisper Continuous Speech Transcription
                </h3>
                <div className="bg-[#080D18] rounded-lg p-4 text-sm text-slate-300 font-mono leading-relaxed border border-[#1E293B]">
                  "{result.transcription}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Lip-Sync Telemetry */}
        {activeTab === 'lipsync' && (
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">SyncNet Audio-Visual Synchronization Analysis</h3>
              <p className="text-xs text-[#94A3B8]">
                Estimates temporal offset between mouth-region optical movement velocity and speech acoustic energy
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#080D18] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-slate-500 block mb-1">ESTIMATED OFFSET</span>
                <span className="text-2xl font-bold text-white">
                  {result.detailed_metrics?.lip_sync?.offset_ms ?? 0} ms
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Normal: -80ms to +80ms</span>
              </div>
              <div className="bg-[#080D18] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-slate-500 block mb-1">CROSS-MODAL CORRELATION</span>
                <span className="text-2xl font-bold text-[#06B6D4]">
                  {result.detailed_metrics?.lip_sync?.cross_modal_correlation ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Normal &gt; 0.25</span>
              </div>
              <div className="bg-[#080D18] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-slate-500 block mb-1">EVALUATED TIMEPOINTS</span>
                <span className="text-2xl font-bold text-white">
                  {result.detailed_metrics?.lip_sync?.evaluated_points ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Face crops sampled</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audio PSD & Splice Forensics */}
        {activeTab === 'audio' && (
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Acoustic Signal Characteristics & Welch PSD</h3>
              <p className="text-xs text-[#94A3B8]">
                Frequency band distribution, dynamic range, and splice discontinuity detection
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-[#080D18] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-slate-500 block mb-1">SPECTRAL CENTROID</span>
                <span className="text-xl font-bold text-white">
                  {result.detailed_metrics?.audio?.spectral_centroid_hz ?? 0} Hz
                </span>
              </div>
              <div className="bg-[#080D18] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-slate-500 block mb-1">DYNAMIC RANGE</span>
                <span className="text-xl font-bold text-white">
                  {result.detailed_metrics?.audio?.dynamic_range_db ?? 0} dB
                </span>
              </div>
              <div className="bg-[#080D18] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-slate-500 block mb-1">ZERO CROSSING RATE</span>
                <span className="text-xl font-bold text-white">
                  {result.detailed_metrics?.audio?.zero_crossing_rate ?? 0}
                </span>
              </div>
              <div className="bg-[#080D18] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-slate-500 block mb-1">SPLICE POINTS</span>
                <span className="text-xl font-bold text-white">
                  {result.detailed_metrics?.audio?.splice_points_detected ?? 0}
                </span>
              </div>
            </div>

            {/* Frequency Bands */}
            {result.detailed_metrics?.audio?.frequency_bands && (
              <div className="pt-2">
                <span className="text-xs text-slate-300 font-semibold block mb-2">
                  Acoustic Frequency Band Energy (%)
                </span>
                <div className="h-4 w-full bg-[#080D18] rounded-full overflow-hidden flex border border-[#1E293B]">
                  <div
                    title="Low Band (100-1000Hz)"
                    style={{ width: `${result.detailed_metrics.audio.frequency_bands.low_pct || 25}%` }}
                    className="bg-[#6366F1]"
                  />
                  <div
                    title="Mid Band (1-4kHz)"
                    style={{ width: `${result.detailed_metrics.audio.frequency_bands.mid_pct || 40}%` }}
                    className="bg-[#06B6D4]"
                  />
                  <div
                    title="High Band (4-8kHz)"
                    style={{ width: `${result.detailed_metrics.audio.frequency_bands.high_pct || 25}%` }}
                    className="bg-[#22C55E]"
                  />
                  <div
                    title="Ultra-High (>8kHz)"
                    style={{ width: `${result.detailed_metrics.audio.frequency_bands.ultra_high_pct || 10}%` }}
                    className="bg-[#F59E0B]"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span className="text-[#6366F1]">Low Band (100-1k)</span>
                  <span className="text-[#06B6D4]">Mid Band (1-4k)</span>
                  <span className="text-[#22C55E]">High Band (4-8k)</span>
                  <span className="text-[#F59E0B]">Ultra-High (&gt;8k)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Model Specifications & Operational Modes */}
        {activeTab === 'models' && (
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Model Specifications & Transparent Runtime State</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[#94A3B8] font-mono uppercase">
                    <th className="py-3 px-4">Engine</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Operational Mode</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                  {Object.entries(result.model_statuses).map(([key, mod]) => (
                    <tr key={key} className="hover:bg-[#1E293B]/30">
                      <td className="py-3 px-4 font-semibold text-white">{mod.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{mod.version}</td>
                      <td className="py-3 px-4">
                        <ModelStatusBadge mode={mod.operational_mode} status={mod.status} />
                      </td>
                      <td className="py-3 px-4 font-mono">{Math.round(mod.confidence * 100)}%</td>
                      <td className="py-3 px-4 font-mono text-[#22C55E]">{mod.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Limitations & Legal Disclaimer */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-[#F59E0B]" />
          Forensic Limitations & Methodology Notes
        </h3>
        <ul className="space-y-1.5 text-xs text-slate-400">
          {result.limitations.map((lim, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#06B6D4]">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>

        <div className="pt-3 border-t border-[#1E293B] text-[11px] text-slate-500 italic">
          {result.disclaimer}
        </div>
      </div>
    </div>
  );
};
