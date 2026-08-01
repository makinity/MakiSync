'use client';
import { useEffect, useState } from 'react';

const card: React.CSSProperties = {
  background: 'var(--admin-card)',
  border: '1px solid var(--admin-border)',
  borderRadius: 'var(--admin-radius)',
  boxShadow: 'var(--admin-shadow)',
};

export default function AnalyticsOverviewPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Analytics populated via manual entry in Phase 2 — stub for now
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    { label: 'Total Impressions',  value: '—', icon: 'bi-eye',     color: '#3b82f6' },
    { label: 'Total Reach',        value: '—', icon: 'bi-people',  color: '#10b981' },
    { label: 'Total Engagements',  value: '—', icon: 'bi-heart',   color: '#d946ef' },
    { label: 'Posts Published',    value: '—', icon: 'bi-send',    color: '#8b5cf6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
          Analytics Overview
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Campaign performance across all platforms
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {stats.map(s => (
              <div key={s.label} style={{ ...card, padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '0.85rem' }} />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--admin-text-primary)', lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            <i className="bi bi-graph-up" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: 'var(--admin-border)' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.3rem' }}>Analytics available after content is published</p>
            <p style={{ fontSize: '0.8rem' }}>Charts and platform breakdowns will appear here once posts go live.</p>
          </div>
        </>
      )}
    </div>
  );
}
