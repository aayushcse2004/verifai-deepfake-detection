import React, { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  Cpu,
  Clock,
  Info,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { getEvaluationBenchmarks } from '../services/api';
import { BenchmarkDataset } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';

export const EvaluationCenterPage: React.FC = () => {
  const [datasets, setDatasets] = useState<BenchmarkDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('ff_plus_plus');

  useEffect(() => {
    getEvaluationBenchmarks()
      .then((data) => {
        setDatasets(data.datasets);
      })
      .catch((err) => console.error('Failed to load benchmarks:', err))
      .finally(() => setLoading(false));
  }, []);

  const selected = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'AI Intelligence' },
          { label: 'Model Evaluation Center' },
        ]}
      />

      <PageHeader
        title="Model Evaluation & Benchmark Center"
        subtitle="Empirical and published benchmark evaluations across standard academic forensic datasets"
        icon={<Award className="w-5 h-5" />}
      />

      {/* Academic Disclaimer Callout */}
      <Card className="border-[#6366F1]/30 bg-[#0E1424]">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#6366F1] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-white">Scientific Evaluation Standards & Academic Integrity Disclosure</p>
            <p>
              Metrics displayed below are referenced from published academic peer-reviewed benchmarks under standard compression (c23/c40).
              VerifAI strictly distinguishes published benchmarks from local runtime metrics to prevent misleading synthetic accuracy claims.
            </p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="lg:col-span-2 h-96 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Dataset List */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1">
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
                      : 'bg-[#0E1424] border-[#1E293B] hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {dataset.dataset_name}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">{dataset.modality}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="cyan">AUC: {dataset.metrics.roc_auc.toFixed(3)}</Badge>
                      <Badge variant="success">F1: {(dataset.metrics.f1_score * 100).toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#6366F1]' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Dataset Metrics & Confusion Matrix */}
          {selected && (
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-[#1E293B] bg-[#0E1424]">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#1E293B]">
                  <div>
                    <CardTitle className="text-xl font-bold text-white">{selected.dataset_name}</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">
                      {selected.source} • {selected.license}
                    </CardDescription>
                  </div>
                  <Badge variant="cyan">
                    {selected.metric_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6 pt-5">
                  {/* Primary Metric Gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <MetricCard
                      title="Accuracy"
                      value={`${(selected.metrics.accuracy * 100).toFixed(1)}%`}
                      color="success"
                    />
                    <MetricCard
                      title="F1-Score"
                      value={`${(selected.metrics.f1_score * 100).toFixed(1)}%`}
                      color="accent"
                    />
                    <MetricCard
                      title="ROC-AUC"
                      value={selected.metrics.roc_auc.toFixed(3)}
                      color="cyan"
                    />
                    <MetricCard
                      title="Recall / Sensitivity"
                      value={`${(selected.metrics.recall * 100).toFixed(1)}%`}
                      color="warning"
                    />
                  </div>

                  {/* Confusion Matrix */}
                  <div className="pt-2">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#6366F1]" />
                      Empirical 2x2 Confusion Matrix
                    </h4>

                    <div className="grid grid-cols-2 gap-3 max-w-md font-mono text-center">
                      <div className="p-4 rounded-lg bg-[#080D18] border border-[#22C55E]/30">
                        <span className="text-xs text-slate-400 block">True Positive (TP)</span>
                        <span className="text-xl font-bold text-[#22C55E]">
                          {selected.metrics.confusion_matrix.true_positive.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Synthetic Correctly Detected</span>
                      </div>

                      <div className="p-4 rounded-lg bg-[#080D18] border border-[#EF4444]/30">
                        <span className="text-xs text-slate-400 block">False Positive (FP)</span>
                        <span className="text-xl font-bold text-[#EF4444]">
                          {selected.metrics.confusion_matrix.false_positive.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Genuine Flagged as Fake</span>
                      </div>

                      <div className="p-4 rounded-lg bg-[#080D18] border border-[#EF4444]/30">
                        <span className="text-xs text-slate-400 block">False Negative (FN)</span>
                        <span className="text-xl font-bold text-[#EF4444]">
                          {selected.metrics.confusion_matrix.false_negative.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Synthetic Missed</span>
                      </div>

                      <div className="p-4 rounded-lg bg-[#080D18] border border-[#22C55E]/30">
                        <span className="text-xs text-slate-400 block">True Negative (TN)</span>
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
                      <span className="text-slate-400">Inference Latency:</span>
                      <span className="text-white font-bold">{selected.metrics.avg_latency_ms} ms / frame</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#080D18] border border-[#1E293B]">
                      <Cpu className="w-4 h-4 text-[#6366F1]" />
                      <span className="text-slate-400">Peak VRAM Allocation:</span>
                      <span className="text-white font-bold">{selected.metrics.peak_vram_mb} MB</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="p-3 rounded-lg bg-[#080D18] border border-[#1E293B] text-xs text-slate-400">
                    <span className="font-semibold text-white block mb-0.5">Protocol Details & Context:</span>
                    <p>{selected.notes}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
