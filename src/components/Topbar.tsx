'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  title: string;
  description?: string;
  darkMode: boolean;
  onToggleDark: () => void;
  onHamburger: () => void;
}

export default function Topbar({ title, description, darkMode, onToggleDark, onHamburger }: TopbarProps) {
  const [dropOpen, setDropOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [username, setUsername] = useState('Admin');
  const [avatarUrl, setAvatarUrl] = useState<string|null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(u => {
      if (u?.username) setUsername(u.username);
    });
    fetch('/api/profile').then(r => r.ok ? r.json() : null).then(p => {
      if (p?.avatar_url) setAvatarUrl(p.avatar_url);
    });
  }, []);
  const dropRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const segments = description
    ? description.split(/[\/·>]+/).map(s => s.trim()).filter(Boolean)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropOpen(false);
    setSigningOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    setTimeout(() => router.push('/login'), 1000);
  };

  return (
    <>
      {signingOut && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'var(--admin-bg-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-border)',
            borderRadius: 20, padding: '2rem 2.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
            boxShadow: 'var(--admin-shadow)', minWidth: 220,
            animation: 'plsPop 0.3s ease',
          }}>
            <style>{`@keyframes plsPop { from{opacity:0;transform:scale(0.92) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} } @keyframes plsSlide { 0%{transform:translateX(-100%)} 50%{transform:translateX(200%)} 100%{transform:translateX(200%)} }`}</style>
            <img src="/logo.png" alt="MakiSync" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 14 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>MakiSync</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Signing out…</div>
            <div style={{ width: 180, height: 4, borderRadius: 99, background: 'var(--admin-border)', overflow: 'hidden', marginTop: '0.25rem' }}>
              <div style={{ width: '45%', height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', animation: 'plsSlide 1.2s infinite ease-in-out' }} />
            </div>
          </div>
        </div>
      )}
    <div className="tb-root">
      {/* Left: hamburger + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <button
          onClick={onHamburger}
          className="tb-hamburger"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--admin-text-secondary)', fontSize: '1.2rem', padding: '0.2rem',
            display: 'none',
          }}
        >
          <i className="bi bi-list" />
        </button>
        <style>{`.tb-hamburger { display: none !important; } @media (max-width: 767px) { .tb-hamburger { display: flex !important; } }`}</style>

        <nav className="tb-breadcrumb" aria-label="breadcrumb">
          <Link href="/admin/dashboard" className="tb-bc-item tb-bc-link tb-bc-home">
            <i className="bi bi-house-door" style={{ fontSize: '0.72rem' }} />
            <span>Home</span>
          </Link>
          {segments.map((seg, i) => (
            <span key={i} className="tb-bc-item">
              <i className="bi bi-chevron-right tb-bc-sep" />
              <span className="tb-bc-link tb-bc-past">{seg}</span>
            </span>
          ))}
          <span className="tb-bc-item">
            <i className="bi bi-chevron-right tb-bc-sep" />
            <span className="tb-bc-current">{title}</span>
          </span>
        </nav>
      </div>

      {/* Right: user pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* User pill */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.3rem 0.7rem 0.3rem 0.3rem',
              borderRadius: 50, cursor: 'pointer',
              background: 'var(--admin-card)',
              border: '1px solid var(--admin-border)',
              color: 'var(--admin-text-primary)',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              background: 'rgba(59,130,246,0.12)',
              border: '2px solid rgba(59,130,246,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={username} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <i className="bi bi-person-fill" style={{ fontSize: '0.9rem', color: 'var(--admin-accent)' }} />
              }
            </div>
            <div style={{ textAlign: 'left' }} className="tb-user-text">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--admin-text-primary)' }}>{username}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', lineHeight: 1 }}>Administrator</div>
            </div>
            <i className="bi bi-chevron-down" style={{ fontSize: '0.6rem', color: 'var(--admin-text-muted)' }} />
          </button>

          {dropOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              background: 'var(--admin-card)',
              border: '1px solid var(--admin-border-strong)',
              borderRadius: 12, minWidth: 180, zIndex: 1000,
              boxShadow: 'var(--admin-shadow)',
              overflow: 'hidden',
            }}>
              {/* Theme toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.65rem 0.9rem',
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)', fontWeight: 500 }}>
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
                <button
                  onClick={onToggleDark}
                  style={{
                    width: 36, height: 20, borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: darkMode ? 'var(--admin-accent)' : '#cbd5e1',
                    position: 'relative', transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2, left: darkMode ? 18 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {darkMode
                      ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                      : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    }
                  </span>
                </button>
              </div>
              <div style={{ height: 1, background: 'var(--admin-border)', margin: '0 0.9rem' }} />
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.65rem 0.9rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 500,
                  color: '#f87171',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'background 0.15s',
                }}
              >
                <i className="bi bi-box-arrow-right" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
