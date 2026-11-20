import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'primary' | 'accent' | 'danger';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  ...props
}) => {
  const glowStyles = {
    none: '',
    primary: 'shadow-lg shadow-[#6366F1]/5 border-[#6366F1]/30',
    accent: 'shadow-lg shadow-[#06B6D4]/5 border-[#06B6D4]/30',
    danger: 'shadow-lg shadow-[#EF4444]/5 border-[#EF4444]/30',
  };

  return (
    <div
      className={`bg-[#0E1424] rounded-xl border border-[#1E293B] overflow-hidden ${glowStyles[glow]} ${
        interactive ? 'hover:border-[#334155] hover:bg-[#12192C] transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 border-b border-[#1E293B]/80 flex items-center justify-between gap-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-sm font-semibold text-white tracking-wide flex items-center gap-2 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-[#94A3B8] mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-4 bg-[#0A0F1D]/60 border-t border-[#1E293B]/80 flex items-center justify-between text-xs text-[#94A3B8] ${className}`} {...props}>
    {children}
  </div>
);
