import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Upload,
  Activity,
  History,
  Settings,
  Home,
  AlertCircle,
  Video,
  Volume2,
  Link2,
  GitCompare,
  FileSearch,
  Layers,
  Award,
  Server,
  FileText,
  Lock,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { getSystemHealth } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSystemHealth()
      .then((data) => setIsOnline(data.status === 'online'))
      .catch(() => setIsOnline(false));
  }, []);

  // Close dropdown on outside click or route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navSections = [
    {
      id: 'workspace',
      title: 'Workspace',
      items: [
        { to: '/dashboard', label: 'Command Center', icon: Activity, desc: 'Executive forensic metrics & alerts' },
        { to: '/upload', label: 'New Investigation', icon: Upload, desc: 'Upload video, audio, or static image' },
        { to: '/history', label: 'Investigation History', icon: History, desc: 'Filter, review & resume prior cases' },
      ],
    },
    {
      id: 'labs',
      title: 'Forensic Labs',
      items: [
        { to: '/lab/video', label: 'Video Forensics', icon: Video, desc: 'Frame-by-frame & spatial bbox lab' },
        { to: '/lab/audio', label: 'Audio Forensics', icon: Volume2, desc: 'Welch PSD & neural vocoder cutoff' },
        { to: '/lab/sync', label: 'AV Synchronization', icon: Link2, desc: 'SyncNet mouth motion vs audio energy' },
        { to: '/lab/compare', label: 'Media Comparison', icon: GitCompare, desc: 'Dual-asset diffing & pHash distance' },
        { to: '/evidence', label: 'Evidence Explorer', icon: FileSearch, desc: 'Filterable evidentiary findings ledger' },
      ],
    },
    {
      id: 'intelligence',
      title: 'AI Intelligence',
      items: [
        { to: '/models', label: 'Model Registry', icon: Layers, desc: 'Model zoo, checkpoints & diagnostics' },
        { to: '/evaluation', label: 'Evaluation Center', icon: Award, desc: 'Empirical academic benchmark metrics' },
        { to: '/system', label: 'System & GPU Monitor', icon: Server, desc: 'Live NVIDIA GPU & host CPU/RAM metrics' },
      ],
    },
    {
      id: 'management',
      title: 'Management',
      items: [
        { to: '/reports', label: 'Forensic Reports', icon: FileText, desc: 'Download cryptographically sealed PDFs' },
        { to: '/audit', label: 'Audit Trail & Custody', icon: Lock, desc: 'Append-only logs & SHA-256 verifier' },
        { to: '/settings', label: 'System Settings', icon: Settings, desc: 'Thresholds, weights & hardware config' },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080D18]/95 backdrop-blur-md border-b border-[#1E293B]" ref={navRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#6366F1]/20 group-hover:shadow-[#6366F1]/40 transition-all">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">Verif</span>
              <span className="font-extrabold text-xl tracking-tight text-[#06B6D4]">AI</span>
            </div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] -mt-1">Digital Forensics</p>
          </div>
        </Link>

        {/* Desktop Navigation Dropdowns */}
        <nav className="hidden lg:flex items-center gap-1">
          {navSections.map((section) => {
            const isOpen = openDropdown === section.id;
            const hasActiveRoute = section.items.some((item) => location.pathname.startsWith(item.to));

            return (
              <div key={section.id} className="relative">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : section.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                    hasActiveRoute
                      ? 'text-white bg-[#1E293B]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {section.title}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-[#111827] border border-[#1E293B] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.to;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setOpenDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-[#6366F1]/10 text-white'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-[#6366F1] text-white' : 'bg-[#080D18] text-[#06B6D4]'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-none mb-1">{item.label}</p>
                            <p className="text-[11px] text-[#94A3B8] leading-tight">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right CTA & Telemetry Indicator */}
        <div className="flex items-center gap-3">
          <Link
            to="/system"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-[#1E293B] text-xs font-mono hover:border-[#6366F1]/40 transition-colors"
            title="System & GPU Monitor"
          >
            {isOnline === null ? (
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
            ) : isOnline ? (
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            )}
            <span className="text-[#94A3B8]">
              {isOnline === null ? 'Checking...' : isOnline ? 'System Online (CUDA)' : 'Offline'}
            </span>
          </Link>

          <Link
            to="/upload"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:from-[#4F46E5] hover:to-[#0891B2] text-white text-xs font-bold shadow-md shadow-[#6366F1]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Case</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#111827] border border-[#1E293B] text-[#94A3B8] hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#080D18] border-b border-[#1E293B] p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.id} className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] px-2 block">
                {section.title}
              </span>
              <div className="grid grid-cols-1 gap-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        isActive ? 'bg-[#6366F1] text-white' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};
