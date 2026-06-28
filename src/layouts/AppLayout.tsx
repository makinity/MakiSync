'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function AppLayout({ children, title, description }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    const theme = localStorage.getItem('theme') ?? 'dark';
    setDarkMode(theme === 'dark');
    const saved2 = localStorage.getItem('sb-collapsed');
    if (saved2 === '1') setCollapsed(true);
  }, []);

  useEffect(() => {
    if (darkMode === null) return; // don't run until localStorage is read
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sb-collapsed', next ? '1' : '0');
  };

  const sidebarWidth = collapsed ? 68 : 280;

  return (
    <>
      <style>{`
        .admin-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 280px; padding: 1.5rem 1rem;
          background: linear-gradient(180deg, var(--admin-sidebar), rgba(8,14,22,0.98));
          border-right: 1px solid var(--admin-border);
          backdrop-filter: blur(16px);
          display: flex; flex-direction: column; gap: 1rem;
          overflow-y: auto; overflow-x: hidden;
          z-index: 1000;
          transition: width 0.2s ease, padding 0.2s ease;
        }
        :root[data-theme="light"] .admin-sidebar {
          background: linear-gradient(180deg, var(--admin-sidebar), rgba(240,244,255,0.98));
        }
        .admin-sidebar.sb-collapsed { width: 68px; padding: 1.5rem 0.5rem; }
        .admin-sidebar::-webkit-scrollbar { width: 4px; }
        .admin-sidebar::-webkit-scrollbar-track { background: transparent; }
        .admin-sidebar::-webkit-scrollbar-thumb { background: var(--admin-border); border-radius: 4px; }
        .sb-link {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.8rem 0.95rem; border-radius: 12px;
          color: var(--admin-text-secondary); text-decoration: none;
          font-size: 0.875rem; font-weight: 500;
          border: 1px solid transparent;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; overflow: hidden;
        }
        .sb-link:hover { background: rgba(59,130,246,0.08); color: var(--admin-text-primary); }
        .sb-link-active {
          background: rgba(59,130,246,0.12);
          border-color: rgba(59,130,246,0.22);
          color: var(--admin-accent);
        }
        .sb-collapsed .sb-link { padding: 0.8rem; justify-content: center; gap: 0; }
        .tb-root {
          position: sticky; top: 0; z-index: 900;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.45rem 1.25rem;
          background: rgba(10,15,26,0.88);
          border-bottom: 1px solid var(--admin-border);
          backdrop-filter: blur(16px);
          min-height: 44px;
        }
        :root[data-theme="light"] .tb-root { background: var(--admin-sidebar); }
        .tb-breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: 0; font-size: 0.78rem; line-height: 1; }
        .tb-bc-item { display: flex; align-items: center; gap: 3px; }
        .tb-bc-sep { font-size: 0.58rem; color: var(--admin-text-muted); margin: 0 3px; }
        .tb-bc-link { display: flex; align-items: center; gap: 4px; color: var(--admin-text-muted); text-decoration: none; font-weight: 500; font-size: 0.78rem; transition: color 0.12s; }
        .tb-bc-link:hover { color: var(--admin-accent); }
        .tb-bc-past { color: var(--admin-text-muted); font-weight: 500; }
        .tb-bc-current { color: var(--admin-text-primary); font-weight: 700; font-size: 0.8rem; }
        .admin-content { flex: 1; padding: 1rem 1.5rem; overflow: auto; }
        .app-main { display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s ease; }
        @media (max-width: 767px) {
          .admin-sidebar { transform: translateX(-100%); transition: transform 0.22s ease; width: 280px !important; padding: 1.5rem 1rem !important; }
          .admin-sidebar.sb-mobile-open { transform: translateX(0); }
          .app-main { margin-left: 0 !important; }
          .admin-content { padding: 0.75rem 1rem; }
          .tb-bc-home, .tb-bc-past, .tb-bc-sep { display: none; }
          .tb-bc-current { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40vw; display: block; }
        }
      `}</style>

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <main
        className="app-main"
        style={{ marginLeft: sidebarWidth }}
      >
        <Topbar
          title={title}
          description={description}
          darkMode={darkMode ?? true}
          onToggleDark={() => setDarkMode(d => !(d ?? true))}
          onHamburger={() => setMobileOpen(o => !o)}
        />
        <div className="admin-content">{children}</div>
      </main>
    </>
  );
}
