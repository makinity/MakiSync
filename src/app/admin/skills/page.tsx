'use client';
import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/AppLayout';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { uploadFile } from '@/lib/upload';

type Skill = { id: number; name: string; logo_url: string | null; category: string | null; order: number };

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };

// Pastel colors per category
const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  default: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
};
function catColor(cat: string | null) {
  const seed = (cat ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const palette = [
    { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa' },
    { bg: 'rgba(192,132,252,0.12)', color: '#c084fc' },
    { bg: 'rgba(74,222,128,0.12)',  color: '#4ade80' },
    { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
    { bg: 'rgba(249,115,22,0.12)',  color: '#f97316' },
    { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
  ];
  return palette[seed % palette.length];
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState({ name: '', logo_url: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  const load = () => {
    setLoading(true);
    fetch('/api/skills').then(r => r.json()).then(d => { setSkills(d); setLoading(false); });
  };
  useEffect(load, []);

  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category).filter(Boolean))) as string[]];

  const openCreate = () => { setEditing(null); setForm({ name: '', logo_url: '', category: '' }); setShowForm(true); };
  const openEdit = (s: Skill) => { setEditing(s); setForm({ name: s.name, logo_url: s.logo_url ?? '', category: s.category ?? '' }); setShowForm(true); };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadFile('general', file, `skills/${Date.now()}-${file.name}`); setForm(f => ({ ...f, logo_url: url })); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editing) {
      await fetch(`/api/skills/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/skills/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false); setDeleteTarget(null); load();
  };

  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterCat === 'all' || s.category === filterCat)
  );

  const cols = isMobile ? 2 : bp === 'tablet' ? 3 : 4;

  return (
    <AppLayout title="Skills" description="Admin">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }} />
            <input type="text" placeholder="Search skills..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: '2.25rem' }} />
          </div>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCat(c)} style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1px solid ${filterCat === c ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: filterCat === c ? 'rgba(59,130,246,0.12)' : 'transparent', color: filterCat === c ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                {c === 'all' ? `All (${skills.length})` : c}
              </button>
            ))}
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            <i className="bi bi-plus-lg" /> Add Skill
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)' }}>
            <i className="bi bi-lightning-charge" style={{ fontSize: '2.5rem', opacity: 0.2, color: 'var(--admin-accent)', display: 'block', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>{search ? 'No skills match your search' : 'No skills yet'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Click "Add Skill" to get started.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.85rem' }}>
            {filtered.map(s => {
              const cc = catColor(s.category);
              return (
                <div key={s.id} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem', position: 'relative', boxShadow: 'var(--admin-shadow)', transition: 'border-color 0.15s', textAlign: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--admin-border-strong)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--admin-border)')}>

                  {/* Logo */}
                  <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', background: cc.bg, border: `1px solid ${cc.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {s.logo_url
                      ? <img src={s.logo_url} alt={s.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                      : <i className="bi bi-lightning-charge-fill" style={{ fontSize: '1.4rem', color: cc.color }} />}
                  </div>

                  {/* Name */}
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-primary)', lineHeight: 1.2 }}>{s.name}</div>

                  {/* Category badge */}
                  {s.category && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 99, background: cc.bg, color: cc.color, border: `1px solid ${cc.color}44` }}>
                      {s.category}
                    </span>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                    <button onClick={() => openEdit(s)} style={{ padding: '0.3rem 0.65rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-muted)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <i className="bi bi-pencil-fill" /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(s)} style={{ padding: '0.3rem 0.65rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
        <FormModal title={editing ? 'Edit Skill' : 'New Skill'} onClose={() => setShowForm(false)} onSubmit={handleSave} loading={saving} submitLabel={editing ? 'Update' : 'Add'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Logo */}
            <div>
              <label style={lbl}>Logo / Icon</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', background: 'rgba(59,130,246,0.08)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
                  {form.logo_url
                    ? <img src={form.logo_url} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                    : <i className="bi bi-image" style={{ color: 'var(--admin-text-muted)', fontSize: '1.4rem' }} />}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '0.45rem 0.9rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {uploading ? 'Uploading…' : 'Upload Logo'}
                  </button>
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '0.3rem' }}>PNG, SVG or WebP recommended</div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </div>
            </div>

            <div>
              <label style={lbl}>Skill Name <span style={{ color: '#f87171' }}>*</span></label>
              <input type="text" placeholder="e.g. Canva, Adobe Photoshop…" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} autoFocus />
            </div>

            <div>
              <label style={lbl}>Category</label>
              <input type="text" placeholder="e.g. Design, Social Media, Tools…" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp} list="cat-suggestions" />
              <datalist id="cat-suggestions">
                {Array.from(new Set(skills.map(s => s.category).filter(Boolean))).map(c => (
                  <option key={c} value={c!} />
                ))}
              </datalist>
            </div>
          </div>
        </FormModal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmModal message={`Delete "${deleteTarget.name}"?`} danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
    </AppLayout>
  );
}
