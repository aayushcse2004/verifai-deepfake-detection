import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { CommandPalette } from './CommandPalette';
import { ToastProvider } from '../components/common/ToastContext';
import { Footer } from '../components/Footer';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('verifai_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('verifai_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#080D18] text-[#F8FAFC] flex">
        {/* Collapsible Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleSidebar}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            collapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Top Bar */}
          <TopNav
            onMobileOpen={() => setMobileOpen(true)}
            onOpenCommand={() => setCommandOpen(true)}
          />

          {/* Page Body */}
          <main className="flex-1 bg-cyber-grid min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>

          {/* Footer */}
          <Footer />
        </div>

        {/* Command Palette */}
        <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      </div>
    </ToastProvider>
  );
};
