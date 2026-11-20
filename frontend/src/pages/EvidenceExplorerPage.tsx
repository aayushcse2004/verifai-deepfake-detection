import React, { useEffect, useState } from 'react';
import {
  FileSearch,
  Search,
  Download,
  Info,
  ExternalLink,
} from 'lucide-react';
import { getAnalysisResults, getAnalysisHistory } from '../services/api';
import { ForensicResult, AnalysisJob, EvidenceItem } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';

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
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Forensic Laboratory' },
          { label: 'Evidence Explorer' },
        ]}
      />

      <PageHeader
        title="Forensic Evidence Explorer"
        subtitle="Multimodal evidentiary anomaly ledger, spatial keyframes, and explainable AI confidence scores"
        icon={<FileSearch className="w-5 h-5" />}
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

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              disabled={filtered.length === 0}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export JSON
            </Button>
          </div>
        }
      />

      {/* Filter Ribbon */}
      <Card className="border-[#1E293B] bg-[#0E1424]">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
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

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
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
        </CardContent>
      </Card>

      {/* Main Evidence Content Grid */}
      {loading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evidence Table (2 Columns) */}
          <Card className="lg:col-span-2 border-[#1E293B] bg-[#0E1424] overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#1E293B]">
              <CardTitle className="text-sm font-semibold">
                Detected Forensic Evidence Log ({filtered.length} Items)
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#080D18]/80 text-slate-400 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Time (s)</th>
                    <th className="py-3 px-4">Modality Type</th>
                    <th className="py-3 px-4">Severity Score</th>
                    <th className="py-3 px-4">Forensic Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-mono">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
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
                          <Badge variant="neutral">
                            {item.evidence_type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge
                            variant={
                              item.score > 0.65
                                ? 'danger'
                                : item.score > 0.4
                                ? 'warning'
                                : 'success'
                            }
                          >
                            {item.score.toFixed(2)}
                          </Badge>
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
          </Card>

          {/* Explainable AI Finding Inspector (Right Column) */}
          <div className="space-y-6">
            <Card className="border-[#1E293B] bg-[#0E1424]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#6366F1]" />
                  Explainable AI Anomaly Breakdown
                </CardTitle>
                <CardDescription>
                  Deep inspect the selected anomaly signal and calibration bounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEvidence ? (
                  <div className="space-y-4 text-xs font-mono">
                    <div className="p-3.5 rounded-lg bg-[#080D18] border border-[#1E293B] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Timestamp Ref:</span>
                        <span className="text-[#06B6D4] font-bold text-sm">
                          {selectedEvidence.timestamp.toFixed(2)}s
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Anomaly Type:</span>
                        <span className="text-white font-bold">{selectedEvidence.evidence_type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Calibrated Score:</span>
                        <span className="text-[#EF4444] font-bold">
                          {selectedEvidence.score.toFixed(3)} / 1.000
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 block">Observation Narrative:</span>
                      <p className="text-slate-200 font-sans text-xs bg-[#080D18] p-3 rounded-lg border border-[#1E293B]">
                        {selectedEvidence.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 block">Forensic Context & Limits:</span>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        This indicator reflects signal residual deviation. High scores denote spatial or temporal
                        discontinuity, which may stem from compression artifacts, rapid optical motion, or synthetic
                        generation blending.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-12 text-center">
                    Select an evidence item from the table to inspect explainable AI details.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<FileSearch className="w-8 h-8 text-slate-500" />}
          title="No Investigation Available"
          description="Complete an investigation to explore and inspect multimodal evidence items."
        />
      )}
    </div>
  );
};
