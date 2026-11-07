import React from 'react';
import { CheckCircle2, AlertCircle, Wrench, Slash } from 'lucide-react';

interface ModelStatusBadgeProps {
  mode: string;
  status?: string;
}

export const ModelStatusBadge: React.FC<ModelStatusBadgeProps> = ({ mode, status }) => {
  if (status === 'UNAVAILABLE' || mode === 'unavailable') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
        <Slash className="w-3 h-3 text-slate-400" />
        Unavailable
      </span>
    );
  }

  if (mode === 'active_model') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/30">
        <CheckCircle2 className="w-3 h-3 text-[#6366F1]" />
        Neural Model
      </span>
    );
  }

  if (mode === 'baseline_heuristic') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30">
        <Wrench className="w-3 h-3 text-[#06B6D4]" />
        CV / Acoustic Baseline
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
      <AlertCircle className="w-3 h-3 text-amber-400" />
      Simulated Adapter
    </span>
  );
};

