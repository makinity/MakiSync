'use client';
import { ContentItem } from '@/types/content.types';
import { CONTENT_STATUS_LABELS } from '@/constants/contentStatus';
import { PLATFORM_LABELS } from '@/constants/platforms';

interface ContentCardProps {
  item: ContentItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  showActions?: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  draft:     { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8',  border: 'rgba(100,116,139,0.25)' },
  proposed:  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b',  border: 'rgba(245,158,11,0.25)'  },
  approved:  { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6',  border: 'rgba(59,130,246,0.25)'  },
  scheduled: { bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6',  border: 'rgba(139,92,246,0.25)'  },
  published: { bg: 'rgba(16,185,129,0.12)',  color: '#10b981',  border: 'rgba(16,185,129,0.25)'  },
  archived:  { bg: 'rgba(248,113,113,0.12)', color: '#f87171',  border: 'rgba(248,113,113,0.25)' },
};

const PLATFORM_STYLES: Record<string, { bg: string; color: string }> = {
  facebook:  { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
  instagram: { bg: 'rgba(217,70,239,0.15)',  color: '#d946ef' },
  tiktok:    { bg: 'rgba(0,0,0,0.18)',        color: 'var(--admin-text-primary)' },
  linkedin:  { bg: 'rgba(10,102,194,0.15)',   color: '#0a66c2' },
  twitter:   { bg: 'rgba(14,165,233,0.15)',   color: '#0ea5e9' },
  youtube:   { bg: 'rgba(239,68,68,0.15)',    color: '#ef4444' },
};

export default function ContentCard({
  item,
  onApprove,
  onReject,
  onRequestChanges,
  showActions = true,
}: ContentCardProps) {
  const statusLabel   = CONTENT_STATUS_LABELS[item.status] ?? item.status;
  const platformLabel = PLATFORM_LABELS[item.platform]     ?? item.platform;
  const statusStyle   = STATUS_STYLES[item.status]          ?? STATUS_STYLES.draft;
  const platformStyle = PLATFORM_STYLES[item.platform]     ?? { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };

  return (
    <div
      style={{
        background: 'var(--admin-card)',
        border: '1px solid var(--admin-border)',
        borderRadius: 'var(--admin-radius)',
        boxShadow: 'var(--admin-shadow)',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.25)')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--admin-border)')}
    >
      {/* Media preview */}
      {item.media && item.media.length > 0 && (
        <div style={{ aspectRatio: '16/9', background: 'var(--admin-bg-secondary)', position: 'relative', overflow: 'hidden' }}>
          <img
            src={item.media[0].file_url}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {item.media.length > 1 && (
            <span style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,0.65)', color: '#fff',
              fontSize: '0.68rem', fontWeight: 600,
              padding: '0.15rem 0.5rem', borderRadius: 99,
            }}>
              +{item.media.length - 1}
            </span>
          )}
        </div>
      )}

      <div style={{ padding: '0.9rem 1rem' }}>
        {/* Badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: 99,
            fontSize: '0.68rem', fontWeight: 600,
            background: platformStyle.bg, color: platformStyle.color,
            border: `1px solid ${platformStyle.bg}`,
          }}>
            {platformLabel}
          </span>
          <span style={{
            display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: 99,
            fontSize: '0.68rem', fontWeight: 600,
            background: statusStyle.bg, color: statusStyle.color,
            border: `1px solid ${statusStyle.border}`,
          }}>
            {statusLabel}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '0.875rem', fontWeight: 600,
          color: 'var(--admin-text-primary)',
          marginBottom: '0.25rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.title}
        </h3>

        {/* Caption */}
        {item.caption && (
          <p style={{
            fontSize: '0.75rem', color: 'var(--admin-text-muted)',
            marginBottom: '0.65rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {item.caption}
          </p>
        )}

        {/* Meta */}
        <div style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
          fontSize: '0.68rem', color: 'var(--admin-text-muted)',
          marginBottom: showActions && item.status === 'proposed' ? '0.75rem' : 0,
        }}>
          {item.scheduled_at && (
            <span><i className="bi bi-calendar" style={{ marginRight: 3 }} />{new Date(item.scheduled_at).toLocaleDateString()}</span>
          )}
          {item.published_at && (
            <span><i className="bi bi-check-circle" style={{ marginRight: 3 }} />{new Date(item.published_at).toLocaleDateString()}</span>
          )}
          {item.rejection_reason && (
            <span style={{ color: '#f87171' }}><i className="bi bi-x-circle" style={{ marginRight: 3 }} />{item.rejection_reason}</span>
          )}
          {!item.scheduled_at && !item.published_at && (
            <span><i className="bi bi-clock" style={{ marginRight: 3 }} />{new Date(item.created_at).toLocaleDateString()}</span>
          )}
        </div>

        {/* Action buttons — only for proposed status */}
        {showActions && item.status === 'proposed' && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {onApprove && (
              <ActionBtn label="Approve" icon="bi-check-lg" onClick={() => onApprove(item.id)}
                bg="rgba(16,185,129,0.12)" color="#10b981" hoverBg="rgba(16,185,129,0.22)" />
            )}
            {onRequestChanges && (
              <ActionBtn label="Changes" icon="bi-pencil" onClick={() => onRequestChanges(item.id)}
                bg="rgba(245,158,11,0.12)" color="#f59e0b" hoverBg="rgba(245,158,11,0.22)" />
            )}
            {onReject && (
              <ActionBtn label="Reject" icon="bi-x-lg" onClick={() => onReject(item.id)}
                bg="rgba(248,113,113,0.12)" color="#f87171" hoverBg="rgba(248,113,113,0.22)" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ label, icon, onClick, bg, color, hoverBg }: {
  label: string; icon: string; onClick: () => void;
  bg: string; color: string; hoverBg: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
        padding: '0.4rem 0.5rem', borderRadius: 8, border: 'none',
        background: bg, color,
        fontSize: '0.72rem', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background 0.15s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={e => (e.currentTarget.style.background = bg)}
    >
      <i className={`bi ${icon}`} style={{ fontSize: '0.78rem' }} />
      {label}
    </button>
  );
}
