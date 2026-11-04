import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  assessment: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ assessment, size = 'md' }) => {
  let colorStyles = 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30';
  let Icon = ShieldCheck;

  if (assessment === 'POTENTIAL MANIPULATION DETECTED') {
    colorStyles = 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]';
    Icon = ShieldAlert;
  } else if (assessment === 'INCONCLUSIVE') {
    colorStyles = 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30';
    Icon = AlertTriangle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${colorStyles} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{assessment}</span>
    </span>
  );
};
