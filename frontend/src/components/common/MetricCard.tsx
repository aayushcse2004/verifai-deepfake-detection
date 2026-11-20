import React from 'react';
import { Card } from './Card';

export interface MetricCardProps {
  label?: string;
  title?: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'cyan';
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'cyan';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor,
  color,
  className = '',
}) => {
  const effectiveLabel = label || title || '';
  const effectiveColor = accentColor || color || 'primary';
  const iconBgs: Record<string, string> = {
    primary: 'bg-[#6366F1]/10 text-[#818CF8] border-[#6366F1]/20',
    accent: 'bg-[#06B6D4]/10 text-[#22D3EE] border-[#06B6D4]/20',
    cyan: 'bg-[#06B6D4]/10 text-[#22D3EE] border-[#06B6D4]/20',
    success: 'bg-[#22C55E]/10 text-[#4ADE80] border-[#22C55E]/20',
    warning: 'bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/20',
    danger: 'bg-[#EF4444]/10 text-[#F87171] border-[#EF4444]/20',
  };

  const valColors: Record<string, string> = {
    primary: 'text-white',
    accent: 'text-[#22D3EE]',
    cyan: 'text-[#22D3EE]',
    success: 'text-[#4ADE80]',
    warning: 'text-[#FBBF24]',
    danger: 'text-[#F87171]',
  };

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-[#94A3B8] block mb-1">
            {effectiveLabel}
          </span>
          <p className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${valColors[effectiveColor] || 'text-white'}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-[#64748B] mt-1 line-clamp-1">{subtitle}</p>
          )}
          {trend && (
            <span
              className={`inline-block text-[10px] font-mono mt-1 ${
                trend.isPositive ? 'text-[#4ADE80]' : 'text-[#F87171]'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl border shrink-0 ${iconBgs[effectiveColor] || iconBgs.primary}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
