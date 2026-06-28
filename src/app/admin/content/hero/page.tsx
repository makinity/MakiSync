'use client';
import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { uploadFile } from '@/lib/upload';

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };
const card: React.CSSProperties = { background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)', padding: '1.25rem', boxShadow: 'var(--admin-shadow)' };

export default function HeroPage() {
  const [form, setForm] = useState({ headline: '', subheadline: '', cta_text: '', cta_url: '', bg_image_url: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/content/hero').then(r => r.json()).then(d => {
      setForm({ headline: d.headline ?? '', subheadline: d.subheadline ?? '', cta_text: d.cta_text ?? '', cta_url: d.cta_url ?? '', bg_image_url: d.bg_image_url ?? '' });
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadFile('general', file, `hero/${Date.now()}-${file.name}`); setForm(f => ({ ...f, bg_image_url: url })); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/content/hero', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout title="Hero" description="Admin / Content">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 700 }}>
        <div style={card}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem' }}>Background Image</div>
          <div onClick={() => fileRef.current?.click()} style={{ width: '100%', aspectRatio: '16/6', borderRadius: 10, border: `2px dashed ${form.bg_image_url ? 'transparent' : 'var(--admin-border-strong)'}`, background: 'var(--admin-bg-secondary)', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {form.bg_image_url
              ? <><img src={form.bg_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}><i className="bi bi-camera-fill" style={{ marginRight: '0.4rem' }} />Change Image</span></div></>
              : <div style={{ textAlign: 'center' }}>{uploading ? <div style={{ color: 'var(--admin-text-muted)' }}>Uploading…</div> : <><i className="bi bi-cloud-upload-fill" style={{ fontSize: '1.8rem', color: 'var(--admin-text-muted)' }} /><div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.35rem' }}>Click to upload hero background</div></>}</div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        </div>

        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>Hero Copy</div>
          <div>
            <label style={lbl}>Headline</label>
            <input type="text" placeholder="Your main headline…" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Subheadline</label>
            <textarea placeholder="Supporting text below the headline…" value={form.subheadline} onChange={e => setForm(f => ({ ...f, subheadline: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' as const }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={lbl}>CTA Button Text</label>
              <input type="text" placeholder="e.g. Hire Me" value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>CTA URL</label>
              <input type="text" placeholder="/contact" value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} style={inp} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
            {saved && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ Saved</span>}
            <button onClick={handleSave} disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
