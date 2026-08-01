'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLATFORM_LABELS } from '@/constants/platforms';

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

export default function CreateContentPage() {
  const router = useRouter();
  const [clients, setClients] = useState<{ id: string; business_name: string }[]>([]);
  const [form, setForm] = useState({
    client_id: '', title: '', caption: '', platform: 'instagram', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/portal/clients')
      .then(r => r.ok ? r.json() : null)
      .then(data => setClients(data?.data ?? []));
  }, []);

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/portal/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.message ?? 'Failed.'); return; }
    router.push('/drafts');
  };

  const handleSaveAndPropose = async (e: React.FormEvent) => {
    e.preventDefault();
    setProposing(true); setError('');
    const res = await fetch('/api/portal/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json(); setError(d.message ?? 'Failed.'); setProposing(false); return; }
    const created = await res.json();
    await fetch(`/api/portal/content/${created.data.id}/propose`, { method: 'POST' });
    setProposing(false);
    router.push('/portal-dashboard');
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
        Create Content
      </h2>

      <form style={{ ...card, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {/* Client selector */}
        <div>
          <label style={labelStyle}>Client *</label>
          <select
            required
            value={form.client_id}
            onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
            style={inputStyle}
          >
            <option value="">Select a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
          </select>
        </div>

        {/* Title + Platform */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              type="text" required style={inputStyle}
              placeholder="e.g. Summer Sale Post"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Platform *</label>
            <select
              value={form.platform}
              onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
              style={inputStyle}
            >
              {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Caption */}
        <div>
          <label style={labelStyle}>Caption</label>
          <textarea
            value={form.caption}
            onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
            style={{ ...inputStyle, minHeight: 120, resize: 'vertical' as const }}
            placeholder="Write the post caption..."
          />
        </div>

        {/* Internal notes */}
        <div>
          <label style={labelStyle}>
            Internal Notes
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 400, marginLeft: '0.35rem' }}>
              (not visible to client)
            </span>
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' as const }}
            placeholder="Private notes..."
          />
        </div>

        {error && (
          <p style={{ fontSize: '0.8rem', color: '#f87171' }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem', flexWrap: 'wrap' }}>
          <button
            type="submit"
            onClick={handleSaveDraft}
            disabled={saving || proposing}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: 10,
              border: '1px solid var(--admin-border-strong)',
              background: 'transparent', color: 'var(--admin-text-secondary)',
              fontSize: '0.875rem', fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, fontFamily: 'inherit',
            }}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={handleSaveAndPropose}
            disabled={saving || proposing || !form.client_id || !form.title}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none',
              background: 'var(--admin-accent)', color: '#fff',
              fontSize: '0.875rem', fontWeight: 600,
              cursor: proposing || !form.client_id || !form.title ? 'not-allowed' : 'pointer',
              opacity: proposing || !form.client_id || !form.title ? 0.6 : 1,
              fontFamily: 'inherit',
            }}
          >
            {proposing ? 'Sending...' : 'Save & Send to Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
