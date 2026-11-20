import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 border-b border-[#1E293B] overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'border-[#06B6D4] text-[#06B6D4] font-semibold'
                : 'border-transparent text-[#94A3B8] hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-[#06B6D4]/20 text-[#06B6D4]' : 'bg-[#1E293B] text-[#94A3B8]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
