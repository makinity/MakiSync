'use client';
import { useEffect, useState } from 'react';

const card: React.CSSProperties = {
  background: 'var(--admin-card)',
  border: '1px solid var(--admin-border)',
  borderRadius: 'var(--admin-radius)',
  boxShadow: 'var(--admin-shadow)',
};

export default function PortalDashboardPage() {
  const [stats, setStats] = useState({ clients: 0, pendingApprovals: 0, drafts: 0, scheduled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/clients').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
    ]).then(([clientsData, dashData]) => {
      setStats({
        clients: clientsData?.data?.length ?? 0,
        pendingApprovals: dashData?.data?.waiting_approval ?? 0,
        drafts: 0,
        scheduled: dashData?.data?.scheduled ?? 0,
      });
      setLoading(false);
    });
  }, []);

  const STAT_CARDS = [
    { label: 'Total Clients',     value: stats.clients,          icon: 'bi-people',             color: '#3b82f6' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: 'bi-inbox',              color: '#f59e0b' },
    { label: 'Scheduled',         value: stats.scheduled,        icon: 'bi-calendar-check',     color: '#8b5cf6' },
    { label: 'Published Today',   value: 0,                      icon: 'bi-check-circle-fill',  color: '#10b981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
          Portal Dashboard
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Overview of all client activity
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '3px solid var(--admin-border)',
            borderTopColor: 'var(--admin-accent)',
            animation: 'spin 0.7s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} style={{ ...card, padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s.label}
                </span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '0.85rem' }} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--admin-text-primary)', lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
