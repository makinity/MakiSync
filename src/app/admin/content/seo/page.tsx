'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };

const SEO_PAGES = [
  { key: 'home',     label: 'Home Page',       icon: 'bi-house-fill' },
  { key: 'profile',  label: 'Profile / About', icon: 'bi-person-badge-fill' },
  { key: 'projects', label: 'Projects',        icon: 'bi-briefcase-fill' },
  { key: 'services', label: 'Services',        icon: 'bi-box-seam-fill' },
  { key: 'contact',  label: 'Contact',         icon: 'bi-envelope-fill' },
];

type SeoRow = { meta_title: string; meta_description: string; og_image_url: string };

export default function SeoPage() {
  const [data, setData] = useState<Record<string, SeoRow>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content/seo').then(r => r.json()).then((rows: any[]) => {
      const map: Record<string, SeoRow> = {};
      SEO_PAGES.forEach(p => {
        const row = rows.find(r => r.page_key === p.key) ?? {};
        map[p.key] = { meta_title: row.meta_title ?? '', meta_description: row.meta_description ?? '', og_image_url: row.og_image_url ?? '' };
      });
      setData(map);
    });
  }, []);

  const set = (page: string, field: keyof SeoRow, val: string) =>
    setData(d => ({ ...d, [page]: { ...d[page], [field]: val } }));

  const handleSave = async (pageKey: string) => {
    setSaving(pageKey);
    await fetch('/api/content/seo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page_key: pageKey, ...data[pageKey] }) });
    setSaving(null); setSaved(pageKey); setTimeout(() => setSaved(null), 2000);
  };

  return (
    <AppLayout title="SEO" description="Admin / Content">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 700 }}>
        {SEO_PAGES.map(p => {
          const d = data[p.key] ?? { meta_title: '', meta_description: '', og_image_url: '' };
          return (
            <div key={p.key} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)', padding: '1.25rem', boxShadow: 'var(--admin-shadow)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${p.icon}`} style={{ color: 'var(--admin-accent)', fontSize: '0.9rem' }} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>{p.label}</span>
              </div>
              <div>
                <label style={lbl}>Meta Title <span style={{ fontWeight: 400, color: d.meta_title.length > 60 ? '#f87171' : 'var(--admin-text-muted)' }}>({d.meta_title.length}/60)</span></label>
                <input type="text" placeholder="Page title for search engines…" value={d.meta_title} onChange={e => set(p.key, 'meta_title', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Meta Description <span style={{ fontWeight: 400, color: d.meta_description.length > 160 ? '#f87171' : 'var(--admin-text-muted)' }}>({d.meta_description.length}/160)</span></label>
                <textarea placeholder="Brief description for search results…" value={d.meta_description} onChange={e => set(p.key, 'meta_description', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' as const }} />
              </div>
              <div>
                <label style={lbl}>OG Image URL</label>
                <input type="text" placeholder="https://..." value={d.og_image_url} onChange={e => set(p.key, 'og_image_url', e.target.value)} style={inp} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                {saved === p.key && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ Saved</span>}
                <button onClick={() => handleSave(p.key)} disabled={saving === p.key} style={{ padding: '0.5rem 1.25rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: saving === p.key ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {saving === p.key ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
