'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/layouts/AppLayout';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { uploadFile } from '@/lib/upload';

const TABS = [
  { key: 'hero', label: 'Hero',  icon: 'bi-stars' },
  { key: 'faq',  label: 'FAQ',   icon: 'bi-question-circle-fill' },
  { key: 'seo',  label: 'SEO',   icon: 'bi-search' },
] as const;
type TabKey = typeof TABS[number]['key'];

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };
const card: React.CSSProperties = { background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)', padding: '1.25rem', boxShadow: 'var(--admin-shadow)' };

function SaveBtn({ loading, saved, onClick }: { loading: boolean; saved: boolean; onClick: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
      {saved && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ Saved</span>}
      <button onClick={onClick} disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}

// ── Hero Tab ─────────────────────────────────────────────
function HeroTab() {
  const [form, setForm] = useState({ headline: '', subheadline: '', cta_text: '', cta_url: '', bg_image_url: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/content/hero').then(r => r.json()).then(d =>
      setForm({ headline: d.headline ?? '', subheadline: d.subheadline ?? '', cta_text: d.cta_text ?? '', cta_url: d.cta_url ?? '', bg_image_url: d.bg_image_url ?? '' })
    );
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadFile('general', file); setForm(f => ({ ...f, bg_image_url: url })); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/content/hero', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={card}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem' }}>Background Image</div>
        <div onClick={() => fileRef.current?.click()} style={{ width: '100%', aspectRatio: '16/6', borderRadius: 10, border: `2px dashed ${form.bg_image_url ? 'transparent' : 'var(--admin-border-strong)'}`, background: 'var(--admin-bg-secondary)', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {form.bg_image_url
            ? <><img src={form.bg_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}><i className="bi bi-camera-fill" style={{ marginRight: '0.4rem' }} />Change</span></div></>
            : <div style={{ textAlign: 'center' }}>{uploading ? <span style={{ color: 'var(--admin-text-muted)' }}>Uploading…</span> : <><i className="bi bi-cloud-upload-fill" style={{ fontSize: '1.8rem', color: 'var(--admin-text-muted)', display: 'block' }} /><div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.35rem' }}>Click to upload hero background</div></>}</div>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
      </div>
      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>Copy</div>
        <div><label style={lbl}>Headline</label><input type="text" placeholder="Your main headline…" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} style={inp} /></div>
        <div><label style={lbl}>Subheadline</label><textarea rows={3} placeholder="Supporting text…" value={form.subheadline} onChange={e => setForm(f => ({ ...f, subheadline: e.target.value }))} style={{ ...inp, resize: 'vertical' as const }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div><label style={lbl}>CTA Button Text</label><input type="text" placeholder="Hire Me" value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} style={inp} /></div>
          <div><label style={lbl}>CTA URL</label><input type="text" placeholder="/contact" value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} style={inp} /></div>
        </div>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
}

// ── FAQ Tab ──────────────────────────────────────────────
type FAQ = { id: number; question: string; answer: string; is_published: boolean; order: number };

function FAQTab() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', is_published: true });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => { setLoading(true); fetch('/api/content/faqs').then(r => r.json()).then(d => { setFaqs(d); setLoading(false); }); };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ question: '', answer: '', is_published: true }); setShowForm(true); };
  const openEdit = (f: FAQ) => { setEditing(f); setForm({ question: f.question, answer: f.answer, is_published: f.is_published }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    await fetch(editing ? `/api/content/faqs/${editing.id}` : '/api/content/faqs', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/content/faqs/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false); setDeleteTarget(null); load();
  };

  const togglePublish = async (f: FAQ) => {
    await fetch(`/api/content/faqs/${f.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, is_published: !f.is_published }) });
    load();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{faqs.length} question{faqs.length !== 1 ? 's' : ''}</div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          <i className="bi bi-plus-lg" /> Add FAQ
        </button>
      </div>
      {loading ? <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div> : faqs.length === 0 ? (
        <div style={{ ...card, padding: '3rem 2rem', textAlign: 'center' }}>
          <i className="bi bi-question-circle" style={{ fontSize: '2.5rem', opacity: 0.2, color: 'var(--admin-accent)', display: 'block', marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>No FAQs yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {faqs.map(f => (
            <div key={f.id} style={{ ...card, padding: 0, overflow: 'hidden', opacity: f.is_published ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem', cursor: 'pointer' }} onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
                <i className={`bi bi-chevron-${expanded === f.id ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>{f.question}</span>
                <div style={{ display: 'flex', gap: '0.35rem' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => togglePublish(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: f.is_published ? '#4ade80' : 'var(--admin-text-muted)', padding: '0.2rem' }}><i className={`bi bi-${f.is_published ? 'eye-fill' : 'eye-slash'}`} /></button>
                  <button onClick={() => openEdit(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', padding: '0.2rem' }}><i className="bi bi-pencil-fill" /></button>
                  <button onClick={() => setDeleteTarget(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: '0.2rem' }}><i className="bi bi-trash3-fill" /></button>
                </div>
              </div>
              {expanded === f.id && <div style={{ padding: '0.75rem 1rem 1rem 2.5rem', fontSize: '0.83rem', color: 'var(--admin-text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--admin-border)' }}>{f.answer}</div>}
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <FormModal title={editing ? 'Edit FAQ' : 'New FAQ'} onClose={() => setShowForm(false)} onSubmit={handleSave} loading={saving} submitLabel={editing ? 'Update' : 'Add'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={lbl}>Question *</label><input type="text" placeholder="e.g. What services do you offer?" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} style={inp} autoFocus /></div>
            <div><label style={lbl}>Answer *</label><textarea rows={5} placeholder="Your answer…" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} style={{ ...inp, resize: 'vertical' as const }} /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} /> Publish immediately
            </label>
          </div>
        </FormModal>
      )}
      {deleteTarget && <ConfirmModal message="Delete this FAQ?" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
    </div>
  );
}

// ── SEO Tab ──────────────────────────────────────────────
const SEO_PAGES = [
  { key: 'home', label: 'Home Page', icon: 'bi-house-fill' },
  { key: 'profile', label: 'Profile / About', icon: 'bi-person-badge-fill' },
  { key: 'projects', label: 'Projects', icon: 'bi-briefcase-fill' },
  { key: 'services', label: 'Services', icon: 'bi-box-seam-fill' },
  { key: 'contact', label: 'Contact', icon: 'bi-envelope-fill' },
];
type SeoRow = { meta_title: string; meta_description: string; og_image_url: string };

function SeoTab() {
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
      {SEO_PAGES.map(p => {
        const d = data[p.key] ?? { meta_title: '', meta_description: '', og_image_url: '' };
        return (
          <div key={p.key} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`bi ${p.icon}`} style={{ color: 'var(--admin-accent)', fontSize: '0.9rem' }} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>{p.label}</span>
            </div>
            <div><label style={lbl}>Meta Title <span style={{ fontWeight: 400, color: d.meta_title.length > 60 ? '#f87171' : 'var(--admin-text-muted)' }}>({d.meta_title.length}/60)</span></label><input type="text" placeholder="Page title for search engines…" value={d.meta_title} onChange={e => set(p.key, 'meta_title', e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Meta Description <span style={{ fontWeight: 400, color: d.meta_description.length > 160 ? '#f87171' : 'var(--admin-text-muted)' }}>({d.meta_description.length}/160)</span></label><textarea rows={2} placeholder="Brief description…" value={d.meta_description} onChange={e => set(p.key, 'meta_description', e.target.value)} style={{ ...inp, resize: 'vertical' as const }} /></div>
            <div><label style={lbl}>OG Image URL</label><input type="text" placeholder="https://..." value={d.og_image_url} onChange={e => set(p.key, 'og_image_url', e.target.value)} style={inp} /></div>
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
  );
}

// ── Main Page ────────────────────────────────────────────
function ContentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) ?? 'hero';
  const setTab = (key: TabKey) => router.push(`/admin/content?tab=${key}`, { scroll: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid var(--admin-border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit', color: activeTab === t.key ? 'var(--admin-accent)' : 'var(--admin-text-muted)', borderBottom: `2px solid ${activeTab === t.key ? 'var(--admin-accent)' : 'transparent'}`, whiteSpace: 'nowrap', marginBottom: '-1px', transition: 'color 0.15s' }}>
            <i className={`bi ${t.icon}`} />
            {t.label}
          </button>
        ))}
      </div>
      {activeTab === 'hero' && <HeroTab />}
      {activeTab === 'faq'  && <FAQTab />}
      {activeTab === 'seo'  && <SeoTab />}
    </div>
  );
}

export default function ContentPage() {
  return (
    <AppLayout title="Content" description="Admin">
      <Suspense fallback={<div style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>}>
        <ContentContent />
      </Suspense>
    </AppLayout>
  );
}
