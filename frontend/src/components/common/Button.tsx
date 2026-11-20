import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const effectiveLoading = isLoading || loading;
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080D18] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-md shadow-[#6366F1]/20 focus:ring-[#6366F1]',
    secondary: 'bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] focus:ring-[#64748B]',
    accent: 'bg-gradient-to-r from-[#06B6D4] to-[#0EA5E9] hover:from-[#0891B2] hover:to-[#0284C7] text-black font-semibold shadow-md shadow-[#06B6D4]/20 focus:ring-[#06B6D4]',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-md shadow-[#EF4444]/20 focus:ring-[#EF4444]',
    outline: 'bg-transparent hover:bg-[#1E293B]/60 text-slate-200 border border-[#334155] focus:ring-[#6366F1]',
    ghost: 'bg-transparent hover:bg-[#1E293B]/40 text-slate-300 hover:text-white focus:ring-[#6366F1]',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs gap-1.5',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || effectiveLoading}
      {...props}
    >
      {effectiveLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!effectiveLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
