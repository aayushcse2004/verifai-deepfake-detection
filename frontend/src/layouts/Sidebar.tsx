import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Terminal,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const location = useLocation();

  const navigationSections = [
    {
      title: 'WORKSPACE',
      items: [
        { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard, badge: 'Live' },
        { to: '/upload', label: 'New Investigation', icon: UploadCloud },
        { to: '/history', label: 'Investigation History', icon: History },
      ],
    },
    {
      title: 'FORENSIC LABORATORY',
      items: [
        { to: '/lab/video', label: 'Video Forensics', icon: Video },
        { to: '/lab/audio', label: 'Audio Forensics', icon: Volume2 },
        { to: '/lab/sync', label: 'AV Synchronization', icon: Link2 },
        { to: '/lab/compare', label: 'Media Comparison', icon: GitCompare },
        { to: '/evidence', label: 'Evidence Explorer', icon: FileSearch },
      ],
    },
    {
      title: 'AI INTELLIGENCE',
      items: [
        { to: '/models', label: 'Model Registry', icon: Layers },
        { to: '/evaluation', label: 'Model Evaluation', icon: Award },
        { to: '/system', label: 'GPU & System Monitor', icon: Cpu, badge: 'CUDA' },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { to: '/reports', label: 'Forensic Reports', icon: FileText },
        { to: '/audit', label: 'Chain of Custody', icon: Lock },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#070A13] border-r border-[#1E293B] flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-[#1E293B] justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden" onClick={onMobileClose}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] flex items-center justify-center shrink-0 shadow-lg shadow-[#6366F1]/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1 font-bold text-lg tracking-tight text-white leading-none">
                  <span>Verif</span>
                  <span className="text-[#06B6D4]">AI</span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#64748B] block mt-1">
                  Digital Forensics
                </span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navigationSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed ? (
                <span className="px-3 text-[10px] font-mono tracking-wider text-[#64748B] font-semibold uppercase block mb-1.5">
                  {section.title}
                </span>
              ) : (
                <div className="h-px bg-[#1E293B] my-2 mx-2" />
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-[#6366F1]/20 to-[#06B6D4]/10 text-white border-l-2 border-[#06B6D4] font-semibold'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1424]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#06B6D4]' : 'text-[#64748B] group-hover:text-slate-300'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Hardware Status & Collapse Toggle */}
        <div className="p-3 border-t border-[#1E293B] bg-[#05080F]/60 flex items-center justify-between gap-2">
          {!collapsed ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-mono font-semibold text-white truncate">CUDA 12.1 Ready</p>
                <p className="text-[9px] text-[#64748B] truncate">NVIDIA GTX 1650</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto" title="CUDA Accelerated">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] block animate-pulse" />
            </div>
          )}

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
