import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message, duration = 4000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, addToast: showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-[#0E1B15] border-[#22C55E]/40 text-[#4ADE80]',
            warning: 'bg-[#1F1709] border-[#F59E0B]/40 text-[#FBBF24]',
            error: 'bg-[#1F0C0C] border-[#EF4444]/40 text-[#F87171]',
            info: 'bg-[#0B1527] border-[#06B6D4]/40 text-[#22D3EE]',
          };

          const icons = {
            success: <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22C55E]" />,
            warning: <AlertTriangle className="w-4 h-4 shrink-0 text-[#F59E0B]" />,
            error: <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />,
            info: <Info className="w-4 h-4 shrink-0 text-[#06B6D4]" />,
          };

          return (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl border shadow-xl flex items-start gap-3 pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${typeStyles[toast.type]}`}
            >
              {icons[toast.type]}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
