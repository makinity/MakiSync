'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  username: string;
  role: string;
}

export default function ProfileDropdown() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data); });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '..';

  const menuItem: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.82rem',
    color: 'var(--admin-text-secondary)',
    transition: 'background 0.12s, color 0.12s',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.6rem',
          borderRadius: 10,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.15)',
            border: '2px solid rgba(59,130,246,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--admin-accent)',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        {/* Name + role — hidden on very small screens */}
        <div style={{ textAlign: 'left' }} className="sm-visible">
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--admin-text-primary)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {user?.username ?? '...'}
          </div>
          <div
            style={{
              fontSize: '0.68rem',
              color: 'var(--admin-text-muted)',
              textTransform: 'capitalize',
              lineHeight: 1.2,
            }}
          >
            {user?.role ?? ''}
          </div>
        </div>
        <i
          className="bi bi-chevron-down"
          style={{ fontSize: '0.6rem', color: 'var(--admin-text-muted)' }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            width: 210,
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-border)',
            borderRadius: 14,
            boxShadow: 'var(--admin-shadow)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {/* User info header */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--admin-border)',
            }}
          >
            <p
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--admin-text-primary)',
              }}
            >
              {user?.username}
            </p>
            <p
              style={{
                fontSize: '0.72rem',
                color: 'var(--admin-text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {user?.role}
            </p>
          </div>

          {/* Menu items */}
          <div style={{ padding: '0.25rem 0' }}>
            {[
              { icon: 'bi-person', label: 'Profile' },
              { icon: 'bi-bell', label: 'Notifications' },
              { icon: 'bi-plug', label: 'Connected Accounts' },
              { icon: 'bi-shield-lock', label: 'Security' },
            ].map(item => (
              <button
                key={item.label}
                style={menuItem}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: '0.8rem', width: 14, color: 'var(--admin-text-muted)' }} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div style={{ borderTop: '1px solid var(--admin-border)', padding: '0.25rem 0' }}>
            <button
              onClick={handleLogout}
              style={{ ...menuItem, color: '#f87171' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: '0.8rem', width: 14 }} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
