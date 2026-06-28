'use client';
import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/AppLayout';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { uploadFile } from '@/lib/upload';

type Category = { id: number; name: string; slug: string };
type GalleryItem = { id: number; image_url: string; title: string | null; description: string | null; category_id: number | null; category_name: string | null; order: number; created_at: string };

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<number | 'all'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ image_url: '', title: '', description: '', category_id: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Category add / edit / delete
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [savingCat, setSavingCat] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState(false);

  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/gallery').then(r => r.json()),
      fetch('/api/gallery/categories').then(r => r.json()),
    ]).then(([g, c]) => { setItems(g); setCategories(c); setLoading(false); });
  };
  useEffect(loadAll, []);

  const openCreate = () => { setEditing(null); setForm({ image_url: '', title: '', description: '', category_id: '' }); setShowForm(true); };
  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({ image_url: item.image_url, title: item.title ?? '', description: item.description ?? '', category_id: item.category_id?.toString() ?? '' });
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadFile('gallery', file); setForm(f => ({ ...f, image_url: url })); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.image_url) return;
    setSaving(true);
    const body = { image_url: form.image_url, title: form.title, description: form.description, category_id: form.category_id ? +form.category_id : null };
    if (editing) {
      await fetch(`/api/gallery/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setSaving(false); setShowForm(false); loadAll();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/gallery/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false); setDeleteTarget(null); loadAll();
  };

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    setSavingCat(true);
    await fetch('/api/gallery/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCat }) });
    setSavingCat(false); setNewCat(''); setShowCatForm(false); loadAll();
  };

  const handleEditCategory = async () => {
    if (!editCat || !editCatName.trim()) return;
    setSavingCat(true);
    await fetch(`/api/gallery/categories/${editCat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editCatName }) });
    setSavingCat(false); setEditCat(null); loadAll();
  };

  const handleDeleteCategory = async () => {
    if (!deleteCat) return;
    setDeletingCat(true);
    await fetch(`/api/gallery/categories/${deleteCat.id}`, { method: 'DELETE' });
    setDeletingCat(false); setDeleteCat(null);
    if (filterCat === deleteCat.id) setFilterCat('all');
    loadAll();
  };

  const filtered = filterCat === 'all' ? items : items.filter(i => i.category_id === filterCat);
  const cols = isMobile ? 1 : bp === 'tablet' ? 2 : 3;

  return (
    <AppLayout title="Gallery" description="Admin">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
            <button onClick={() => setFilterCat('all')} style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1px solid ${filterCat === 'all' ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: filterCat === 'all' ? 'rgba(59,130,246,0.12)' : 'transparent', color: filterCat === 'all' ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
              All ({items.length})
            </button>
            {categories.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', flexShrink: 0 }}>
                <button onClick={() => setFilterCat(c.id)} style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1px solid ${filterCat === c.id ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: filterCat === c.id ? 'rgba(59,130,246,0.12)' : 'transparent', color: filterCat === c.id ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  {c.name} ({items.filter(i => i.category_id === c.id).length})
                </button>
                <button onClick={() => { setEditCat(c); setEditCatName(c.name); }} title="Rename" style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', flexShrink: 0 }}>
                  <i className="bi bi-pencil-fill" />
                </button>
                <button onClick={() => setDeleteCat(c)} title="Delete" style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', flexShrink: 0 }}>
                  <i className="bi bi-trash3-fill" />
                </button>
              </div>
            ))}
            <button onClick={() => setShowCatForm(true)} style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: '1px dashed var(--admin-border)', background: 'transparent', color: 'var(--admin-text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <i className="bi bi-plus-lg" /> Category
            </button>
          </div>

          {/* Upload button */}
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <i className="bi bi-cloud-upload-fill" /> Upload
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)' }}>
            <i className="bi bi-images" style={{ fontSize: '2.5rem', opacity: 0.2, color: 'var(--admin-accent)', display: 'block', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>No photos yet</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Click "Upload" to add your first photo.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.85rem' }}>
            {filtered.map(item => (
              <div key={item.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1/1', cursor: 'zoom-in', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                onClick={() => setLightbox(item.image_url)}>
                {/* Image */}
                <img src={item.image_url} alt={item.title ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

                {/* Gradient overlay — always visible at bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)', padding: '1.5rem 0.85rem 0.75rem' }}>
                  {item.title && <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{item.title}</div>}
                  {item.description && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.15rem' }}>{item.description}</div>}
                </div>

                {/* Action buttons — top right, show on hover */}
                <div className="gallery-actions" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.3rem', opacity: 0, transition: 'opacity 0.15s' }}>
                  <button onClick={e => { e.stopPropagation(); openEdit(item); }} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    <i className="bi bi-pencil-fill" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteTarget(item); }} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.9)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    <i className="bi bi-trash3-fill" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover CSS for action buttons */}
      <style>{`.gallery-actions { opacity: 0 !important; } div:hover > .gallery-actions { opacity: 1 !important; }`}</style>

      {/* Upload / Edit Modal */}
      {showForm && (
        <FormModal title={editing ? 'Edit Photo' : 'Upload Photo'} onClose={() => setShowForm(false)} onSubmit={handleSave} loading={saving} submitLabel={editing ? 'Update' : 'Upload'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Image upload area */}
            <div>
              <label style={lbl}>Photo</label>
              <div onClick={() => !editing && fileRef.current?.click()} style={{ width: '100%', aspectRatio: '1/1', borderRadius: 10, border: `2px dashed ${form.image_url ? 'transparent' : 'var(--admin-border-strong)'}`, background: form.image_url ? 'transparent' : 'var(--admin-bg-secondary)', overflow: 'hidden', cursor: editing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {form.image_url ? (
                  <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    {uploading
                      ? <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Uploading…</div>
                      : <><i className="bi bi-cloud-upload-fill" style={{ fontSize: '2rem', color: 'var(--admin-text-muted)' }} /><div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>Click to upload</div><div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>JPG, PNG or WebP</div></>
                    }
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleUpload} />
            </div>

            <div>
              <label style={lbl}>Title</label>
              <input type="text" placeholder="Add a title…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
            </div>

            <div>
              <label style={lbl}>Description</label>
              <textarea placeholder="Optional description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' as const }} />
            </div>

            <div>
              <label style={lbl}>Category</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={inp}>
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </FormModal>
      )}

      {/* Add Category Modal */}
      {showCatForm && (
        <FormModal title="New Category" onClose={() => setShowCatForm(false)} onSubmit={handleAddCategory} loading={savingCat} submitLabel="Add">
          <div>
            <label style={lbl}>Category Name</label>
            <input type="text" placeholder="e.g. Adventures, Travel, Work…" value={newCat} onChange={e => setNewCat(e.target.value)} style={inp} autoFocus />
          </div>
        </FormModal>
      )}

      {/* Edit Category Modal */}
      {editCat && (
        <FormModal title="Rename Category" onClose={() => setEditCat(null)} onSubmit={handleEditCategory} loading={savingCat} submitLabel="Save">
          <div>
            <label style={lbl}>Category Name</label>
            <input type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)} style={inp} autoFocus />
          </div>
        </FormModal>
      )}

      {/* Delete Category Confirm */}
      {deleteCat && (
        <ConfirmModal message={`Delete "${deleteCat.name}"? Photos in this category will become uncategorised.`} danger onConfirm={handleDeleteCategory} onCancel={() => setDeleteCat(null)} loading={deletingCat} />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmModal message="Delete this photo? This cannot be undone." danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'zoom-out' }}>
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}
    </AppLayout>
  );
}
