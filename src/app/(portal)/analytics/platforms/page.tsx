'use client';
import { useEffect, useState } from 'react';
import { PLATFORM_LABELS } from '@/constants/platforms';

const PLATFORM_COLOR: Record<string, string> = {
  facebook: '#3b82f6', instagram: '#d946ef', tiktok: '#94a3b8',
  linkedin: '#0a66c2', twitter: '#0ea5e9', youtube: '#ef4444',
};

interface PlatformData {
  platform: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  post_count: number;
}

export default function AnalyticsPlatformsPage() {
  const [data, setData]       = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/analytics')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d?.data?.by_platform ?? []); setLoading(false); });
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
          Platform Breakdown
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Performance metrics per platform
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : data.length === 0 ? (
        <div style={{ ...card, padding: '4rem 1rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          <i className="bi bi-pie-chart" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.3rem' }}>No analytics data yet</p>
          <p style={{ fontSize: '0.8rem' }}>Platform data will appear once posts are published and metrics are recorded.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.map(p => (
            <div key={p.platform} style={{ ...card, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${PLATFORM_COLOR[p.platform] ?? '#94a3b8'}18`, border: `1px solid ${PLATFORM_COLOR[p.platform] ?? '#94a3b8'}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: PLATFORM_COLOR[p.platform] ?? '#94a3b8' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>{PLATFORM_LABELS[p.platform] ?? p.platform}</h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{p.post_count} posts</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Impressions', value: p.impressions },
                  { label: 'Reach',       value: p.reach },
                  { label: 'Likes',       value: p.likes },
                  { label: 'Comments',    value: p.comments },
                ].map(m => (
                  <div key={m.label} style={{ background: 'var(--admin-bg-secondary)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text-primary)', lineHeight: 1 }}>{m.value.toLocaleString()}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
