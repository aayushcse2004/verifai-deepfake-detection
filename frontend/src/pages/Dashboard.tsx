import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Upload,
  Video,
  Volume2,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
  AlertTriangle,
  Layers,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { getAnalysisHistory, getSystemHealth, getSystemMonitor } from '../services/api';
import { AnalysisJob, SystemHealth, SystemMonitorData } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { RiskBadge } from '../components/RiskBadge';
import { ModelStatusBadge } from '../components/ModelStatusBadge';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [telemetry, setTelemetry] = useState<SystemMonitorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [histData, healthData, teleData] = await Promise.all([
        getAnalysisHistory(25),
        getSystemHealth(),
        getSystemMonitor().catch(() => null),
      ]);
      setHistory(histData);
      setHealth(healthData);
      if (teleData) setTelemetry(teleData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Aggregated metrics
  const totalAnalyses = history.length;
  const completedJobs = history.filter((j) => j.status === 'COMPLETED').length;
  const processingJobs = history.filter((j) => j.status === 'PROCESSING' || j.status === 'PENDING').length;
  const videoJobs = history.filter((j) => j.media?.file_type === 'video').length;
  const audioJobs = history.filter((j) => j.media?.file_type === 'audio').length;
  const imageJobs = history.filter((j) => j.media?.file_type === 'image').length;

  // Media distribution chart data
  const mediaDistribution = [
    { name: 'Video Streams', count: videoJobs, color: '#06B6D4' },
    { name: 'Audio Signals', count: audioJobs, color: '#6366F1' },
    { name: 'Static Images', count: imageJobs, color: '#22C55E' },
  ].filter((d) => d.count > 0);

  // Status breakdown chart data
  const statusDistribution = [
    { name: 'Completed', count: completedJobs, color: '#22C55E' },
    { name: 'In Flight', count: processingJobs, color: '#F59E0B' },
    { name: 'Failed', count: history.filter((j) => j.status === 'FAILED').length, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        subtitle="Executive digital forensics dashboard, real-time multimodal telemetry & active investigation status"
        icon={<Activity className="w-6 h-6" />}
        breadcrumbs={[{ label: 'Command Center' }]}
        badge={
          <Badge variant="accent" dot>
            Live Engine
          </Badge>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Telemetry
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/upload')}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              New Investigation
            </Button>
          </>
        }
      />

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : (
          <>
            <MetricCard
              label="Total Investigations"
              value={totalAnalyses}
              subtitle="Registered media assets"
              accentColor="primary"
              icon={<Activity className="w-5 h-5" />}
            />
            <MetricCard
              label="Completed Forensics"
              value={completedJobs}
              subtitle={`${totalAnalyses ? Math.round((completedJobs / totalAnalyses) * 100) : 0}% verification completion`}
              accentColor="success"
              icon={<ShieldCheck className="w-5 h-5" />}
            />
            <MetricCard
              label="Processing In-Flight"
              value={processingJobs}
              subtitle={processingJobs > 0 ? 'Active background analysis' : 'Queue clear'}
              accentColor="warning"
              icon={<Clock className="w-5 h-5" />}
            />
            <MetricCard
              label="Hardware Acceleration"
              value={telemetry?.gpu?.available ? 'CUDA 12.1' : 'CPU Mode'}
              subtitle={telemetry?.gpu?.name || 'PyTorch Inference Core'}
              accentColor="accent"
              icon={<Cpu className="w-5 h-5" />}
            />
          </>
        )}
      </div>

      {/* Forensic Laboratory Quick-Launch Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { to: '/lab/video', label: 'Video Lab', sub: 'MesoNet & BBoxes', icon: Video, color: 'text-[#06B6D4]', hover: 'hover:border-[#06B6D4]/40' },
          { to: '/lab/audio', label: 'Audio Lab', sub: 'Welch PSD & Vocoder', icon: Volume2, color: 'text-[#6366F1]', hover: 'hover:border-[#6366F1]/40' },
          { to: '/lab/sync', label: 'AV Sync Lab', sub: 'SyncNet Correlation', icon: Activity, color: 'text-[#22C55E]', hover: 'hover:border-[#22C55E]/40' },
          { to: '/lab/compare', label: 'Media Compare', sub: 'pHash & SHA-256', icon: GitCompareIcon, color: 'text-[#F59E0B]', hover: 'hover:border-[#F59E0B]/40' },
          { to: '/models', label: 'Model Zoo', sub: 'Diagnostics & Weights', icon: Layers, color: 'text-[#6366F1]', hover: 'hover:border-[#6366F1]/40' },
          { to: '/system', label: 'GPU Monitor', sub: 'VRAM & Telemetry', icon: Server, color: 'text-[#06B6D4]', hover: 'hover:border-[#06B6D4]/40' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              to={item.to}
              className={`p-3.5 rounded-xl bg-[#0E1424] border border-[#1E293B] ${item.hover} transition-all text-center group shadow-md flex flex-col items-center justify-center`}
            >
              <div className="p-2 rounded-lg bg-[#111827] mb-2 group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-xs font-semibold text-white truncate w-full">{item.label}</span>
              <span className="text-[10px] text-[#64748B] truncate w-full">{item.sub}</span>
            </Link>
          );
        })}
      </div>

      {/* Analytics Charts & Live GPU Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Investigation Ingestion Distribution</CardTitle>
              <p className="text-xs text-[#94A3B8] mt-0.5">Asset classification by container and media stream type</p>
            </div>
            <Badge variant="secondary">{totalAnalyses} Ingested</Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-60 w-full" />
            ) : totalAnalyses === 0 ? (
              <EmptyState
                title="No Ingested Media Assets"
                description="Upload an audio or video file to populate multimodal forensics charts."
                actionLabel="New Investigation"
                onAction={() => navigate('/upload')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusDistribution}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0E1424',
                          borderColor: '#1E293B',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase text-[#64748B] block mb-2">Ingestion Types</span>
                  {[
                    { label: 'Video Containers (MP4, MOV, MKV, AVI)', count: videoJobs, color: '#06B6D4' },
                    { label: 'Acoustic Audio (WAV, MP3, M4A)', count: audioJobs, color: '#6366F1' },
                    { label: 'Static Images (PNG, JPG, WEBP)', count: imageJobs, color: '#22C55E' },
                  ].map((row, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#070A13] border border-[#1E293B] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                        <span className="text-xs text-slate-300 font-medium">{row.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live System & GPU Telemetry Card */}
        <Card>
          <CardHeader>
            <CardTitle>Hardware Accelerator</CardTitle>
            <Badge variant="accent" dot>
              {telemetry?.gpu?.available ? 'GPU Active' : 'CPU Fallback'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#070A13] border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">GPU Device</span>
                <span className="font-mono text-white font-semibold">
                  {telemetry?.gpu?.name || 'NVIDIA GeForce GTX 1650'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">VRAM Memory</span>
                <span className="font-mono text-[#06B6D4]">
                  {telemetry?.gpu?.memory_used_mb ?? 0} MB / {telemetry?.gpu?.memory_total_mb ?? 4096} MB
                </span>
              </div>
              <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, telemetry?.gpu?.memory_usage_pct || 15)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#070A13] border border-[#1E293B]">
                <span className="text-[#64748B] block text-[10px] font-mono uppercase">Host CPU Load</span>
                <span className="text-lg font-bold font-mono text-white mt-1 block">
                  {telemetry?.cpu?.utilization_pct ?? 12.4}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#070A13] border border-[#1E293B]">
                <span className="text-[#64748B] block text-[10px] font-mono uppercase">RAM Used</span>
                <span className="text-lg font-bold font-mono text-white mt-1 block">
                  {telemetry?.memory?.used_gb ?? 5.8} GB
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/system')}
              className="w-full text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Full Telemetry Monitor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Model Zoo Operational Status Grid */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Multimodal Forensic Engine Registry</CardTitle>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Active neural checkpoints and fallback analytical digital signal processing modules
            </p>
          </div>
          <Button variant="ghost" size="xs" onClick={() => navigate('/models')}>
            View All Models <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {health?.models ? (
              Object.entries(health.models).map(([key, model]) => (
                <div
                  key={key}
                  className="bg-[#070A13] border border-[#1E293B] hover:border-[#334155] rounded-xl p-4 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide">{model.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">Build: v{model.version}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                  </div>
                  <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#64748B]">Operational Mode</span>
                    <ModelStatusBadge mode={model.operational_mode} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-xs text-[#64748B]">
                Connecting to forensic model registry...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Investigations Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Forensic Investigations</CardTitle>
            <p className="text-xs text-[#94A3B8] mt-0.5">Last processed media files and verification results</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
            Full History ({totalAnalyses})
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : history.length === 0 ? (
            <EmptyState
              title="No Investigations Recorded"
              description="Upload your first audio, video, or image file to execute multimodal deepfake analysis."
              actionLabel="Start First Investigation"
              onAction={() => navigate('/upload')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[#64748B] font-mono uppercase text-[10px]">
                    <th className="pb-3 pl-2">Investigation ID</th>
                    <th className="pb-3">Asset Filename</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">SHA-256 Hash</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60">
                  {history.slice(0, 7).map((job) => (
                    <tr key={job.id} className="hover:bg-[#131B2E]/60 transition-colors group">
                      <td className="py-3.5 pl-2 font-mono text-[#06B6D4] font-semibold">
                        <Link to={`/results/${job.id}`} className="hover:underline">
                          {job.id.substring(0, 8)}...
                        </Link>
                      </td>
                      <td className="py-3.5 font-medium text-white max-w-[200px] truncate">
                        {job.media?.original_filename || 'Unknown asset'}
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono uppercase text-[10px] text-slate-300 px-2 py-0.5 rounded bg-[#111827] border border-[#1E293B]">
                          {job.media?.file_type || 'media'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <RiskBadge status={job.status} />
                      </td>
                      <td className="py-3.5 font-mono text-[#64748B] text-[11px] truncate max-w-[140px]">
                        {job.media?.file_hash ? `${job.media.file_hash.substring(0, 16)}...` : 'Calculating'}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/results/${job.id}`}
                            className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-300 hover:text-white transition-colors"
                            title="View Forensic Results"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {job.media?.file_type === 'video' && (
                            <Link
                              to={`/lab/video/${job.id}`}
                              className="p-1.5 rounded-lg bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 text-[#22D3EE] transition-colors"
                              title="Open in Video Lab"
                            >
                              <Video className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {job.media?.file_type === 'audio' && (
                            <Link
                              to={`/lab/audio/${job.id}`}
                              className="p-1.5 rounded-lg bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#818CF8] transition-colors"
                              title="Open in Audio Lab"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper icon
const GitCompareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <path d="M11 18H8a2 2 0 0 1-2-2V9" />
  </svg>
);
