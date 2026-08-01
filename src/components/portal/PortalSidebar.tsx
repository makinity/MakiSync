'use client';
import PortalNavGroup from './PortalNavGroup';

interface PortalSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  isAdmin: boolean;
  unreadCount?: number;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export default function PortalSidebar({
  collapsed,
  mobileOpen,
  isAdmin,
  unreadCount = 0,
  onToggleCollapse,
  onCloseMobile,
}: PortalSidebarProps) {
  const clientNav: {
    label: string;
    items: { href: string; label: string; icon: string; badge?: number }[];
    collapsible?: boolean;
  }[] = [
    {
      label: 'Dashboard',
      items: [{ href: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' }],
    },
    {
      label: 'Content',
      items: [
        { href: '/content/proposed', label: 'Proposed', icon: 'bi-inbox', badge: unreadCount },
        { href: '/content/scheduled', label: 'Scheduled', icon: 'bi-calendar-check' },
        { href: '/content/published', label: 'Published', icon: 'bi-check-circle' },
        { href: '/content/archived', label: 'Archived', icon: 'bi-archive' },
      ],
      collapsible: true,
    },
    {
      label: 'Calendar',
      items: [{ href: '/calendar', label: 'Calendar', icon: 'bi-calendar3' }],
    },
    {
      label: 'Analytics',
      items: [
        { href: '/analytics/overview', label: 'Overview', icon: 'bi-graph-up' },
        { href: '/analytics/platforms', label: 'Platforms', icon: 'bi-pie-chart' },
      ],
      collapsible: true,
    },
    {
      label: 'Assets',
      items: [
        { href: '/assets/images', label: 'Images', icon: 'bi-image' },
        { href: '/assets/videos', label: 'Videos', icon: 'bi-camera-reels' },
        { href: '/assets/brand-kit', label: 'Brand Kit', icon: 'bi-palette' },
        { href: '/assets/documents', label: 'Documents', icon: 'bi-file-earmark' },
      ],
      collapsible: true,
    },
    {
      label: 'Messages',
      items: [{ href: '/messages', label: 'Messages', icon: 'bi-chat-dots' }],
    },
  ];

  const adminNav: {
    label: string;
    items: { href: string; label: string; icon: string }[];
    collapsible?: boolean;
  }[] = [
    {
      label: 'Portal',
      items: [{ href: '/portal-dashboard', label: 'Portal Dashboard', icon: 'bi-grid-1x2-fill' }],
    },
    {
      label: 'Clients',
      items: [{ href: '/clients', label: 'All Clients', icon: 'bi-people' }],
    },
    {
      label: 'Content',
      items: [
        { href: '/drafts', label: 'Drafts', icon: 'bi-file-earmark-text' },
        { href: '/create-content', label: 'Create', icon: 'bi-plus-circle' },
        { href: '/approvals', label: 'Approvals', icon: 'bi-inbox' },
      ],
    },
    {
      label: 'Schedule',
      items: [{ href: '/schedule', label: 'Schedule', icon: 'bi-calendar-week' }],
    },
    {
      label: 'Settings',
      items: [{ href: '/portal-settings', label: 'Portal Settings', icon: 'bi-gear' }],
    },
  ];

  const navGroups = isAdmin ? adminNav : clientNav;

  return (
    <>
      <style>{`
        .portal-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          background: linear-gradient(180deg, var(--admin-sidebar), rgba(8,14,22,0.98));
          border-right: 1px solid var(--admin-border);
          backdrop-filter: blur(16px);
          display: flex; flex-direction: column; gap: 0.75rem;
          overflow-y: auto; overflow-x: hidden;
          z-index: 1000;
          transition: width 0.2s ease, padding 0.2s ease;
        }
        :root[data-theme="light"] .portal-sidebar {
          background: linear-gradient(180deg, var(--admin-sidebar), rgba(240,244,255,0.98));
        }
        .portal-sidebar.sb-collapsed { width: 68px; padding: 1.5rem 0.5rem; }
        .portal-sidebar:not(.sb-collapsed) { width: 280px; padding: 1.5rem 1rem; }
        .portal-sidebar::-webkit-scrollbar { width: 4px; }
        .portal-sidebar::-webkit-scrollbar-track { background: transparent; }
        .portal-sidebar::-webkit-scrollbar-thumb { background: var(--admin-border); border-radius: 4px; }
        @media (max-width: 1023px) {
          .portal-sidebar { transform: translateX(-100%); transition: transform 0.22s ease; width: 280px !important; padding: 1.5rem 1rem !important; }
          .portal-sidebar.sb-mobile-open { transform: translateX(0); }
        }
      `}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <nav
        className={`portal-sidebar${collapsed ? ' sb-collapsed' : ''}${mobileOpen ? ' sb-mobile-open' : ''}`}
      >
        {/* Brand — mirrors admin Sidebar.tsx exactly */}
        <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '0.6rem', minHeight: 40 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="bi bi-shield-lock-fill" style={{ color: 'var(--admin-accent)', fontSize: '1rem' }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                MakiSync
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                {isAdmin ? 'Admin Portal' : 'Client Portal'}
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--admin-text-muted)', fontSize: '1rem', padding: '0.25rem', flexShrink: 0,
                transition: 'color 0.15s',
              }}
              title="Collapse sidebar"
            >
              <i className="bi bi-chevron-left" />
            </button>
          )}
          {collapsed && (
            <button
              onClick={onToggleCollapse}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--admin-text-muted)', fontSize: '1rem', padding: '0.25rem',
                transition: 'color 0.15s',
              }}
              title="Expand sidebar"
            >
              <i className="bi bi-chevron-right" />
            </button>
          )}
        </div>

        <div
          style={{ height: '1px', background: 'var(--admin-border)', margin: '0 -0.25rem' }}
        />

        {/* Nav groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {navGroups.map((group, i) => (
            <PortalNavGroup
              key={i}
              label={group.label}
              items={group.items}
              collapsible={group.collapsible}
              collapsed={collapsed}
              onNavClick={onCloseMobile}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
