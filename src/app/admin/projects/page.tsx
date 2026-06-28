'use client';
import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/AppLayout';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { uploadFile } from '@/lib/upload';

type Project = {
  id: number; title: string; description: string | null; cover_url: string | null;
  client: string | null; url: string | null; status: 'draft' | 'published';
  order: number; created_at: string;
};
const EMPTY: { title: string; description: string; cover_url: string; client: string; url: string; status: 'draft' | 'published' } = { title: '', description: '', cover_url: '', client: '', url: '', status: 'draft' };

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };
const card: React.CSSProperties = { background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)', boxShadow: 'var(--admin-shadow)' };

function StatusBadge({ status }: { status: string }) {
  const pub = status === 'published';
  return (
    <span style={{ display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600, textTransform: 'capitalize', background: pub ? 'rgba(59,130,246,0.12)' : 'rgba(100,116,139,0.15)', color: pub ? '#60a5fa' : '#94a3b8', border: `1px solid ${pub ? 'rgba(59,130,246,0.3)' : 'rgba(100,116,139,0.3)'}` }}>
      {status}
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/projects').then(r => r.json()).then(d => { setProjects(d); setLoading(false); });
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description ?? '', cover_url: p.cover_url ?? '', client: p.client ?? '', url: p.url ?? '', status: p.status });
    setShowForm(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingCover(true);
    try { const url = await uploadFile('projects', file); setForm(f => ({ ...f, cover_url: url })); }
    finally { setUploadingCover(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editing) {
      await fetch(`/api/projects/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false); setDeleteTarget(null); load();
  };

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    return (p.title.toLowerCase().includes(q) || (p.client ?? '').toLowerCase().includes(q))
      && (filter === 'all' || p.status === filter);
  });

  return (
    <AppLayout title="Projects" description="Admin">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : 1, minWidth: 200 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }} />
            <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: '2.25rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
            {(['all', 'published', 'draft'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1px solid ${filter === f ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: filter === f ? 'rgba(59,130,246,0.12)' : 'transparent', color: filter === f ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginLeft: isMobile ? 0 : 'auto', whiteSpace: 'nowrap' }}>
            <i className="bi bi-plus-lg" /> Add Project
          </button>
        </div>

        {/* Count */}
        {!loading && (
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` · ${filter}`}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ ...card, padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...card, padding: '3rem 2rem', textAlign: 'center' }}>
            <i className="bi bi-briefcase" style={{ fontSize: '2.5rem', opacity: 0.2, color: 'var(--admin-accent)', display: 'block', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>{search ? 'No projects match your search' : 'No projects yet'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Click "Add Project" to get started.</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : bp === 'tablet' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '1rem',
          }}>
            {filtered.map(p => (
              <div key={p.id} style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Cover */}
                <div onClick={() => p.cover_url && setLightbox(p.cover_url)} style={{ width: '100%', aspectRatio: '16/9', background: 'rgba(59,130,246,0.08)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: p.cover_url ? 'zoom-in' : 'default' }}>
                  {p.cover_url
                    ? <img src={p.cover_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <i className="bi bi-image" style={{ fontSize: '2rem', color: 'var(--admin-border-strong)' }} />}
                </div>

                {/* Body */}
                <div style={{ padding: '0.9rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)', lineHeight: 1.3 }}>{p.title}</div>
                    <StatusBadge status={p.status} />
                  </div>
                  {p.client && <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{p.client}</div>}
                  {p.description && <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</div>}
                  {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--admin-accent)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: 'auto' }}><i className="bi bi-box-arrow-up-right" /> View project</a>}
                </div>

                {/* Footer actions */}
                <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEdit(p)} style={{ padding: '0.3rem 0.7rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <i className="bi bi-pencil-fill" /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(p)} style={{ padding: '0.3rem 0.7rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <i className="bi bi-trash3-fill" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <FormModal title={editing ? 'Edit Project' : 'New Project'} onClose={() => setShowForm(false)} onSubmit={handleSave} loading={saving} submitLabel={editing ? 'Update' : 'Create'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={lbl}>Cover Image</label>
              <div
                onClick={() => coverRef.current?.click()}
                style={{
                  width: '100%', aspectRatio: '16/9', borderRadius: 10,
                  border: `2px dashed ${form.cover_url ? 'transparent' : 'var(--admin-border-strong)'}`,
                  background: form.cover_url ? 'transparent' : 'var(--admin-bg-secondary)',
                  overflow: 'hidden', position: 'relative', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.15s',
                }}
              >
                {form.cover_url ? (
                  <>
                    <img src={form.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <i className="bi bi-camera-fill" style={{ fontSize: '1.5rem', color: '#fff' }} />
                      <span style={{ fontSize: '0.78rem', color: '#fff', marginTop: '0.4rem', fontWeight: 600 }}>Change Image</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                    {uploadingCover
                      ? <><i className="bi bi-arrow-repeat" style={{ fontSize: '1.5rem', color: 'var(--admin-text-muted)' }} /><div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.4rem' }}>Uploading…</div></>
                      : <><i className="bi bi-cloud-upload-fill" style={{ fontSize: '1.8rem', color: 'var(--admin-text-muted)' }} /><div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>Click to upload cover</div><div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>JPG, PNG or WebP</div></>
                    }
                  </div>
                )}
              </div>
              <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleCoverUpload} />
            </div>

            <div>
              <label style={lbl}>Title <span style={{ color: '#f87171' }}>*</span></label>
              <input type="text" placeholder="My Project" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={lbl}>Client</label>
                <input type="text" placeholder="Client name" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} style={inp}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label style={lbl}>Project URL</label>
              <input type="url" placeholder="https://..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={inp} />
            </div>

            <div>
              <label style={lbl}>Description</label>
              <textarea placeholder="What was this project about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical' as const }} />
            </div>
          </div>
        </FormModal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmModal message={`Delete "${deleteTarget.title}"? This cannot be undone.`} danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'zoom-out' }}>
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 24px 60px rgba(0,0,0,0.6)', objectFit: 'contain' }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}
    </AppLayout>
  );
}
