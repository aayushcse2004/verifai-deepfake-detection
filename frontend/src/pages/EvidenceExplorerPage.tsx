import React, { useEffect, useState } from 'react';
import {
  FileSearch,
  Filter,
  Search,
  Download,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { getAnalysisResults, getAnalysisHistory } from '../services/api';
import { ForensicResult, AnalysisJob, EvidenceItem } from '../types';

export const EvidenceExplorerPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisJob[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [minScore, setMinScore] = useState<number>(0.0);
  const [search, setSearch] = useState<string>('');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  useEffect(() => {
    getAnalysisHistory(50)
      .then((jobs) => {
        const completed = jobs.filter((j) => j.status === 'COMPLETED');
        setHistory(completed);
        if (completed.length > 0) {
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

  const items = result?.evidence_items || [];
  const filtered = items.filter((item) => {
    if (typeFilter && !item.evidence_type.includes(typeFilter)) return false;
    if (item.score < minScore) return false;
    if (search && !item.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExportJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VerifAI_Evidence_${selectedId.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Forensic Evidence Explorer</h1>
              <p className="text-sm text-[#94A3B8]">
                Multimodal evidentiary anomaly ledger, spatial keyframes, and explainable AI confidence scores
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={handleExportJSON}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-xs font-mono text-[#06B6D4] hover:bg-white/5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#111827] p-4 rounded-xl border border-[#1E293B]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-[#080D18] border border-[#1E293B] rounded-lg text-white focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full text-xs font-mono bg-[#080D18] border border-[#1E293B] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#6366F1]"
          >
            <option value="">All Forensic Modalities</option>
            <option value="facial">Facial Manipulation (CNN / FFT)</option>
            <option value="lip_sync">Lip-Sync Desynchronization (SyncNet)</option>
            <option value="audio">Acoustic / Spectral Discontinuity</option>
            <option value="speaker">Active Speaker Mismatch (TalkNet)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#94A3B8]">
          <span>Min Score: {minScore.toFixed(2)}</span>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={minScore}
            onChange={(e) => setMinScore(parseFloat(e.target.value))}
            className="flex-1 accent-[#6366F1] cursor-pointer"
          />
        </div>
      </div>

      {/* Main Evidence Content Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <p className="text-sm font-mono text-[#94A3B8]">Loading evidence items...</p>
        </div>
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Evidence Table (2 Cols) */}
          <div className="lg:col-span-2 bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#080D18]/80 text-[#94A3B8] font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Time (s)</th>
                    <th className="py-3 px-4">Modality Type</th>
                    <th className="py-3 px-4">Severity Score</th>
                    <th className="py-3 px-4">Forensic Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-mono">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#94A3B8]">
                        No evidence items match the specified filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedEvidence(item)}
                        className={`hover:bg-white/[0.04] cursor-pointer transition-colors ${
                          selectedEvidence === item ? 'bg-[#6366F1]/10 border-l-2 border-[#6366F1]' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-[#06B6D4] whitespace-nowrap font-bold">
                          {item.timestamp.toFixed(2)}s
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E293B] text-slate-300 border border-white/5">
                            {item.evidence_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.score > 0.65
                              ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                              : item.score > 0.4
                              ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                              : 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                          }`}>
                            {item.score.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-sans truncate max-w-sm" title={item.description}>
                          {item.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Explainable AI Finding Inspector (Right Col) */}
          <div className="space-y-6">
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-[#6366F1]" />
                Explainable AI Anomaly Breakdown
              </h3>

              {selectedEvidence ? (
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-3.5 rounded-lg bg-[#080D18] border border-[#1E293B] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#94A3B8]">Timestamp Ref:</span>
                      <span className="text-[#06B6D4] font-bold text-sm">{selectedEvidence.timestamp.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#94A3B8]">Anomaly Type:</span>
                      <span className="text-white font-bold">{selectedEvidence.evidence_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#94A3B8]">Calibrated Score:</span>
                      <span className="text-[#EF4444] font-bold">{selectedEvidence.score.toFixed(3)} / 1.000</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#64748B] block">Observation Narrative:</span>
                    <p className="text-slate-200 font-sans text-xs bg-[#080D18] p-3 rounded-lg border border-[#1E293B]">
                      {selectedEvidence.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#64748B] block">Forensic Context & Limits:</span>
                    <p className="text-[11px] text-[#94A3B8] font-sans">
                      This indicator reflects signal residual deviation. High scores denote spatial or temporal discontinuity,
                      which may stem from compression artifacts, fast camera movement, or synthetic blending.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#94A3B8] italic py-8 text-center">
                  Select an evidence item from the table to inspect explainable AI details.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

