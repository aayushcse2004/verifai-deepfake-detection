import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export interface RiskBadgeProps {
  assessment?: string;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ assessment, status, size = 'sm' }) => {
  const value = assessment || status || 'UNKNOWN';

  let colorStyles = 'bg-[#22C55E]/10 text-[#4ADE80] border-[#22C55E]/30';
  let Icon = ShieldCheck;

  if (value === 'POTENTIAL MANIPULATION DETECTED' || value === 'FAILED') {
    colorStyles = 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]';
    Icon = ShieldAlert;
  } else if (value === 'INCONCLUSIVE' || value === 'PROCESSING' || value === 'PENDING') {
    colorStyles = 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30';
    Icon = value === 'INCONCLUSIVE' ? AlertTriangle : Clock;
  } else if (value === 'COMPLETED' || value === 'LOW EVIDENCE OF MANIPULATION') {
    colorStyles = 'bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/30';
    Icon = CheckCircle2;
  }

  const sizeClasses = {
    sm: 'text-[11px] font-mono px-2.5 py-0.5 gap-1.5',
    md: 'text-xs font-mono px-3 py-1 gap-2 font-medium',
    lg: 'text-sm font-mono px-4 py-2 gap-2.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${colorStyles} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{value}</span>
    </span>
  );
};
