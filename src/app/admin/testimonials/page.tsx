'use client';
import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/AppLayout';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { uploadFile } from '@/lib/upload';

type Testimonial = { id: number; client_name: string; client_title: string | null; client_avatar_url: string | null; message: string; rating: number; is_published: boolean; order: number };

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };

function Stars({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: '0.2rem' }}>
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`bi bi-star${i <= rating ? '-fill' : ''}`} onClick={() => onChange?.(i)}
          style={{ color: i <= rating ? '#facc15' : 'var(--admin-border-strong)', fontSize: '1rem', cursor: onChange ? 'pointer' : 'default' }} />
      ))}
    </div>
  );
}

const EMPTY = { client_name: '', client_title: '', client_avatar_url: '', message: '', rating: 5, is_published: false };

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  const load = () => {
    setLoading(true);
    fetch('/api/testimonials').then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ client_name: t.client_name, client_title: t.client_title ?? '', client_avatar_url: t.client_avatar_url ?? '', message: t.message, rating: t.rating, is_published: t.is_published });
    setShowForm(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingAvatar(true);
    try { const url = await uploadFile('testimonials', file); setForm(f => ({ ...f, client_avatar_url: url })); }
    finally { setUploadingAvatar(false); }
  };

  const handleSave = async () => {
    if (!form.client_name.trim() || !form.message.trim()) return;
    setSaving(true);
    if (editing) {
      await fetch(`/api/testimonials/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/testimonials/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false); setDeleteTarget(null); load();
  };

  // Quick toggle publish
  const togglePublish = async (t: Testimonial) => {
    await fetch(`/api/testimonials/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...t, is_published: !t.is_published }) });
    load();
  };

  const filtered = items.filter(t =>
    filter === 'all' ? true : filter === 'published' ? t.is_published : !t.is_published
  );

  const cols = isMobile ? 1 : bp === 'tablet' ? 2 : 3;

  return (
    <AppLayout title="Testimonials" description="Admin">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['all','published','unpublished'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1px solid ${filter === f ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: filter === f ? 'rgba(59,130,246,0.12)' : 'transparent', color: filter === f ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                {f} {f === 'all' ? `(${items.length})` : f === 'published' ? `(${items.filter(t=>t.is_published).length})` : `(${items.filter(t=>!t.is_published).length})`}
              </button>
            ))}
          </div>
          <button onClick={openCreate} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <i className="bi bi-plus-lg" /> Add Testimonial
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)' }}>
            <i className="bi bi-chat-quote" style={{ fontSize: '2.5rem', opacity: 0.2, color: 'var(--admin-accent)', display: 'block', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>No testimonials yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}>
            {filtered.map(t => (
              <div key={t.id} style={{ background: 'var(--admin-card)', border: `1px solid ${t.is_published ? 'rgba(59,130,246,0.22)' : 'var(--admin-border)'}`, borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', boxShadow: 'var(--admin-shadow)' }}>

                {/* Header: avatar + name + publish toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.client_avatar_url
                      ? <img src={t.client_avatar_url} alt={t.client_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <i className="bi bi-person-fill" style={{ color: 'var(--admin-accent)', fontSize: '1.2rem' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.client_name}</div>
                    {t.client_title && <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{t.client_title}</div>}
                  </div>
                  {/* Publish toggle */}
                  <button onClick={() => togglePublish(t)} title={t.is_published ? 'Unpublish' : 'Publish'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: t.is_published ? '#4ade80' : 'var(--admin-text-muted)', padding: '0.2rem', flexShrink: 0 }}>
                    <i className={`bi bi-${t.is_published ? 'eye-fill' : 'eye-slash'}`} />
                  </button>
                </div>

                {/* Stars */}
                <Stars rating={t.rating} />

                {/* Message */}
                <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)', lineHeight: 1.6, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  "{t.message}"
                </div>

                {/* Status badge */}
                <span style={{ alignSelf: 'flex-start', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: 99, background: t.is_published ? 'rgba(74,222,128,0.12)' : 'rgba(100,116,139,0.15)', color: t.is_published ? '#4ade80' : '#94a3b8', border: `1px solid ${t.is_published ? 'rgba(74,222,128,0.3)' : 'rgba(100,116,139,0.3)'}` }}>
                  {t.is_published ? 'Published' : 'Draft'}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--admin-border)' }}>
                  <button onClick={() => openEdit(t)} style={{ flex: 1, padding: '0.4rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <i className="bi bi-pencil-fill" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(t)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <i className="bi bi-trash3-fill" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <FormModal title={editing ? 'Edit Testimonial' : 'New Testimonial'} onClose={() => setShowForm(false)} onSubmit={handleSave} loading={saving} submitLabel={editing ? 'Update' : 'Add'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Avatar + name row */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => avatarRef.current?.click()}>
                {form.client_avatar_url
                  ? <img src={form.client_avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <i className="bi bi-camera-fill" style={{ color: 'var(--admin-accent)' }} />}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="text" placeholder="Client Name *" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} style={inp} autoFocus />
                <input type="text" placeholder="Title / Company" value={form.client_title} onChange={e => setForm(f => ({ ...f, client_title: e.target.value }))} style={inp} />
              </div>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>

            <div>
              <label style={lbl}>Message <span style={{ color: '#f87171' }}>*</span></label>
              <textarea placeholder="What the client said…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical' as const }} />
            </div>

            <div>
              <label style={lbl}>Rating</label>
              <Stars rating={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--admin-text-secondary)', fontWeight: 500 }}>
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
              Publish immediately
            </label>
          </div>
        </FormModal>
      )}

      {deleteTarget && (
        <ConfirmModal message={`Delete testimonial from "${deleteTarget.client_name}"?`} danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
    </AppLayout>
  );
}
