'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';

type Service = { id: number; title: string; description: string | null; icon: string | null; order: number };

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };

// Suggested Bootstrap Icons for SMM/VA services
const ICON_SUGGESTIONS = [
  'bi-megaphone-fill','bi-instagram','bi-facebook','bi-linkedin','bi-twitter-x',
  'bi-camera-fill','bi-pencil-fill','bi-graph-up-arrow','bi-envelope-fill',
  'bi-calendar-check-fill','bi-people-fill','bi-chat-dots-fill','bi-star-fill',
  'bi-laptop-fill','bi-phone-fill','bi-bar-chart-fill','bi-bullseye',
  'bi-brush-fill','bi-image-fill','bi-play-btn-fill','bi-badge-ad-fill',
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ title: '', description: '', icon: 'bi-box-seam-fill' });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  const load = () => {
    setLoading(true);
    fetch('/api/services').then(r => r.json()).then(d => { setServices(d); setLoading(false); });
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', icon: 'bi-box-seam-fill' }); setShowForm(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ title: s.title, description: s.description ?? '', icon: s.icon ?? 'bi-box-seam-fill' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editing) {
      await fetch(`/api/services/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/services/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false); setDeleteTarget(null); load();
  };

  const cols = isMobile ? 1 : bp === 'tablet' ? 2 : 3;

  return (
    <AppLayout title="Services" description="Admin">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>{services.length} service{services.length !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <i className="bi bi-plus-lg" /> Add Service
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>
        ) : services.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)' }}>
            <i className="bi bi-box-seam" style={{ fontSize: '2.5rem', opacity: 0.2, color: 'var(--admin-accent)', display: 'block', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>No services yet</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Add the services you offer to clients.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}>
            {services.map((s, idx) => (
              <div key={s.id} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: 'var(--admin-shadow)', position: 'relative', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--admin-border-strong)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--admin-border)')}>

                {/* Order badge */}
                <span style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--admin-text-muted)', background: 'var(--admin-bg-secondary)', borderRadius: 6, padding: '0.15rem 0.4rem' }}>#{idx + 1}</span>

                {/* Icon */}
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                  <i className={`bi ${s.icon || 'bi-box-seam-fill'}`} style={{ fontSize: '1.3rem', color: 'var(--admin-accent)' }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.4rem' }}>{s.title}</div>
                  {s.description && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {s.description}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--admin-border)' }}>
                  <button onClick={() => openEdit(s)} style={{ flex: 1, padding: '0.4rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <i className="bi bi-pencil-fill" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(s)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
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
        <FormModal title={editing ? 'Edit Service' : 'New Service'} onClose={() => setShowForm(false)} onSubmit={handleSave} loading={saving} submitLabel={editing ? 'Update' : 'Add'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={lbl}>Title <span style={{ color: '#f87171' }}>*</span></label>
              <input type="text" placeholder="e.g. Social Media Management" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} autoFocus />
            </div>

            <div>
              <label style={lbl}>Description</label>
              <textarea placeholder="Describe what this service includes…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical' as const }} />
            </div>

            {/* Icon picker */}
            <div>
              <label style={lbl}>Icon</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {ICON_SUGGESTIONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))} style={{ aspectRatio: '1/1', borderRadius: 8, border: `1.5px solid ${form.icon === icon ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: form.icon === icon ? 'rgba(59,130,246,0.12)' : 'var(--admin-bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.1s' }}>
                    <i className={`bi ${icon}`} style={{ color: form.icon === icon ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '1rem' }} />
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${form.icon || 'bi-box-seam-fill'}`} style={{ color: 'var(--admin-accent)' }} />
                </div>
                <input type="text" placeholder="bi-custom-icon" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={{ ...inp, flex: 1 }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '0.3rem' }}>
                Pick from above or type any Bootstrap Icon class
              </div>
            </div>
          </div>
        </FormModal>
      )}

      {deleteTarget && (
        <ConfirmModal message={`Delete "${deleteTarget.title}"?`} danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
    </AppLayout>
  );
}
