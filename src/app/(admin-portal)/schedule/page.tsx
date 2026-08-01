'use client';
import { useEffect, useState } from 'react';
import { PLATFORM_LABELS } from '@/constants/platforms';

const PLATFORM_COLOR: Record<string, string> = {
  facebook: '#3b82f6', instagram: '#d946ef', tiktok: '#94a3b8',
  linkedin: '#0a66c2', twitter: '#0ea5e9', youtube: '#ef4444',
};

interface ScheduleItem {
  id: string;
  title: string;
  platform: string;
  status: string;
  scheduled_at: string | null;
}

export default function SchedulePage() {
  const [items, setItems]   = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/content?status=approved').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/content?status=scheduled').then(r => r.ok ? r.json() : null),
    ]).then(([approved, scheduled]) => {
      setItems([...(approved?.data ?? []), ...(scheduled?.data ?? [])]);
      setLoading(false);
    });
  }, []);

  const card: React.CSSProperties = {
    background: 'var(--admin-card)',
    border: '1px solid var(--admin-border)',
    borderRadius: 'var(--admin-radius)',
    boxShadow: 'var(--admin-shadow)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
          Schedule
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Approved and scheduled content ready for publishing
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : items.length === 0 ? (
        <div style={{ ...card, padding: '4rem 1rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          <i className="bi bi-calendar-week" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>No content to schedule yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{ ...card, padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'border-color 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.3)')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--admin-border)')}
            >
              {/* Platform dot */}
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: `${PLATFORM_COLOR[item.platform] ?? '#94a3b8'}18`,
                border: `1px solid ${PLATFORM_COLOR[item.platform] ?? '#94a3b8'}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: PLATFORM_COLOR[item.platform] ?? '#94a3b8' }} />
              </div>

              {/* Title + platform */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  {PLATFORM_LABELS[item.platform] ?? item.platform}
                </p>
              </div>

              {/* Scheduled date */}
              {item.scheduled_at && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                    {new Date(item.scheduled_at).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                    {new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              {/* Status badge */}
              <span style={{
                flexShrink: 0, padding: '0.15rem 0.6rem', borderRadius: 99,
                fontSize: '0.68rem', fontWeight: 600,
                background: item.status === 'scheduled' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)',
                color: item.status === 'scheduled' ? '#8b5cf6' : '#3b82f6',
                border: `1px solid ${item.status === 'scheduled' ? 'rgba(139,92,246,0.25)' : 'rgba(59,130,246,0.25)'}`,
                textTransform: 'capitalize',
              }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
