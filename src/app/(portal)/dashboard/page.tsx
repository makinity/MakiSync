'use client';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface DashboardCounts {
  waiting_approval: number;
  scheduled: number;
  published_this_month: number;
  unread_messages: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  body: string | null;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const card: React.CSSProperties = {
  background: 'var(--admin-card)',
  border: '1px solid var(--admin-border)',
  borderRadius: 'var(--admin-radius)',
  boxShadow: 'var(--admin-shadow)',
};

export default function DashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u?.username) setUsername(u.username); });

    Promise.all([
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/notifications').then(r => r.ok ? r.json() : null),
    ]).then(([dashData, notifData]) => {
      if (dashData?.data) setCounts(dashData.data);
      if (notifData?.data) setActivities(notifData.data.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const STAT_CARDS = [
    {
      label: 'Waiting Approval',
      value: counts?.waiting_approval ?? '—',
      icon: 'bi-inbox',
      color: '#f59e0b',
    },
    {
      label: 'Scheduled Posts',
      value: counts?.scheduled ?? '—',
      icon: 'bi-calendar-check',
      color: '#8b5cf6',
    },
    {
      label: 'Published This Month',
      value: counts?.published_this_month ?? '—',
      icon: 'bi-check-circle',
      color: '#10b981',
    },
    {
      label: 'Unread Messages',
      value: counts?.unread_messages ?? '—',
      icon: 'bi-chat-dots',
      color: '#3b82f6',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '3px solid var(--admin-border)',
          borderTopColor: 'var(--admin-accent)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Greeting */}
      <div>
        <h1 style={{
          fontSize: isMobile ? '1.1rem' : '1.3rem',
          fontWeight: 800,
          color: 'var(--admin-text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Welcome back{username ? `, ${username}` : ''}! 👋
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Here&apos;s what&apos;s happening with your campaigns.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '0.65rem' : '1rem',
      }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ ...card, padding: isMobile ? '0.75rem' : '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{
                fontSize: isMobile ? '0.65rem' : '0.72rem',
                fontWeight: 600,
                color: 'var(--admin-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {s.label}
              </span>
              <div style={{
                width: isMobile ? 26 : 32,
                height: isMobile ? 26 : 32,
                borderRadius: 8,
                background: `${s.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: isMobile ? '0.75rem' : '0.9rem' }} />
              </div>
            </div>
            <div style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 800,
              color: 'var(--admin-text-primary)',
              lineHeight: 1,
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid var(--admin-border)',
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
            Recent Activity
          </span>
        </div>

        {activities.length === 0 ? (
          <div style={{
            padding: '2.5rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--admin-text-muted)',
          }}>
            No recent activity yet.
          </div>
        ) : (
          <div>
            {activities.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  borderBottom: i < activities.length - 1 ? '1px solid var(--admin-border)' : 'none',
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--admin-accent)',
                  marginTop: '0.35rem',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    color: 'var(--admin-text-primary)',
                  }}>
                    {a.title}
                  </p>
                  {a.body && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--admin-text-muted)',
                      marginTop: '0.15rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {a.body}
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  color: 'var(--admin-text-muted)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {timeAgo(a.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
