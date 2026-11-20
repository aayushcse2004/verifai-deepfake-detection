import React, { useEffect, useState } from 'react';
import {
  Layers,
  Cpu,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCw,
  HardDrive,
  Terminal,
} from 'lucide-react';
import { getModelRegistry, runModelTest } from '../services/api';
import { ModelRegistryItem } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';

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
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'AI Intelligence' },
          { label: 'Model Registry' },
        ]}
      />

      <PageHeader
        title="AI Model Registry & Diagnostics"
        subtitle="Centralized forensic model inventory, checkpoint validation, and live diagnostic execution"
        icon={<Layers className="w-5 h-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={fetchModels}>
            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh Registry
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((model) => {
            const isTesting = testingModelId === model.id;
            const testResult = testResults[model.id];

            return (
              <Card
                key={model.id}
                className="border-[#1E293B] bg-[#0E1424] flex flex-col justify-between hover:border-[#6366F1]/40 transition-all shadow-lg"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="cyan">{model.type}</Badge>
                      <Badge
                        variant={
                          model.loading_status.startsWith('Ready')
                            ? 'success'
                            : model.loading_status.includes('Mock')
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {model.loading_status}
                      </Badge>
                    </div>

                    <CardTitle className="text-lg font-bold text-white">
                      {model.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                      v{model.version} • {model.license}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2.5 text-xs text-slate-400">
                    <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                      <span className="text-slate-500">Architecture / Source:</span>
                      <span className="font-medium text-white text-right max-w-[240px] truncate" title={model.source}>
                        {model.source}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                      <span className="text-slate-500">Checkpoint Storage:</span>
                      <span className="font-mono text-white flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-[#6366F1]" />
                        {model.checkpoint_file}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                      <span className="text-slate-500">Target Compute Device:</span>
                      <span className="font-mono text-[#22C55E] flex items-center gap-1 font-semibold">
                        <Cpu className="w-3 h-3" />
                        {model.device}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                      <span className="text-slate-500">Literature Accuracy:</span>
                      <span className="font-mono text-[#06B6D4] font-semibold">{model.benchmark_accuracy}</span>
                    </div>

                    <div className="py-1">
                      <span className="text-slate-500 block mb-1">Supported Formats:</span>
                      <div className="flex flex-wrap gap-1">
                        {model.supported_formats.map((fmt) => (
                          <span
                            key={fmt}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111827] text-slate-300 border border-white/5"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="py-1">
                      <span className="text-slate-500 block mb-1">Signal Preprocessing:</span>
                      <p className="text-[11px] text-slate-400 bg-[#080D18] p-2 rounded border border-[#1E293B] font-mono">
                        {model.preprocessing}
                      </p>
                    </div>
                  </CardContent>
                </div>

                {/* Diagnostic Test Runner & Output */}
                <div className="p-6 pt-0 border-t border-[#1E293B] mt-4 space-y-3">
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRunDiagnostic(model.id)}
                      disabled={isTesting}
                      loading={isTesting}
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                      Run Diagnostic Test
                    </Button>

                    {testResult && (
                      <Badge variant={testResult.status === 'PASSED' ? 'success' : 'danger'}>
                        {testResult.status} ({testResult.latency_ms} ms)
                      </Badge>
                    )}
                  </div>

                  {testResult && (
                    <div className="p-3 rounded-lg bg-[#080D18] border border-[#1E293B] text-[11px] font-mono text-slate-400 space-y-1">
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
