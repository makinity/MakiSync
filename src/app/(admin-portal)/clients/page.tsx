'use client';
import { useEffect, useState } from 'react';

interface Client {
  id: string;
  username: string;
  email: string;
  business_name: string;
  industry: string | null;
  is_active: boolean;
  created_at: string;
}

const card: React.CSSProperties = {
  background: 'var(--admin-card)',
  border: '1px solid var(--admin-border)',
  borderRadius: 'var(--admin-radius)',
  boxShadow: 'var(--admin-shadow)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  borderRadius: 10,
  border: '1px solid var(--admin-border-strong)',
  background: 'var(--admin-bg-secondary)',
  color: 'var(--admin-text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--admin-text-secondary)',
  marginBottom: '0.35rem',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', business_name: '', industry: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/portal/clients')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setClients(data?.data ?? []); setLoading(false); });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/portal/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.message ?? 'Failed to create client.'); return; }
    setClients(prev => [{ ...data.data, username: form.username, email: form.email }, ...prev]);
    setShowCreate(false);
    setForm({ username: '', email: '', password: '', business_name: '', industry: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
            Clients
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
            {clients.length} total client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1rem', borderRadius: 10, border: 'none',
            background: 'var(--admin-accent)', color: '#fff',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <i className="bi bi-plus-lg" />
          Add Client
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{ ...card, width: '100%', maxWidth: 460, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
              Create New Client
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Business Name *</label>
                <input
                  type="text" required style={inputStyle}
                  placeholder="e.g. StylePH Fashion"
                  value={form.business_name}
                  onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Username *</label>
                  <input type="text" required style={inputStyle} value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" required style={inputStyle} value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Password *</label>
                  <input type="password" required style={inputStyle} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Industry</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Fashion" value={form.industry}
                    onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
                </div>
              </div>
              {error && (
                <p style={{ fontSize: '0.8rem', color: '#f87171' }}>{error}</p>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: 10,
                    border: '1px solid var(--admin-border-strong)',
                    background: 'transparent', color: 'var(--admin-text-secondary)',
                    fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saving}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: 10, border: 'none',
                    background: 'var(--admin-accent)', color: '#fff',
                    fontSize: '0.875rem', fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1, fontFamily: 'inherit',
                  }}
                >
                  {saving ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client list */}
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
      ) : clients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--admin-text-muted)' }}>
          <i className="bi bi-people" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>No clients yet. Create your first client to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {clients.map(c => (
            <div
              key={c.id}
              style={{ ...card, padding: '1rem 1.25rem', transition: 'border-color 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.3)')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--admin-border)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Avatar */}
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(59,130,246,0.12)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', fontWeight: 700,
                  color: 'var(--admin-accent)',
                }}>
                  {c.business_name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '0.95rem', fontWeight: 600,
                    color: 'var(--admin-text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {c.business_name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                    {c.industry ?? 'No industry'} · {c.email}
                  </p>
                </div>

                {/* Status + date */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.15rem 0.6rem', borderRadius: 99,
                    fontSize: '0.68rem', fontWeight: 600,
                    background: c.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)',
                    color: c.is_active ? '#10b981' : '#f87171',
                    border: `1px solid ${c.is_active ? 'rgba(16,185,129,0.25)' : 'rgba(248,113,113,0.25)'}`,
                  }}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <p style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
                    Joined {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
