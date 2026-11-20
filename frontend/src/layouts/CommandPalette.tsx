import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  UploadCloud,
  History,
  Video,
  Volume2,
  Link2,
  GitCompare,
  FileSearch,
  Layers,
  Award,
  Cpu,
  FileText,
  Lock,
  Settings,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { label: 'Command Center', to: '/dashboard', icon: LayoutDashboard, category: 'Workspace' },
    { label: 'New Investigation (Upload Media)', to: '/upload', icon: UploadCloud, category: 'Workspace' },
    { label: 'Investigation History', to: '/history', icon: History, category: 'Workspace' },
    { label: 'Video Forensics Lab', to: '/lab/video', icon: Video, category: 'Forensic Lab' },
    { label: 'Audio Forensics Lab', to: '/lab/audio', icon: Volume2, category: 'Forensic Lab' },
    { label: 'Audio-Video Synchronization Lab', to: '/lab/sync', icon: Link2, category: 'Forensic Lab' },
    { label: 'Media Comparison Lab', to: '/lab/compare', icon: GitCompare, category: 'Forensic Lab' },
    { label: 'Evidence Explorer', to: '/evidence', icon: FileSearch, category: 'Forensic Lab' },
    { label: 'AI Model Registry & Diagnostics', to: '/models', icon: Layers, category: 'AI Intelligence' },
    { label: 'Model Evaluation Center', to: '/evaluation', icon: Award, category: 'AI Intelligence' },
    { label: 'GPU & System Telemetry Monitor', to: '/system', icon: Cpu, category: 'AI Intelligence' },
    { label: 'Forensic Reports Repository', to: '/reports', icon: FileText, category: 'Management' },
    { label: 'Cryptographic Chain of Custody Audit', to: '/audit', icon: Lock, category: 'Management' },
    { label: 'Platform & Analysis Settings', to: '/settings', icon: Settings, category: 'Management' },
  ];

  const filtered = quickLinks.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative bg-[#0E1424] border border-[#1E293B] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-[#1E293B] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#06B6D4] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search forensic workspaces, labs, models, reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-white text-sm placeholder-[#64748B]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-96 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#94A3B8]">
              No workspaces or tools matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.to);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#131B2E] text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#111827] border border-[#1E293B] group-hover:border-[#06B6D4]/40 text-[#94A3B8] group-hover:text-[#06B6D4] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="p-3 bg-[#0A0F1D]/80 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <span>Navigation Quick Jump</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
