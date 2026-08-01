'use client';
import { useEffect, useState } from 'react';
import { Asset } from '@/types/asset.types';

const MIME_ICON: Record<string, string> = {
  'application/pdf': 'bi-file-earmark-pdf',
  'application/msword': 'bi-file-earmark-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'bi-file-earmark-word',
};

export default function DocumentsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(user => {
      if (user?.role === 'client') {
        fetch('/api/portal/clients').then(r => r.json()).then(data => {
          const my = (data?.data ?? []).find((c: { user_id: number }) => c.user_id === user.id);
          if (my) {
            fetch(`/api/portal/assets?client_id=${my.id}&type=document`)
              .then(r => r.json()).then(d => { setAssets(d?.data ?? []); setLoading(false); });
          } else { setLoading(false); }
        });
      } else { setLoading(false); }
    });
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/portal/assets/${id}`, { method: 'DELETE' });
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const card: React.CSSProperties = {
    background: 'var(--admin-card)',
    border: '1px solid var(--admin-border)',
    borderRadius: 'var(--admin-radius)',
    boxShadow: 'var(--admin-shadow)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>Documents</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
            {assets.length} document{assets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <i className="bi bi-upload" /> Upload Document
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : assets.length === 0 ? (
        <div style={{ ...card, padding: '4rem 1rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          <i className="bi bi-file-earmark" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>No documents uploaded yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {assets.map(asset => (
            <div key={asset.id} style={{ ...card, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <i
                className={`bi ${MIME_ICON[asset.mime_type ?? ''] ?? 'bi-file-earmark'}`}
                style={{ fontSize: '1.5rem', color: 'var(--admin-accent)', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {asset.file_name}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                  {asset.file_size ? `${(asset.file_size / 1024).toFixed(0)} KB` : 'Unknown size'} · {new Date(asset.created_at).toLocaleDateString()}
                </p>
              </div>
              <a href={asset.file_url} target="_blank" rel="noreferrer"
                style={{ color: 'var(--admin-accent)', fontSize: '1rem', padding: '0.25rem', borderRadius: 6, textDecoration: 'none', transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                <i className="bi bi-download" />
              </a>
              <button onClick={() => handleDelete(asset.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: '1rem', padding: '0.25rem', borderRadius: 6, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--admin-text-muted)')}>
                <i className="bi bi-trash" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
