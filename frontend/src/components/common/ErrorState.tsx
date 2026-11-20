import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Alert',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="p-3 rounded-full bg-[#EF4444]/20 text-[#F87171]">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="max-w-md space-y-1">
        <h4 className="text-sm font-bold text-white font-mono">{title}</h4>
        <p className="text-xs text-[#FCA5A5]">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="danger" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Operation
        </Button>
      )}
    </div>
  );
};
