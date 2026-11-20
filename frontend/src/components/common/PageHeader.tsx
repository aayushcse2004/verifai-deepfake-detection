import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  breadcrumbs,
  actions,
  badge,
  className = '',
}) => {
  return (
    <div className={`space-y-3 pb-6 border-b border-[#1E293B] ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          {icon && (
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#6366F1]/20 to-[#06B6D4]/20 border border-[#6366F1]/30 text-[#06B6D4] shrink-0 mt-0.5 sm:mt-0">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{title}</h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
};
