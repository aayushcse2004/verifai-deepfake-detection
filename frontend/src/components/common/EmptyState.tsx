import React from 'react';
import { FileSearch } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  action,
  className = '',
}) => {
  return (
    <div className={`py-16 px-4 text-center rounded-xl border border-dashed border-[#1E293B] bg-[#0A0F1D]/40 flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1E293B] text-[#64748B]">
        {icon || <FileSearch className="w-8 h-8 text-[#64748B]" />}
      </div>
      <div className="max-w-md space-y-1">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-[#94A3B8]">{description}</p>
      </div>
      {action ? (
        <div className="mt-2">{action}</div>
      ) : actionLabel && onAction ? (
        <Button size="sm" variant="secondary" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
