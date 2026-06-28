'use client';
import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/AppLayout';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { uploadFile } from '@/lib/upload';

type Cert = {
  id: number; title: string; issuer: string | null;
  issue_date: string | null; expiry_date: string | null;
  credential_url: string | null; image_url: string | null; order: number;
};

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };
const EMPTY = { title: '', issuer: '', issue_date: '', expiry_date: '', credential_url: '', image_url: '' };

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function isExpired(expiry: string | null) {
  if (!expiry) return false;
  return new Date(expiry) < new Date();
}

export default function CertificationsPage() {
  const [items, setItems] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cert | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Cert | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  const load = () => {
    setLoading(true);
    fetch('/api/certifications').then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); };
  const openEdit = (c: Cert) => {
    setEditing(c);
    setForm({ title: c.title, issuer: c.issuer ?? '', issue_date: c.issue_date?.split('T')[0] ?? '', expiry_date: c.expiry_date?.split('T')[0] ?? '', credential_url: c.credential_url ?? '', image_url: c.image_url ?? '' });
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadFile('certifications', file); setForm(f => ({ ...f, image_url: url })); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editing) {
      await fetch(`/api/certifications/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/certifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/certifications/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false); setDeleteTarget(null); load();
  };

  const cols = isMobile ? 1 : bp === 'tablet' ? 2 : 3;

  return (
    <AppLayout title="Certifications" description="Admin">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
            {items.length} certification{items.length !== 1 ? 's' : ''}
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <i className="bi bi-plus-lg" /> Add Certification
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)' }}>
            <i className="bi bi-award" style={{ fontSize: '2.5rem', opacity: 0.2, color: 'var(--admin-accent)', display: 'block', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>No certifications yet</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Add your certificates and credentials.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}>
            {items.map(c => {
              const expired = isExpired(c.expiry_date);
              return (
                <div key={c.id} style={{ background: 'var(--admin-card)', border: `1px solid ${expired ? 'rgba(248,113,113,0.25)' : 'var(--admin-border)'}`, borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--admin-shadow)', display: 'flex', flexDirection: 'column' }}>
                  {/* Certificate image */}
                  <div onClick={() => c.image_url && setLightbox(c.image_url)} style={{ width: '100%', aspectRatio: '16/9', background: 'rgba(59,130,246,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: c.image_url ? 'zoom-in' : 'default', overflow: 'hidden', position: 'relative' }}>
                    {c.image_url
                      ? <img src={c.image_url} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <i className="bi bi-award-fill" style={{ fontSize: '2.5rem', color: 'rgba(59,130,246,0.2)' }} />}
                    {expired && (
                      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(248,113,113,0.9)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 99 }}>EXPIRED</div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)', lineHeight: 1.3 }}>{c.title}</div>
                    {c.issuer && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className="bi bi-building" /> {c.issuer}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      {c.issue_date && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <i className="bi bi-calendar-check" /> Issued {fmtDate(c.issue_date)}
                        </span>
                      )}
                      {c.expiry_date && (
                        <span style={{ fontSize: '0.72rem', color: expired ? '#f87171' : 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <i className="bi bi-calendar-x" /> Expires {fmtDate(c.expiry_date)}
                        </span>
                      )}
                    </div>
                    {c.credential_url && (
                      <a href={c.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--admin-accent)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
                        <i className="bi bi-patch-check-fill" /> View Credential
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--admin-border)', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openEdit(c)} style={{ flex: 1, padding: '0.4rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      <i className="bi bi-pencil-fill" /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(c)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <i className="bi bi-trash3-fill" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <FormModal title={editing ? 'Edit Certification' : 'New Certification'} onClose={() => setShowForm(false)} onSubmit={handleSave} loading={saving} submitLabel={editing ? 'Update' : 'Add'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Image */}
            <div>
              <label style={lbl}>Certificate Image</label>
              <div onClick={() => fileRef.current?.click()} style={{ width: '100%', aspectRatio: '16/9', borderRadius: 10, border: `2px dashed ${form.image_url ? 'transparent' : 'var(--admin-border-strong)'}`, background: form.image_url ? 'transparent' : 'var(--admin-bg-secondary)', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {form.image_url
                  ? <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ textAlign: 'center' }}>
                      {uploading
                        ? <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Uploading…</div>
                        : <><i className="bi bi-cloud-upload-fill" style={{ fontSize: '1.8rem', color: 'var(--admin-text-muted)' }} /><div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.35rem' }}>Click to upload</div></>
                      }
                    </div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
            </div>

            <div>
              <label style={lbl}>Title <span style={{ color: '#f87171' }}>*</span></label>
              <input type="text" placeholder="e.g. Meta Social Media Marketing" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} autoFocus />
            </div>

            <div>
              <label style={lbl}>Issuer</label>
              <input type="text" placeholder="e.g. Meta, Google, HubSpot…" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} style={inp} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={lbl}>Issue Date</label>
                <input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} style={inp} />
              </div>
            </div>

            <div>
              <label style={lbl}>Credential URL</label>
              <input type="url" placeholder="https://..." value={form.credential_url} onChange={e => setForm(f => ({ ...f, credential_url: e.target.value }))} style={inp} />
            </div>
          </div>
        </FormModal>
      )}

      {deleteTarget && (
        <ConfirmModal message={`Delete "${deleteTarget.title}"?`} danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'zoom-out' }}>
          <img src={lightbox} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}
    </AppLayout>
  );
}
