import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Upload,
  Video,
  Mic,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { getAnalysisHistory, getSystemHealth } from '../services/api';
import { AnalysisJob, SystemHealth } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ModelStatusBadge } from '../components/ModelStatusBadge';

export const Dashboard: React.FC = () => {
  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [histData, healthData] = await Promise.all([
        getAnalysisHistory(10),
        getSystemHealth(),
      ]);
      setHistory(histData);
      setHealth(healthData);
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

  // Compute metrics
  const totalAnalyses = history.length;
  const videosCount = history.filter((j) => j.media?.file_type === 'video').length;
  const audioCount = history.filter((j) => j.media?.file_type === 'audio').length;
  const suspiciousCount = history.filter(
    (j) => j.status === 'COMPLETED' // or based on result if expanded
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-[#06B6D4]" />
            Forensics Operations Dashboard
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Real-time multimodal telemetry, model health diagnostics, and recent media analyses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1E293B] hover:bg-[#1E293B] text-slate-300 text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
            Refresh
          </button>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#6366F1]/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            New Analysis
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Analyses',
            value: totalAnalyses,
            icon: Activity,
            color: 'text-[#6366F1]',
            bg: 'bg-[#6366F1]/10',
            border: 'border-[#6366F1]/20',
          },
          {
            label: 'Videos Analyzed',
            value: videosCount,
            icon: Video,
            color: 'text-[#06B6D4]',
            bg: 'bg-[#06B6D4]/10',
            border: 'border-[#06B6D4]/20',
          },
          {
            label: 'Audio Files Analyzed',
            value: audioCount,
            icon: Mic,
            color: 'text-[#22C55E]',
            bg: 'bg-[#22C55E]/10',
            border: 'border-[#22C55E]/20',
          },
          {
            label: 'System Status',
            value: health?.status === 'online' ? 'All Active' : 'Checking',
            icon: ShieldCheck,
            color: 'text-[#F59E0B]',
            bg: 'bg-[#F59E0B]/10',
            border: 'border-[#F59E0B]/20',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`bg-[#111827] border ${card.border} rounded-xl p-5 shadow-lg relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#94A3B8]">{card.label}</span>
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Model Health Indicators */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#6366F1]" />
              Model Health & Operational Engines
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Active hardware target: <span className="text-white font-mono uppercase">{health?.device || 'CPU'}</span> • Storage: <span className="text-white font-mono">{health?.storage || 'OK'}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {health?.models &&
            Object.entries(health.models).map(([key, model]) => (
              <div
                key={key}
                className="bg-[#080D18] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{model.name}</h4>
                    <p className="text-[11px] font-mono text-slate-400">Ver: {model.version}</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E]" />
                </div>
                <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Mode:</span>
                  <ModelStatusBadge mode={model.operational_mode} />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Analyses History Table */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#06B6D4]" />
              Recent Media Analyses
            </h3>
            <p className="text-xs text-[#94A3B8]">Recent execution jobs and verification records</p>
          </div>
          <Link
            to="/history"
            className="text-xs text-[#06B6D4] hover:underline flex items-center gap-1 font-medium"
          >
            View All History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-[#94A3B8] text-sm bg-[#080D18]/50 rounded-lg border border-dashed border-[#1E293B]">
            No analysis jobs recorded yet.{' '}
            <Link to="/upload" className="text-[#6366F1] underline font-medium ml-1">
              Upload your first media file
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-[#94A3B8] font-mono uppercase">
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                {history.map((job) => (
                  <tr key={job.id} className="hover:bg-[#1E293B]/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-white max-w-[200px] truncate">
                      {job.media?.original_filename || 'Media file'}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[11px]">
                      {job.media?.file_type === 'video' ? (
                        <span className="flex items-center gap-1 text-[#06B6D4]">
                          <Video className="w-3.5 h-3.5" /> Video
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#22C55E]">
                          <Mic className="w-3.5 h-3.5" /> Audio
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#94A3B8]">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          job.status === 'COMPLETED'
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                            : job.status === 'PROCESSING'
                            ? 'bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 animate-pulse'
                            : job.status === 'FAILED'
                            ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 bg-[#080D18] rounded-full h-2 overflow-hidden border border-[#1E293B]">
                        <div
                          className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] h-2 transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {job.status === 'COMPLETED' ? (
                        <Link
                          to={`/results/${job.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] font-semibold text-[11px] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Results
                        </Link>
                      ) : job.status === 'PROCESSING' ? (
                        <Link
                          to={`/processing/${job.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#06B6D4]/10 text-[#06B6D4] text-[11px] font-mono animate-pulse"
                        >
                          Tracking...
                        </Link>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

