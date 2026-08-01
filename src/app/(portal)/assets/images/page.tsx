'use client';
import { useEffect, useState } from 'react';
import { Asset } from '@/types/asset.types';

export default function ImagesPage() {
  const [assets, setAssets]   = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(user => {
      if (user?.role === 'client') {
        fetch('/api/portal/clients').then(r => r.json()).then(data => {
          const list = data?.data ?? [];
          const my   = list.find((c: { user_id: number }) => c.user_id === user.id);
          if (my) {
            fetch(`/api/portal/assets?client_id=${my.id}&type=image`)
              .then(r => r.json()).then(d => { setAssets(d?.data ?? []); setLoading(false); });
          } else { setLoading(false); }
        });
      } else {
        setLoading(false);
      }
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>Images</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>{assets.length} image{assets.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.55rem 1rem', borderRadius: 10, border: 'none',
          background: 'var(--admin-accent)', color: '#fff',
          fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <i className="bi bi-upload" /> Upload Image
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : assets.length === 0 ? (
        <div style={{ ...card, padding: '4rem 1rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          <i className="bi bi-image" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>No images uploaded yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {assets.map(asset => (
            <div key={asset.id} style={{ ...card, overflow: 'hidden', position: 'relative', aspectRatio: '1' }}
              onMouseEnter={e => (e.currentTarget.querySelector('.asset-overlay') as HTMLElement | null)?.style.setProperty('opacity', '1')}
              onMouseLeave={e => (e.currentTarget.querySelector('.asset-overlay') as HTMLElement | null)?.style.setProperty('opacity', '0')}>
              <img src={asset.file_url} alt={asset.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="asset-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <button onClick={() => handleDelete(asset.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: 'none', background: 'rgba(248,113,113,0.9)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
