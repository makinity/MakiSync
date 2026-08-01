'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PortalSidebar from './PortalSidebar';
import PortalTopbar from './PortalTopbar';

interface PortalLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':              'Dashboard',
  '/content/proposed':       'Proposed Content',
  '/content/scheduled':      'Scheduled Content',
  '/content/published':      'Published Content',
  '/content/archived':       'Archived Content',
  '/calendar':               'Content Calendar',
  '/analytics/overview':     'Analytics Overview',
  '/analytics/platforms':    'Platform Breakdown',
  '/assets/images':          'Images',
  '/assets/videos':          'Videos',
  '/assets/brand-kit':       'Brand Kit',
  '/assets/documents':       'Documents',
  '/messages':               'Messages',
  '/portal-dashboard':       'Portal Dashboard',
  '/clients':                'Clients',
  '/drafts':                 'Drafts',
  '/create-content':         'Create Content',
  '/approvals':              'Approvals',
  '/schedule':               'Schedule',
  '/portal-settings':        'Portal Settings',
};

export default function PortalLayout({ children, isAdmin = false }: PortalLayoutProps) {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // null = not yet read from localStorage (prevents flash)
  const [darkMode, setDarkMode]     = useState<boolean | null>(null);
  const pathname = usePathname();

  // ── Read saved preferences on mount ────────────────────────────────────────
  useEffect(() => {
    const theme = localStorage.getItem('theme') ?? 'dark';
    setDarkMode(theme === 'dark');

    const sb = localStorage.getItem('portal-sb-collapsed');
    if (sb === '1') setCollapsed(true);
  }, []);

  // ── Apply theme to document root — mirrors AppLayout exactly ───────────────
  useEffect(() => {
    if (darkMode === null) return;
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('portal-sb-collapsed', next ? '1' : '0');
  };

  // Derive page title from pathname
  const title = PAGE_TITLES[pathname] ?? 'Portal';
  const sidebarWidth = collapsed ? 68 : 280;

  return (
    <>
      <style>{`
        .portal-app-main {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.2s ease;
        }
        .portal-content {
          flex: 1;
          padding: 1rem 1.5rem;
          overflow: auto;
        }
        @media (max-width: 1023px) {
          .portal-app-main { margin-left: 0 !important; }
          .portal-content { padding: 0.75rem 1rem; }
        }
      `}</style>

      <PortalSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        isAdmin={isAdmin}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main
        className="portal-app-main"
        style={{ marginLeft: sidebarWidth }}
      >
        <PortalTopbar
          title={title}
          darkMode={darkMode ?? true}
          onToggleDark={() => setDarkMode(d => !(d ?? true))}
          onHamburger={() => setMobileOpen(o => !o)}
        />
        <div className="portal-content">
          {children}
        </div>
      </main>
    </>
  );
}
