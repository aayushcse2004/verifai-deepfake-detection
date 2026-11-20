import React, { useEffect, useState } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  Layers,
  CheckCircle,
  Clock,
  RefreshCw,
  Gauge,
  Flame,
  Radio,
  Server,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { getSystemMonitor, triggerStorageCleanup } from '../services/api';
import { SystemMonitorData } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/ToastContext';

export const SystemMonitorPage: React.FC = () => {
  const { addToast } = useToast();
  const [data, setData] = useState<SystemMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(3000);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Storage Cleanup state
  const [cleaning, setCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const fetchMetrics = async () => {
    try {
      const res = await getSystemMonitor();
      setData(res);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load system monitor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    if (!autoRefresh) return;
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleCleanup = async (dryRun: boolean) => {
    setCleaning(true);
    try {
      const res = await triggerStorageCleanup(14, dryRun, true);
      setCleanupResult(res);
      addToast({
        type: 'success',
        title: dryRun ? 'Cleanup Simulation Completed' : 'Storage Retention Cleanup Executed',
        message: `${res.files_deleted} files processed, ${(res.bytes_freed / (1024 * 1024)).toFixed(2)} MB evaluated.`,
      });
      fetchMetrics();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Cleanup Operation Failed',
        message: err?.response?.data?.detail || err?.message || 'Failed to execute cleanup.',
      });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'AI Intelligence' },
          { label: 'System Monitor' },
        ]}
      />

      <PageHeader
        title="System & Hardware Telemetry"
        subtitle="Real-time GPU acceleration, host CPU/RAM metrics, and investigation queue status"
        icon={<Server className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0E1424] border border-[#1E293B] px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400">
              <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-[#22C55E] animate-pulse' : 'text-slate-500'}`} />
              <span>Updated: {lastUpdated || 'Polling...'}</span>
            </div>

            <Button
              variant={autoRefresh ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-Polling ON' : 'Auto-Polling OFF'}
            </Button>

            <Button variant="outline" size="sm" onClick={fetchMetrics} title="Refresh now">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        }
      />

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Hardware Primary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* GPU Card */}
            <Card className="border-[#1E293B] bg-[#0E1424] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#06B6D4]/5 rounded-full blur-2xl pointer-events-none" />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">NVIDIA GPU</span>
                  <Badge variant={data.gpu.available ? 'success' : 'neutral'}>
                    {data.gpu.available ? 'CUDA ACTIVE' : 'CPU FALLBACK'}
                  </Badge>
                </div>
                <p className="text-base font-bold text-white truncate" title={data.gpu.name}>{data.gpu.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-[#06B6D4]">{data.gpu.utilization_pct}%</span>
                  <span className="text-xs text-slate-400">Compute Load</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between font-mono">
                    <span>VRAM:</span>
                    <span className="text-white">
                      {data.gpu.memory_used_mb.toFixed(0)} / {data.gpu.memory_total_mb.toFixed(0)} MB
                    </span>
                  </div>
                  <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#06B6D4] to-[#6366F1] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, data.gpu.memory_usage_pct)}%` }}
                    />
                  </div>
                  {data.gpu.temperature_c > 0 && (
                    <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                      <span className="flex items-center gap-1 text-[#F59E0B]">
                        <Flame className="w-3 h-3" /> Core Temp:
                      </span>
                      <span className="text-white">{data.gpu.temperature_c}°C</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CPU Card */}
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Host CPU</span>
                  <Cpu className="w-4 h-4 text-[#6366F1]" />
                </div>
                <p className="text-base font-bold text-white">
                  {data.cpu.cores_physical} Cores ({data.cpu.cores_logical} Threads)
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-[#6366F1]">{data.cpu.utilization_pct}%</span>
                  <span className="text-xs text-slate-400">CPU Load</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#6366F1] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, data.cpu.utilization_pct)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">FastAPI worker threadpool utilization</p>
                </div>
              </CardContent>
            </Card>

            {/* RAM Card */}
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">System RAM</span>
                  <Activity className="w-4 h-4 text-[#22C55E]" />
                </div>
                <p className="text-base font-bold text-white">
                  {data.memory.used_gb} / {data.memory.total_gb} GB
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-[#22C55E]">{data.memory.utilization_pct}%</span>
                  <span className="text-xs text-slate-400">Memory Usage</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#22C55E] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, data.memory.utilization_pct)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Includes PyTorch tensors and frame buffers</p>
                </div>
              </CardContent>
            </Card>

            {/* Storage Card */}
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Storage Volume</span>
                  <HardDrive className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <p className="text-base font-bold text-white">
                  {data.disk.free_gb} GB Available
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-[#F59E0B]">{data.disk.utilization_pct}%</span>
                  <span className="text-xs text-slate-400">Disk Used</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#F59E0B] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, data.disk.utilization_pct)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate" title={data.disk.storage_path}>
                    Path: {data.disk.storage_path}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workload Queue & Investigation Pipeline Status */}
          <Card className="border-[#1E293B] bg-[#0E1424]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#6366F1]" />
                Investigation Queue & Inference Workload
              </CardTitle>
              <CardDescription>
                Real-time queue load and completed multimodal analysis jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[#080D18] border border-[#1E293B]">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                    Active In-Flight
                  </div>
                  <p className="text-3xl font-extrabold font-mono text-white">
                    {data.workload.active_investigations}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Pipelines executing</p>
                </div>

                <div className="p-4 rounded-lg bg-[#080D18] border border-[#1E293B]">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Queued / Pending
                  </div>
                  <p className="text-3xl font-extrabold font-mono text-white">
                    {data.workload.queued_investigations}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Awaiting worker thread</p>
                </div>

                <div className="p-4 rounded-lg bg-[#080D18] border border-[#1E293B]">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                    Completed Cases
                  </div>
                  <p className="text-3xl font-extrabold font-mono text-[#22C55E]">
                    {data.workload.completed_investigations}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Verified with full report</p>
                </div>

                <div className="p-4 rounded-lg bg-[#080D18] border border-[#1E293B]">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-[#6366F1]" />
                    Total Throughput
                  </div>
                  <p className="text-3xl font-extrabold font-mono text-white">
                    {data.workload.total_processed}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Processed media assets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Maintenance & Retention Policy */}
          <Card className="border-[#1E293B] bg-[#0E1424]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-[#EF4444]" />
                  Storage Retention Policy & Orphan Frame Purge
                </CardTitle>
                <CardDescription>
                  Reclaim storage volume by pruning cached video frame crops older than 14 days and orphaned assets
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCleanup(true)}
                  disabled={cleaning}
                  loading={cleaning}
                >
                  Dry-Run Preview
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleCleanup(false)}
                  disabled={cleaning}
                  loading={cleaning}
                >
                  Execute Cleanup
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cleanupResult && (
                <div className="p-3.5 rounded-lg bg-[#080D18] border border-[#1E293B] text-xs font-mono space-y-1 text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    <span>Mode: {cleanupResult.dry_run ? 'DRY-RUN SIMULATION' : 'LIVE RETENTION EXECUTION'}</span>
                  </div>
                  <p>
                    Files Evaluated / Deleted: <strong className="text-white">{cleanupResult.files_deleted}</strong> •
                    Storage Freed: <strong className="text-[#06B6D4]">{(cleanupResult.bytes_freed / (1024 * 1024)).toFixed(2)} MB</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};
