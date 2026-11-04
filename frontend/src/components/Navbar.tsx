import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Upload, Activity, History, Settings, Home, AlertCircle } from 'lucide-react';
import { getSystemHealth } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    getSystemHealth()
      .then((data) => setIsOnline(data.status === 'online'))
      .catch(() => setIsOnline(false));
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: Activity },
    { to: '/upload', label: 'Upload Media', icon: Upload },
    { to: '/history', label: 'History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080D18]/90 backdrop-blur-md border-b border-[#1E293B]">
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
            <p className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] -mt-1">Media Forensics</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1E293B] text-white shadow-inner border border-white/5'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#06B6D4]' : ''}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Backend Status & Quick Action */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-[#1E293B] text-xs font-mono">
            {isOnline === null ? (
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
            ) : isOnline ? (
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            )}
            <span className="text-[#94A3B8]">
              {isOnline === null ? 'Connecting...' : isOnline ? 'System Online' : 'Offline'}
            </span>
          </div>

          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white text-sm font-semibold shadow-md shadow-[#6366F1]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Analyze Media</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
