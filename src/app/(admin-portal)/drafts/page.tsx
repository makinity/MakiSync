'use client';
import { useEffect, useState } from 'react';
import ContentCard from '@/components/content/ContentCard';
import { ContentItem } from '@/types/content.types';

export default function DraftsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/content?status=draft')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setItems(data?.data ?? []); setLoading(false); });
  }, []);

  const handlePropose = async (id: string) => {
    await fetch(`/api/portal/content/${id}/propose`, { method: 'POST' });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
          Drafts
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Content not yet sent to clients
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
          <i className="bi bi-file-earmark-text" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>No drafts yet. Create content to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id}>
              <ContentCard item={item} showActions={false} />
              <button
                onClick={() => handlePropose(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  width: '100%', marginTop: '0.5rem',
                  padding: '0.5rem 0.75rem', borderRadius: 10, border: 'none',
                  background: 'rgba(59,130,246,0.12)', color: 'var(--admin-accent)',
                  fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.12)')}
              >
                <i className="bi bi-send" />
                Send to Client
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
