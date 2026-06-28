export default function UnderDevelopment({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: '1rem', textAlign: 'center',
    }}>
      <i className={`bi ${icon}`} style={{ fontSize: '3rem', opacity: 0.25, color: 'var(--admin-accent)' }} />
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-secondary)' }}>
        Under Development
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
        The <strong>{label}</strong> page is coming soon.
      </div>
    </div>
  );
}
