'use client';
import { useEffect, useState } from 'react';
import ContentCard from '@/components/content/ContentCard';
import { ContentItem } from '@/types/content.types';

const card: React.CSSProperties = {
  background: 'var(--admin-card)',
  border: '1px solid var(--admin-border)',
  borderRadius: 'var(--admin-radius)',
  boxShadow: 'var(--admin-shadow)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  borderRadius: 10,
  border: '1px solid var(--admin-border-strong)',
  background: 'var(--admin-bg-secondary)',
  color: 'var(--admin-text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
  resize: 'vertical' as const,
};

export default function ProposedPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ type: 'reject' | 'changes'; id: string } | null>(null);
  const [comment, setComment] = useState('');
  const [acting, setActing] = useState(false);

  const fetchItems = () => {
    fetch('/api/portal/content?status=proposed')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setItems(data?.data ?? []); setLoading(false); });
  };

  useEffect(() => { fetchItems(); }, []);

  const handleApprove = async (id: string) => {
    setActing(true);
    await fetch(`/api/portal/content/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setItems(prev => prev.filter(i => i.id !== id));
    setActing(false);
  };

  const handleReject = async () => {
    if (!actionModal || !comment.trim()) return;
    setActing(true);
    await fetch(`/api/portal/content/${actionModal.id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: comment }),
    });
    setItems(prev => prev.filter(i => i.id !== actionModal.id));
    setActionModal(null); setComment(''); setActing(false);
  };

  const handleRequestChanges = async () => {
    if (!actionModal || !comment.trim()) return;
    setActing(true);
    await fetch(`/api/portal/content/${actionModal.id}/request-changes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
    setItems(prev => prev.filter(i => i.id !== actionModal.id));
    setActionModal(null); setComment(''); setActing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
          Proposed Content
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Review and approve content proposed for your accounts
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '3px solid var(--admin-border)',
            borderTopColor: 'var(--admin-accent)',
            animation: 'spin 0.7s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--admin-text-muted)' }}>
          <i className="bi bi-inbox" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>No content awaiting your review</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {items.map(item => (
            <ContentCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={(id) => setActionModal({ type: 'reject', id })}
              onRequestChanges={(id) => setActionModal({ type: 'changes', id })}
            />
          ))}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{ ...card, width: '100%', maxWidth: 460, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
              {actionModal.type === 'reject' ? 'Reject Content' : 'Request Changes'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginBottom: '1rem' }}>
              {actionModal.type === 'reject'
                ? 'Provide a reason for rejecting this content.'
                : 'Describe what changes you would like to see.'}
            </p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ ...inputStyle, minHeight: 100 }}
              placeholder={actionModal.type === 'reject' ? 'Reason for rejection...' : 'What needs to change...'}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={() => { setActionModal(null); setComment(''); }}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: 10,
                  border: '1px solid var(--admin-border-strong)',
                  background: 'transparent',
                  color: 'var(--admin-text-secondary)',
                  fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={actionModal.type === 'reject' ? handleReject : handleRequestChanges}
                disabled={acting || !comment.trim()}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: 10, border: 'none',
                  background: actionModal.type === 'reject' ? '#ef4444' : '#f59e0b',
                  color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                  cursor: acting || !comment.trim() ? 'not-allowed' : 'pointer',
                  opacity: acting || !comment.trim() ? 0.5 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {acting ? 'Submitting...' : actionModal.type === 'reject' ? 'Reject' : 'Submit Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
