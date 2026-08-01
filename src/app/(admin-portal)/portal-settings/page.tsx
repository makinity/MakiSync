'use client';

export default function PortalSettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
          Portal Settings
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Configuration for the client portal
        </p>
      </div>

      <div style={{
        background: 'var(--admin-card)',
        border: '1px solid var(--admin-border)',
        borderRadius: 'var(--admin-radius)',
        boxShadow: 'var(--admin-shadow)',
        padding: '4rem 1rem',
        textAlign: 'center',
        color: 'var(--admin-text-muted)',
      }}>
        <i className="bi bi-gear" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.3rem' }}>
          Portal configuration coming in Phase 2
        </p>
        <p style={{ fontSize: '0.8rem' }}>Notification preferences, branding, and access control will be here.</p>
      </div>
    </div>
  );
}
