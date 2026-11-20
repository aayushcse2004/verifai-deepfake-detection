import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'cyan' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const base = 'inline-flex items-center font-mono font-medium rounded-full tracking-wide transition-colors';

  const variants = {
    primary: 'bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30',
    secondary: 'bg-[#1E293B] text-slate-300 border border-[#334155]',
    accent: 'bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30',
    cyan: 'bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30',
    success: 'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30',
    warning: 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30',
    danger: 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30',
    neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    outline: 'bg-transparent text-slate-400 border border-[#334155]',
  };

  const dotColors = {
    primary: 'bg-[#818CF8]',
    secondary: 'bg-slate-400',
    accent: 'bg-[#22D3EE]',
    cyan: 'bg-[#22D3EE]',
    success: 'bg-[#4ADE80]',
    warning: 'bg-[#FBBF24]',
    danger: 'bg-[#F87171]',
    neutral: 'bg-slate-400',
    outline: 'bg-slate-400',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-xs gap-2',
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
};
