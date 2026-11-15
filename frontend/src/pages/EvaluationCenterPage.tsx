import React, { useEffect, useState } from 'react';
import {
  Award,
  Database,
  BarChart3,
  TrendingUp,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getEvaluationBenchmarks } from '../services/api';
import { BenchmarkDataset } from '../types';

export const EvaluationCenterPage: React.FC = () => {
  const [datasets, setDatasets] = useState<BenchmarkDataset[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('ff_plus_plus');

  useEffect(() => {
    getEvaluationBenchmarks()
      .then((data) => {
        setDatasets(data.datasets);
        setSummary(data.summary);
      })
      .catch((err) => console.error('Failed to load benchmarks:', err))
      .finally(() => setLoading(false));
  }, []);

  const selected = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Model Evaluation & Benchmark Center</h1>
            <p className="text-sm text-[#94A3B8]">
              Empirical and published benchmark evaluations across standard academic forensic datasets
            </p>
          </div>
        </div>
      </div>

      {/* Academic Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#6366F1]/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#6366F1] shrink-0 mt-0.5" />
        <div className="text-xs text-[#94A3B8] space-y-1">
          <p className="font-semibold text-white">Scientific Evaluation Standards & Integrity Disclosure</p>
          <p>
            Metrics displayed below are referenced from published academic peer-reviewed benchmarks under standard compression (c23/c40).
            VerifAI strictly distinguishes published benchmarks from local runtime metrics to prevent misleading synthetic accuracy claims.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <p className="text-sm font-mono text-[#94A3B8]">Loading academic benchmark metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Dataset List */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] px-1">
              Evaluated Benchmark Datasets
            </h2>

            {datasets.map((dataset) => {
              const isSelected = dataset.id === selectedDatasetId;
              return (
                <button
                  key={dataset.id}
                  onClick={() => setSelectedDatasetId(dataset.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#6366F1]/10 border-[#6366F1] shadow-lg shadow-[#6366F1]/10'
                      : 'bg-[#111827] border-[#1E293B] hover:border-[#64748B] text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {dataset.dataset_name}
                    </p>
                    <p className="text-[11px] font-mono text-[#94A3B8]">{dataset.modality}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080D18] text-[#06B6D4] border border-[#1E293B]">
                        AUC: {dataset.metrics.roc_auc.toFixed(3)}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080D18] text-[#22C55E] border border-[#1E293B]">
                        F1: {(dataset.metrics.f1_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#6366F1]' : 'text-[#64748B]'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Dataset Metrics & Confusion Matrix */}
          {selected && (
            <div className="lg:col-span-2 space-y-6">
              {/* Dataset Header Card */}
              <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E293B] pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selected.dataset_name}</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">{selected.source} • {selected.license}</p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] self-start sm:self-auto">
                    {selected.metric_type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Primary Metric Gauges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-lg bg-[#080D18] border border-[#1E293B]">
                    <span className="text-xs text-[#94A3B8]">Accuracy</span>
                    <p className="text-2xl font-extrabold font-mono text-[#22C55E] mt-1">
                      {(selected.metrics.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#080D18] border border-[#1E293B]">
                    <span className="text-xs text-[#94A3B8]">F1-Score</span>
                    <p className="text-2xl font-extrabold font-mono text-[#6366F1] mt-1">
                      {(selected.metrics.f1_score * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#080D18] border border-[#1E293B]">
                    <span className="text-xs text-[#94A3B8]">ROC-AUC</span>
                    <p className="text-2xl font-extrabold font-mono text-[#06B6D4] mt-1">
                      {selected.metrics.roc_auc.toFixed(3)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#080D18] border border-[#1E293B]">
                    <span className="text-xs text-[#94A3B8]">Recall / Sensitivity</span>
                    <p className="text-2xl font-extrabold font-mono text-[#F59E0B] mt-1">
                      {(selected.metrics.recall * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Confusion Matrix */}
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#6366F1]" />
                    Empirical 2x2 Confusion Matrix
                  </h4>

                  <div className="grid grid-cols-2 gap-3 max-w-md font-mono text-center">
                    <div className="p-4 rounded-lg bg-[#080D18] border border-[#22C55E]/30">
                      <span className="text-xs text-[#94A3B8] block">True Positive (TP)</span>
                      <span className="text-xl font-bold text-[#22C55E]">
                        {selected.metrics.confusion_matrix.true_positive.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Synthetic Correctly Detected</span>
                    </div>

                    <div className="p-4 rounded-lg bg-[#080D18] border border-[#EF4444]/30">
                      <span className="text-xs text-[#94A3B8] block">False Positive (FP)</span>
                      <span className="text-xl font-bold text-[#EF4444]">
                        {selected.metrics.confusion_matrix.false_positive.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Genuine Flagged as Fake</span>
                    </div>

                    <div className="p-4 rounded-lg bg-[#080D18] border border-[#EF4444]/30">
                      <span className="text-xs text-[#94A3B8] block">False Negative (FN)</span>
                      <span className="text-xl font-bold text-[#EF4444]">
                        {selected.metrics.confusion_matrix.false_negative.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Synthetic Missed</span>
                    </div>

                    <div className="p-4 rounded-lg bg-[#080D18] border border-[#22C55E]/30">
                      <span className="text-xs text-[#94A3B8] block">True Negative (TN)</span>
                      <span className="text-xl font-bold text-[#22C55E]">
                        {selected.metrics.confusion_matrix.true_negative.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Genuine Correctly Cleared</span>
                    </div>
                  </div>
                </div>

                {/* Hardware Footprint */}
                <div className="pt-4 border-t border-[#1E293B] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#080D18] border border-[#1E293B]">
                    <Clock className="w-4 h-4 text-[#06B6D4]" />
                    <span className="text-[#94A3B8]">Inference Latency:</span>
                    <span className="text-white font-bold">{selected.metrics.avg_latency_ms} ms / frame</span>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#080D18] border border-[#1E293B]">
                    <Cpu className="w-4 h-4 text-[#6366F1]" />
                    <span className="text-[#94A3B8]">Peak VRAM Allocation:</span>
                    <span className="text-white font-bold">{selected.metrics.peak_vram_mb} MB</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="p-3 rounded-lg bg-[#080D18] border border-[#1E293B] text-xs text-[#94A3B8]">
                  <span className="font-semibold text-white block mb-0.5">Protocol Details & Context:</span>
                  <p>{selected.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

