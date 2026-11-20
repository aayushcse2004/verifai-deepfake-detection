import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  Activity,
  Upload,
  Cpu,
  Layers,
  Award,
  Video,
  Volume2,
  Link2,
  Lock,
  GitCompare,
  FileSearch,
  FileText,
  History,
  Settings,
  X
} from 'lucide-react';
import { getSystemHealth } from '../services/api';
import { Button } from '../components/common/Button';

interface TopNavProps {
  onMobileOpen: () => void;
  onOpenCommand: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMobileOpen, onOpenCommand }) => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const start = performance.now();
      try {
        const res = await getSystemHealth();
        const end = performance.now();
        setIsOnline(res.status === 'online');
        setLatency(Math.round(end - start));
      } catch {
        setIsOnline(false);
        setLatency(null);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#070A13]/90 backdrop-blur-md border-b border-[#1E293B] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileOpen}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search / Command Bar Trigger */}
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#0E1424] hover:bg-[#131B2E] border border-[#1E293B] text-xs text-[#94A3B8] transition-all group w-48 sm:w-72 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#64748B] group-hover:text-slate-200" />
            <span className="truncate">Search investigations, models...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#1E293B] text-[#94A3B8] border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right System Bar */}
      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status Pill */}
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
            isOnline === true
              ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#4ADE80]'
              : isOnline === false
              ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#F87171]'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title={latency ? `API response latency: ${latency}ms` : undefined}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-[#4ADE80] animate-pulse' : 'bg-[#F87171]'
            }`}
          />
          <span className="text-[11px] font-semibold">
            {isOnline === true ? 'SYSTEM ONLINE' : isOnline === false ? 'OFFLINE' : 'CHECKING...'}
          </span>
          {latency && <span className="text-[10px] opacity-75 hidden sm:inline">({latency}ms)</span>}
        </div>

        {/* Quick Upload Action Button */}
        <Button
          size="sm"
          variant="accent"
          onClick={() => navigate('/upload')}
          leftIcon={<Upload className="w-3.5 h-3.5" />}
          className="hidden sm:inline-flex"
        >
          New Investigation
        </Button>
      </div>
    </header>
  );
};
