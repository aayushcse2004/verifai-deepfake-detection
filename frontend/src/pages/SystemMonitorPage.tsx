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
  Server
} from 'lucide-react';
import { getSystemMonitor } from '../services/api';
import { SystemMonitorData } from '../types';

export const SystemMonitorPage: React.FC = () => {
  const [data, setData] = useState<SystemMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(3000);
  const [lastUpdated, setLastUpdated] = useState<string>('');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">System & Hardware Telemetry</h1>
              <p className="text-sm text-[#94A3B8]">
                Real-time GPU acceleration, host CPU/RAM metrics, and investigation queue status
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1E293B] px-3 py-1.5 rounded-lg text-xs font-mono text-[#94A3B8]">
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-[#22C55E] animate-pulse' : 'text-slate-500'}`} />
            <span>Updated: {lastUpdated || 'Polling...'}</span>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoRefresh
                ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                : 'bg-[#111827] border-[#1E293B] text-[#94A3B8] hover:text-white'
            }`}
          >
            {autoRefresh ? 'Auto-Polling ON' : 'Auto-Polling OFF'}
          </button>

          <button
            onClick={fetchMetrics}
            className="p-2 rounded-lg bg-[#111827] border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-[#6366F1] animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-[#94A3B8]">Polling hardware metrics from host agent...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Hardware Primary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* GPU Card */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#06B6D4]/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">NVIDIA GPU</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  data.gpu.available
                    ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {data.gpu.available ? 'CUDA ACTIVE' : 'CPU FALLBACK'}
                </span>
              </div>
              <p className="text-lg font-bold text-white truncate mb-1">{data.gpu.name}</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-extrabold font-mono text-[#06B6D4]">{data.gpu.utilization_pct}%</span>
                <span className="text-xs text-[#94A3B8]">Compute Load</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>VRAM Allocated:</span>
                  <span className="font-mono text-white">
                    {data.gpu.memory_used_mb.toFixed(0)} / {data.gpu.memory_total_mb.toFixed(0)} MB ({data.gpu.memory_usage_pct}%)
                  </span>
                </div>
                <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#06B6D4] to-[#6366F1] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, data.gpu.memory_usage_pct)}%` }}
                  />
                </div>
                {data.gpu.temperature_c > 0 && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1 text-[11px] text-[#F59E0B]">
                      <Flame className="w-3 h-3" /> Core Temp:
                    </span>
                    <span className="font-mono text-white text-[11px]">{data.gpu.temperature_c}°C</span>
                  </div>
                )}
              </div>
            </div>

            {/* CPU Card */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Host CPU</span>
                <Cpu className="w-4 h-4 text-[#6366F1]" />
              </div>
              <p className="text-lg font-bold text-white mb-1">
                {data.cpu.cores_physical} Cores ({data.cpu.cores_logical} Threads)
              </p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-extrabold font-mono text-[#6366F1]">{data.cpu.utilization_pct}%</span>
                <span className="text-xs text-[#94A3B8]">CPU Utilization</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#94A3B8]">
                <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#6366F1] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, data.cpu.utilization_pct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">Background worker threadpool load</p>
              </div>
            </div>

            {/* RAM Card */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">System RAM</span>
                <Activity className="w-4 h-4 text-[#22C55E]" />
              </div>
              <p className="text-lg font-bold text-white mb-1">
                {data.memory.used_gb} / {data.memory.total_gb} GB
              </p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-extrabold font-mono text-[#22C55E]">{data.memory.utilization_pct}%</span>
                <span className="text-xs text-[#94A3B8]">Memory Footprint</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#94A3B8]">
                <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#22C55E] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, data.memory.utilization_pct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">Includes model caches and frame buffers</p>
              </div>
            </div>

            {/* Storage Card */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Storage Volume</span>
                <HardDrive className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <p className="text-lg font-bold text-white mb-1">
                {data.disk.free_gb} GB Free
              </p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-extrabold font-mono text-[#F59E0B]">{data.disk.utilization_pct}%</span>
                <span className="text-xs text-[#94A3B8]">Disk Used</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#94A3B8]">
                <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#F59E0B] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, data.disk.utilization_pct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#64748B] truncate" title={data.disk.storage_path}>
                  Path: {data.disk.storage_path}
                </p>
              </div>
            </div>
          </div>

          {/* Workload Queue & Investigation Pipeline Status */}
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#6366F1]" />
              Investigation Queue & Inference Workload
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-[#080D18] border border-[#1E293B]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                  Active In-Flight
                </div>
                <p className="text-3xl font-extrabold font-mono text-white">
                  {data.workload.active_investigations}
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">Pipelines executing</p>
              </div>

              <div className="p-4 rounded-lg bg-[#080D18] border border-[#1E293B]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Queued / Pending
                </div>
                <p className="text-3xl font-extrabold font-mono text-white">
                  {data.workload.queued_investigations}
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">Awaiting worker thread</p>
              </div>

              <div className="p-4 rounded-lg bg-[#080D18] border border-[#1E293B]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                  Completed Cases
                </div>
                <p className="text-3xl font-extrabold font-mono text-[#22C55E]">
                  {data.workload.completed_investigations}
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">Verified with full report</p>
              </div>

              <div className="p-4 rounded-lg bg-[#080D18] border border-[#1E293B]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-1">
                  <Gauge className="w-3.5 h-3.5 text-[#6366F1]" />
                  Total Throughput
                </div>
                <p className="text-3xl font-extrabold font-mono text-white">
                  {data.workload.total_processed}
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">Processed media assets</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

