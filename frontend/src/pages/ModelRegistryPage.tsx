import React, { useEffect, useState } from 'react';
import {
  Cpu,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCw,
  HardDrive,
  FileCode,
  Layers,
  Sparkles,
  Terminal,
  Zap,
  Info
} from 'lucide-react';
import { getModelRegistry, runModelTest } from '../services/api';
import { ModelRegistryItem } from '../types';

export const ModelRegistryPage: React.FC = () => {
  const [models, setModels] = useState<ModelRegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const fetchModels = async () => {
    try {
      const data = await getModelRegistry();
      setModels(data);
    } catch (err) {
      console.error('Failed to load model registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleRunDiagnostic = async (modelId: string) => {
    setTestingModelId(modelId);
    try {
      const res = await runModelTest(modelId);
      setTestResults((prev) => ({
        ...prev,
        [modelId]: res,
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [modelId]: {
          status: 'FAILED',
          latency_ms: 0,
          message: err?.response?.data?.detail || err?.message || 'Execution error',
        },
      }));
    } finally {
      setTestingModelId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">AI Model Registry & Diagnostics</h1>
              <p className="text-sm text-[#94A3B8]">
                Centralized forensic model inventory, checkpoint validation, and live diagnostic execution
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchModels}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-xs font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
        >
          <RotateCw className="w-4 h-4" />
          Refresh Registry
        </button>
      </div>

      {/* Model Cards Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <RotateCw className="w-8 h-8 text-[#6366F1] animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-[#94A3B8]">Loading model registry and probing checkpoint states...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((model) => {
            const isTesting = testingModelId === model.id;
            const testResult = testResults[model.id];

            return (
              <div
                key={model.id}
                className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 flex flex-col justify-between hover:border-[#6366F1]/40 transition-all shadow-lg"
              >
                <div>
                  {/* Top Bar: Type + Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono text-[#06B6D4] px-2 py-0.5 rounded bg-[#06B6D4]/10 border border-[#06B6D4]/20">
                      {model.type}
                    </span>

                    <span
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        model.loading_status.startsWith('Ready')
                          ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                          : model.loading_status.includes('Mock')
                          ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                          : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                      }`}
                    >
                      {model.loading_status.startsWith('Ready') ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {model.loading_status}
                    </span>
                  </div>

                  {/* Title & Version */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#6366F1] transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-xs font-mono text-[#94A3B8] mt-0.5">
                      v{model.version} • {model.license}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2.5 text-xs text-[#94A3B8] mb-5">
                    <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                      <span className="text-[#64748B]">Architecture / Source:</span>
                      <span className="font-medium text-white text-right max-w-[240px] truncate" title={model.source}>
                        {model.source}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                      <span className="text-[#64748B]">Checkpoint Storage:</span>
                      <span className="font-mono text-white flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-[#6366F1]" />
                        {model.checkpoint_file}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                      <span className="text-[#64748B]">Target Compute Device:</span>
                      <span className="font-mono text-[#22C55E] flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {model.device}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                      <span className="text-[#64748B]">Literature Accuracy:</span>
                      <span className="font-mono text-[#06B6D4] font-semibold">{model.benchmark_accuracy}</span>
                    </div>

                    <div className="py-1">
                      <span className="text-[#64748B] block mb-1">Supported Input Encodings:</span>
                      <div className="flex flex-wrap gap-1">
                        {model.supported_formats.map((fmt) => (
                          <span
                            key={fmt}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E293B] text-slate-300 border border-white/5"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="py-1">
                      <span className="text-[#64748B] block mb-1">Signal Preprocessing:</span>
                      <p className="text-[11px] text-[#94A3B8] bg-[#080D18] p-2 rounded border border-[#1E293B] font-mono">
                        {model.preprocessing}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Test Runner & Output */}
                <div className="pt-4 border-t border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleRunDiagnostic(model.id)}
                      disabled={isTesting}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#6366F1]/10 hover:bg-[#6366F1]/20 border border-[#6366F1]/30 text-[#6366F1] text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {isTesting ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          Executing Forward Pass...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Run Diagnostic Test
                        </>
                      )}
                    </button>

                    {testResult && (
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded border ${
                          testResult.status === 'PASSED'
                            ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                            : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                        }`}
                      >
                        {testResult.status} ({testResult.latency_ms} ms)
                      </span>
                    )}
                  </div>

                  {testResult && (
                    <div className="p-3 rounded-lg bg-[#080D18] border border-[#1E293B] text-[11px] font-mono text-[#94A3B8] space-y-1">
                      <div className="flex items-center gap-1.5 text-white">
                        <Terminal className="w-3.5 h-3.5 text-[#06B6D4]" />
                        <span>Diagnostic Output:</span>
                      </div>
                      <p className="text-slate-300">{testResult.message}</p>
                      {testResult.diagnostic_output && (
                        <pre className="text-[10px] text-[#06B6D4] overflow-x-auto p-1 bg-black/40 rounded">
                          {JSON.stringify(testResult.diagnostic_output, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

