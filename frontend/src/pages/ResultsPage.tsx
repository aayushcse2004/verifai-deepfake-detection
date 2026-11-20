import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Hash,
  Download,
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
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Tabs } from '../components/common/Tabs';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { useToast } from '../components/common/ToastContext';
import { RiskBadge } from '../components/RiskBadge';
import { ModelStatusBadge } from '../components/ModelStatusBadge';
import { GaugeMeter } from '../components/GaugeMeter';
import { EvidenceTimeline } from '../components/EvidenceTimeline';
import { SpeakerTimeline } from '../components/SpeakerTimeline';

export const ResultsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [result, setResult] = useState<ForensicResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('evidence');
  const [copiedHash, setCopiedHash] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);

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

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    showToast({
      type: 'info',
      title: 'Digest Copied',
      message: 'Cryptographic SHA-256 hash copied to clipboard.',
    });
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <ErrorState
        title="Forensic Findings Unavailable"
        message={error || 'Could not find record for this investigation ID.'}
        onRetry={() => window.location.reload()}
      />
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

  const formatScore = (val?: number | null) => (val !== undefined && val !== null ? `${(val * 100).toFixed(0)}%` : 'N/A');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={`Investigation Report: ${result.analysis_id.substring(0, 8)}`}
        subtitle="Comprehensive evidence synthesis, multimodal neural model outputs & risk assessment breakdown"
        icon={<Activity className="w-6 h-6" />}
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Investigation History', to: '/history' },
          { label: result.analysis_id.substring(0, 8) },
        ]}
        badge={<RiskBadge assessment={result.overall_assessment} />}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJsonModalOpen(true)}
              leftIcon={<Code2 className="w-3.5 h-3.5" />}
            >
              Raw Forensic JSON
            </Button>
            <a
              href={getReportDownloadUrl(result.analysis_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-medium rounded-lg px-3 py-1.5 text-xs gap-1.5 bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 hover:bg-[#22C55E]/25 transition-all shadow-md shadow-[#22C55E]/10"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download PDF Certificate
            </a>
          </>
        }
      />

      {/* Primary Assessment Banner & Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Gauge Card (4 Cols) */}
        <Card className="lg:col-span-4 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-mono uppercase tracking-wider text-[#64748B] mb-2 font-semibold">
            Calibrated Risk Score
          </span>
          <GaugeMeter score={result.overall_score} size={220} />
          <div className="mt-4 pt-4 border-t border-[#1E293B] w-full text-center">
            <span className="text-xs font-mono text-[#94A3B8]">Overall Assessment:</span>
            <p className="text-sm font-bold text-white mt-0.5">{result.overall_assessment}</p>
          </div>
        </Card>

        {/* Assessment Description & Laboratory Shortcuts (8 Cols) */}
        <Card className="lg:col-span-8 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#06B6D4] font-bold tracking-wider">
                Evidence Synthesis Verdict
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">
                ID: {result.analysis_id}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {result.overall_assessment === 'POTENTIAL MANIPULATION DETECTED'
                ? 'Statistically Significant Forensic Anomalies Detected'
                : result.overall_assessment === 'INCONCLUSIVE'
                ? 'Inconclusive Analysis — Modality Discrepancies Present'
                : 'Nominal Authenticity — Low Evidence of Synthetic Manipulation'}
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Automated multimodal forensic examination combining convolutional facial frequency inspection (2D FFT / Laplacian residuals), SyncNet audio-visual synchrony, TalkNet speaker concordance, and acoustic vocoder frequency cutoff analysis.
            </p>
          </div>

          {/* Quick Deep-Dive Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1E293B]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/lab/video/${result.analysis_id}`)}
              leftIcon={<Video className="w-3.5 h-3.5 text-[#06B6D4]" />}
              className="w-full text-xs"
            >
              Video Forensics Lab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/lab/audio/${result.analysis_id}`)}
              leftIcon={<Volume2 className="w-3.5 h-3.5 text-[#6366F1]" />}
              className="w-full text-xs"
            >
              Audio Forensics Lab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/lab/sync/${result.analysis_id}`)}
              leftIcon={<Activity className="w-3.5 h-3.5 text-[#22C55E]" />}
              className="w-full text-xs col-span-2 sm:col-span-1"
            >
              AV Sync Lab
            </Button>
          </div>
        </Card>
      </div>

      {/* 4 Component Forensic Modality Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'Facial Synthesis Artifacts',
            score: result.facial_score,
            sub: 'MesoNet-4 & 2D FFT Residuals',
            icon: Video,
            statusKey: 'facial',
            color: 'text-[#6366F1]',
          },
          {
            title: 'Lip-Sync Desynchronization',
            score: result.lip_sync_score,
            sub: 'SyncNet AV Cross-Modal Lag',
            icon: Mic,
            statusKey: 'lip_sync',
            color: 'text-[#06B6D4]',
          },
          {
            title: 'Active Speaker Concordance',
            score: result.active_speaker_score,
            sub: 'TalkNet Voice-Face Association',
            icon: Users,
            statusKey: 'active_speaker',
            color: 'text-[#22C55E]',
          },
          {
            title: 'Acoustic Vocoder Cutoff',
            score: result.audio_score,
            sub: 'Welch PSD & Splice Forensics',
            icon: Volume2,
            statusKey: 'audio',
            color: 'text-[#F59E0B]',
          },
        ].map((comp, idx) => {
          const Icon = comp.icon;
          const mod = result.model_statuses[comp.statusKey];
          return (
            <Card key={idx} className="p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-[#070A13] border border-[#1E293B]">
                  <Icon className={`w-5 h-5 ${comp.color}`} />
                </div>
                {mod && <ModelStatusBadge mode={mod.operational_mode} status={mod.status} />}
              </div>

              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">{comp.title}</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">{comp.sub}</p>
              </div>

              <div className="pt-2 border-t border-[#1E293B] flex items-baseline justify-between font-mono">
                <span className="text-xs text-[#94A3B8]">Risk Score:</span>
                <span className="text-xl font-extrabold text-white">
                  {formatScore(comp.score)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Radar Distribution & Component Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col items-center">
          <div className="w-full mb-4">
            <CardTitle>Multimodal Risk Distribution</CardTitle>
            <p className="text-xs text-[#94A3B8] mt-0.5">Cross-modal radar profile across 4 detection dimensions</p>
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
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center">
          <div className="w-full mb-4">
            <CardTitle>Component Risk Breakdown</CardTitle>
            <p className="text-xs text-[#94A3B8] mt-0.5">Component percentage scores relative to anomaly thresholds</p>
          </div>
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1424', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Deep-Dive Explorer Tabs */}
      <Card className="p-6 space-y-6">
        <Tabs
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t)}
          tabs={[
            { id: 'evidence', label: 'Evidence Timeline', count: result.evidence_items.length },
            { id: 'speaker', label: 'Speaker Diarization & Speech' },
            { id: 'lipsync', label: 'Lip-Sync Telemetry' },
            { id: 'audio', label: 'Acoustic Forensics & PSD' },
            { id: 'models', label: 'Model Specifications' },
          ]}
        />

        {/* Tab 1: Evidence Timeline */}
        {activeTab === 'evidence' && <EvidenceTimeline items={result.evidence_items} />}

        {/* Tab 2: Speaker Diarization & Speech Transcription */}
        {activeTab === 'speaker' && (
          <div className="space-y-6">
            <SpeakerTimeline segments={result.speaker_segments} />
            {result.transcription && (
              <div className="bg-[#070A13] border border-[#1E293B] rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase">
                  <FileText className="w-4 h-4 text-[#06B6D4]" />
                  Whisper Continuous Speech Transcription
                </h4>
                <div className="p-4 rounded-lg bg-[#0E1424] text-xs text-slate-300 font-mono leading-relaxed border border-[#1E293B]">
                  "{result.transcription}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Lip-Sync Telemetry */}
        {activeTab === 'lipsync' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-white">SyncNet Audio-Visual Synchronization Analysis</h4>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Estimates temporal lag offset between mouth-region optical movement velocity and speech acoustic energy
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#070A13] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block mb-1">ESTIMATED OFFSET</span>
                <span className="text-2xl font-bold text-white">
                  {result.detailed_metrics?.lip_sync?.offset_ms ?? 0} ms
                </span>
                <span className="text-[10px] text-[#94A3B8] block mt-1">Normal: -80ms to +80ms</span>
              </div>
              <div className="bg-[#070A13] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block mb-1">CROSS-MODAL CORRELATION</span>
                <span className="text-2xl font-bold text-[#06B6D4]">
                  {result.detailed_metrics?.lip_sync?.cross_modal_correlation ?? 0}
                </span>
                <span className="text-[10px] text-[#94A3B8] block mt-1">Normal &gt; 0.25</span>
              </div>
              <div className="bg-[#070A13] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block mb-1">EVALUATED TIMEPOINTS</span>
                <span className="text-2xl font-bold text-white">
                  {result.detailed_metrics?.lip_sync?.evaluated_points ?? 0}
                </span>
                <span className="text-[10px] text-[#94A3B8] block mt-1">Consecutive face crops</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audio PSD & Splice Forensics */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-white">Acoustic Signal Characteristics & Welch PSD</h4>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Frequency band distribution, dynamic range, and neural vocoder cutoff detection
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-[#070A13] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block mb-1">SPECTRAL CENTROID</span>
                <span className="text-lg font-bold text-white">
                  {result.detailed_metrics?.audio?.spectral_centroid_hz ?? 0} Hz
                </span>
              </div>
              <div className="bg-[#070A13] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block mb-1">DYNAMIC RANGE</span>
                <span className="text-lg font-bold text-white">
                  {result.detailed_metrics?.audio?.dynamic_range_db ?? 0} dB
                </span>
              </div>
              <div className="bg-[#070A13] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block mb-1">ZERO CROSSING RATE</span>
                <span className="text-lg font-bold text-white">
                  {result.detailed_metrics?.audio?.zero_crossing_rate ?? 0}
                </span>
              </div>
              <div className="bg-[#070A13] p-4 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block mb-1">SPLICE POINTS</span>
                <span className="text-lg font-bold text-white">
                  {result.detailed_metrics?.audio?.splice_points_detected ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Model Specifications & Operational Modes */}
        {activeTab === 'models' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">Model Specifications & Transparent Runtime State</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[#64748B] font-mono uppercase text-[10px] bg-[#070A13]">
                    <th className="py-3 px-4">Engine</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Operational Mode</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                  {Object.entries(result.model_statuses).map(([key, mod]) => (
                    <tr key={key} className="hover:bg-[#131B2E]">
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
      </Card>

      {/* Limitations & Legal Disclaimer Card */}
      <Card className="p-6 space-y-3 bg-[#0A0F1D]">
        <h4 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase">
          <Info className="w-4 h-4 text-[#F59E0B]" />
          Forensic Limitations & Methodology Notes
        </h4>
        <ul className="space-y-1.5 text-xs text-[#94A3B8]">
          {result.limitations.map((lim, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#06B6D4]">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
        <div className="pt-3 border-t border-[#1E293B] text-[11px] text-[#64748B] italic">
          {result.disclaimer}
        </div>
      </Card>

      {/* Raw Forensic JSON Modal */}
      <Modal
        isOpen={jsonModalOpen}
        onClose={() => setJsonModalOpen(false)}
        title="Raw Forensic Verification Record"
        description="Machine-readable JSON telemetry schema for academic export & secondary verification"
        maxWidth="2xl"
        footer={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(result, null, 2));
              showToast({
                type: 'success',
                title: 'Copied',
                message: 'Forensic JSON copied to clipboard.',
              });
            }}
            leftIcon={<Copy className="w-3.5 h-3.5" />}
          >
            Copy JSON to Clipboard
          </Button>
        }
      >
        <pre className="p-4 rounded-xl bg-[#070A13] text-slate-300 font-mono text-[11px] overflow-x-auto max-h-[60vh] border border-[#1E293B]">
          {JSON.stringify(result, null, 2)}
        </pre>
      </Modal>
    </div>
  );
};
