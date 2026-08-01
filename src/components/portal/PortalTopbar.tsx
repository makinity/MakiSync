'use client';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';

interface PortalTopbarProps {
  title: string;
  darkMode: boolean;
  onToggleDark: () => void;
  onHamburger: () => void;
}

export default function PortalTopbar({
  title,
  darkMode,
  onToggleDark,
  onHamburger,
}: PortalTopbarProps) {
  return (
    <div
      className="tb-root"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.45rem 1.25rem',
        background: 'rgba(10,15,26,0.88)',
        borderBottom: '1px solid var(--admin-border)',
        backdropFilter: 'blur(16px)',
        minHeight: 52,
      }}
    >
      <style>{`
        :root[data-theme="light"] .tb-root { background: var(--admin-sidebar) !important; }
      `}</style>

      {/* Left: hamburger + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <style>{`
          .portal-hamburger { display: none; }
          @media (max-width: 1023px) { .portal-hamburger { display: flex; } }
        `}</style>
        <button
          className="portal-hamburger"
          onClick={onHamburger}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--admin-text-muted)',
            fontSize: '1.25rem',
            padding: '0.25rem',
            borderRadius: 6,
            transition: 'color 0.15s',
          }}
        >
          <i className="bi bi-list" />
        </button>
        <h1
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--admin-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right: dark mode toggle + bell + profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {/* Dark mode toggle — same toggle as login page */}
        <button
          onClick={onToggleDark}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 44,
            height: 24,
            borderRadius: 99,
            border: 'none',
            cursor: 'pointer',
            background: darkMode ? 'var(--admin-accent)' : '#cbd5e1',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            padding: '0 3px',
            marginRight: '0.5rem',
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              marginLeft: darkMode ? 'auto' : 0,
              transition: 'margin 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {darkMode ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </span>
        </button>

        <NotificationBell />
        <ProfileDropdown />
      </div>
    </div>
  );
}
