'use client';
import { useEffect } from 'react';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmModal({
  message, onConfirm, onCancel, loading,
  confirmLabel = 'Confirm', danger = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9100,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border-strong)',
          borderRadius: 14, width: '100%', maxWidth: 400,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.25rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`bi ${danger ? 'bi-trash3-fill' : 'bi-exclamation-triangle-fill'}`}
                style={{ color: danger ? '#f87171' : '#fbbf24', fontSize: '1rem' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text-primary)' }}>
              {danger ? 'Confirm Delete' : 'Are you sure?'}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--admin-border)',
          display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
        }}>
          <button onClick={onCancel} style={{
            padding: '0.5rem 1.25rem', borderRadius: 8,
            border: '1px solid var(--admin-border-strong)',
            background: 'transparent', color: 'var(--admin-text-secondary)',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none',
            background: danger ? '#ef4444' : 'var(--admin-accent)', color: '#fff',
            fontSize: '0.85rem', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontFamily: 'inherit',
          }}>
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
