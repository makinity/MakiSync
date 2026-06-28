'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';

type FAQ = { id: number; question: string; answer: string; is_published: boolean; order: number };
const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', is_published: true });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/content/faqs').then(r => r.json()).then(d => { setFaqs(d); setLoading(false); });
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ question: '', answer: '', is_published: true }); setShowForm(true); };
  const openEdit = (f: FAQ) => { setEditing(f); setForm({ question: f.question, answer: f.answer, is_published: f.is_published }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    if (editing) {
      await fetch(`/api/content/faqs/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/content/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
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
    <AppLayout title="FAQ" description="Admin / Content">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{faqs.length} question{faqs.length !== 1 ? 's' : ''}</div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <i className="bi bi-plus-lg" /> Add FAQ
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>
        ) : faqs.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)' }}>
            <i className="bi bi-question-circle" style={{ fontSize: '2.5rem', opacity: 0.2, color: 'var(--admin-accent)', display: 'block', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>No FAQs yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {faqs.map(f => (
              <div key={f.id} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 12, overflow: 'hidden', opacity: f.is_published ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem', cursor: 'pointer' }} onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
                  <i className={`bi bi-chevron-${expanded === f.id ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>{f.question}</span>
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => togglePublish(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: f.is_published ? '#4ade80' : 'var(--admin-text-muted)', padding: '0.2rem' }}>
                      <i className={`bi bi-${f.is_published ? 'eye-fill' : 'eye-slash'}`} />
                    </button>
                    <button onClick={() => openEdit(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--admin-text-muted)', padding: '0.2rem' }}>
                      <i className="bi bi-pencil-fill" />
                    </button>
                    <button onClick={() => setDeleteTarget(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#f87171', padding: '0.2rem' }}>
                      <i className="bi bi-trash3-fill" />
                    </button>
                  </div>
                </div>
                {expanded === f.id && (
                  <div style={{ padding: '0 1rem 1rem 2.5rem', fontSize: '0.83rem', color: 'var(--admin-text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--admin-border)', paddingTop: '0.75rem' }}>
                    {f.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <FormModal title={editing ? 'Edit FAQ' : 'New FAQ'} onClose={() => setShowForm(false)} onSubmit={handleSave} loading={saving} submitLabel={editing ? 'Update' : 'Add'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={lbl}>Question <span style={{ color: '#f87171' }}>*</span></label>
              <input type="text" placeholder="e.g. What services do you offer?" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} style={inp} autoFocus />
            </div>
            <div>
              <label style={lbl}>Answer <span style={{ color: '#f87171' }}>*</span></label>
              <textarea placeholder="Your answer…" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} rows={5} style={{ ...inp, resize: 'vertical' as const }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--admin-text-secondary)', fontWeight: 500 }}>
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
              Publish immediately
            </label>
          </div>
        </FormModal>
      )}

      {deleteTarget && (
        <ConfirmModal message="Delete this FAQ?" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
    </AppLayout>
  );
}
