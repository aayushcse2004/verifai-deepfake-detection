import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center gap-1.5 text-xs text-[#64748B] font-mono ${className}`} aria-label="Breadcrumb">
      <Link to="/dashboard" className="hover:text-slate-200 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const targetPath = item.to || item.href;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-[#334155] shrink-0" />
            {isLast || !targetPath ? (
              <span className="text-[#94A3B8] font-medium truncate max-w-[200px]">{item.label}</span>
            ) : (
              <Link to={targetPath} className="hover:text-slate-200 transition-colors truncate max-w-[150px]">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
