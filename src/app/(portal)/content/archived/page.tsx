'use client';
import { useEffect, useState } from 'react';
import ContentCard from '@/components/content/ContentCard';
import { ContentItem } from '@/types/content.types';

export default function ArchivedPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/content?status=archived')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setItems(data?.data ?? []); setLoading(false); });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
          Archived Content
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Rejected or expired content
        </p>
      </div>
      {loading ? <PageLoader /> : items.length === 0 ? (
        <EmptyState icon="bi-archive" message="No archived content" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {items.map(item => <ContentCard key={item.id} item={item} showActions={false} />)}
        </div>
      )}
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid var(--admin-border)',
        borderTopColor: 'var(--admin-accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--admin-text-muted)' }}>
      <i className={`bi ${icon}`} style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
      <p style={{ fontSize: '0.9rem' }}>{message}</p>
    </div>
  );
}
