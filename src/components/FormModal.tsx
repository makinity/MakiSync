'use client';
import { useEffect } from 'react';

interface FormModalProps {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
  children: React.ReactNode;
  submitLabel?: string;
}

export default function FormModal({ title, onClose, onSubmit, loading, children, submitLabel = 'Save' }: FormModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .form-modal-inner {
          background: var(--admin-card);
          border: 1px solid var(--admin-border-strong);
          border-radius: 14px;
          width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        @media (max-width: 767px) {
          .form-modal-inner {
            position: fixed; bottom: 0; left: 0; right: 0;
            border-radius: 20px 20px 0 0; max-width: 100%;
            animation: slideUp 0.25s ease;
          }
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div className="form-modal-inner" onClick={e => e.stopPropagation()}>
          {/* Mobile drag handle */}
          <div className="mobile-handle" style={{ display: 'none', justifyContent: 'center', padding: '0.5rem 0 0' }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--admin-border-strong)' }} />
          </div>
          <style>{`@media(max-width:767px){.mobile-handle{display:flex!important}}`}</style>

          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--admin-border)',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text-primary)' }}>{title}</span>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--admin-text-muted)', fontSize: '1rem', lineHeight: 1,
            }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: '1rem 1.25rem' }}>{children}</div>

          {/* Footer */}
          <div style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--admin-border)',
            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
          }}>
            <button onClick={onClose} style={{
              padding: '0.5rem 1.25rem', borderRadius: 8,
              border: '1px solid var(--admin-border-strong)',
              background: 'transparent', color: 'var(--admin-text-secondary)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>Cancel</button>
            <button onClick={onSubmit} disabled={loading} style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none',
              background: 'var(--admin-accent)', color: '#fff',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit',
            }}>
              {loading ? 'Saving…' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
