'use client';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface DashboardCounts {
  waiting_approval: number;
  scheduled: number;
  published_this_month: number;
  unread_messages: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  body: string | null;
  created_at: string;
}

interface Testimonial {
  id: number;
  message: string;
  rating: number;
  is_published: boolean;
  updated_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const card: React.CSSProperties = {
  background: 'var(--admin-card)',
  border: '1px solid var(--admin-border)',
  borderRadius: 'var(--admin-radius)',
  boxShadow: 'var(--admin-shadow)',
};

// ─── Star Rating Component ────────────────────────────────────────────────────

function StarRating({
  rating,
  onChange,
  size = '1.2rem',
}: {
  rating: number;
  onChange?: (r: number) => void;
  size?: string;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '0.2rem' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= (hovered || rating);
        return (
          <i
            key={i}
            className={`bi bi-star${filled ? '-fill' : ''}`}
            onClick={() => onChange?.(i)}
            onMouseEnter={() => onChange && setHovered(i)}
            onMouseLeave={() => onChange && setHovered(0)}
            style={{
              color: filled ? '#facc15' : 'var(--admin-border-strong)',
              fontSize: size,
              cursor: onChange ? 'pointer' : 'default',
              transition: 'color 0.15s',
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────

function TestimonialCard() {
  const [testimonial, setTestimonial] = useState<Testimonial | null | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  // Load existing testimonial on mount
  useEffect(() => {
    fetch('/api/portal/testimonial')
      .then(r => r.ok ? r.json() : null)
      .then(res => {
        const data = res?.data ?? null;
        setTestimonial(data);
        if (data) {
          setRating(data.rating);
          setMessage(data.message);
        }
      })
      .catch(() => setTestimonial(null));
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters.');
      return;
    }

    setSaving(true);
    const method = testimonial ? 'PUT' : 'POST';
    const res = await fetch('/api/portal/testimonial', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, message: message.trim() }),
    });
    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.message ?? 'Something went wrong. Please try again.');
      return;
    }

    setTestimonial(json.data);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (testimonial) {
      setRating(testimonial.rating);
      setMessage(testimonial.message);
    }
    setError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (testimonial) {
      setRating(testimonial.rating);
      setMessage(testimonial.message);
    } else {
      setRating(5);
      setMessage('');
    }
    setError('');
    setIsEditing(false);
  };

  // Still loading
  if (testimonial === undefined) return null;

  // ── Already submitted — show review ──────────────────────────────────────
  if (testimonial && !isEditing) {
    return (
      <div style={{
        ...card,
        padding: isMobile ? '1rem' : '1.25rem',
        border: '1px solid rgba(74,222,128,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(74,222,128,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="bi bi-patch-check-fill" style={{ color: '#4ade80', fontSize: '0.85rem' }} />
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
              Your Review
            </span>
          </div>
          <button
            onClick={handleEdit}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.3rem 0.75rem', borderRadius: 8,
              border: '1px solid var(--admin-border-strong)',
              background: 'transparent', color: 'var(--admin-text-secondary)',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <i className="bi bi-pencil-fill" style={{ fontSize: '0.65rem' }} /> Edit
          </button>
        </div>

        {/* Stars */}
        <StarRating rating={testimonial.rating} size="1rem" />

        {/* Message */}
        <p style={{
          fontSize: '0.85rem', color: 'var(--admin-text-secondary)',
          lineHeight: 1.6, fontStyle: 'italic',
          margin: '0.6rem 0 0.5rem',
        }}>
          &ldquo;{testimonial.message}&rdquo;
        </p>

        {/* Status */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.68rem', fontWeight: 700,
          padding: '0.15rem 0.55rem', borderRadius: 99,
          background: testimonial.is_published ? 'rgba(74,222,128,0.12)' : 'rgba(100,116,139,0.15)',
          color: testimonial.is_published ? '#4ade80' : '#94a3b8',
          border: `1px solid ${testimonial.is_published ? 'rgba(74,222,128,0.3)' : 'rgba(100,116,139,0.3)'}`,
        }}>
          <i className={`bi bi-${testimonial.is_published ? 'eye-fill' : 'hourglass-split'}`} />
          {testimonial.is_published ? 'Published' : 'Pending approval'}
        </span>
      </div>
    );
  }

  // ── Form — new or editing ─────────────────────────────────────────────────
  return (
    <div style={{ ...card, padding: isMobile ? '1rem' : '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(250,204,21,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="bi bi-star-fill" style={{ color: '#facc15', fontSize: '0.85rem' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)', margin: 0 }}>
            {testimonial ? 'Edit Your Review' : 'Rate Your Experience'}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', margin: 0 }}>
            {testimonial
              ? 'Your updated review will be re-reviewed before publishing.'
              : 'How has working with MakiSync been?'}
          </p>
        </div>
      </div>

      {/* Star picker */}
      <div style={{ marginBottom: '0.85rem' }}>
        <StarRating rating={rating} onChange={setRating} size="1.4rem" />
      </div>

      {/* Message textarea */}
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Share your experience working with MakiSync…"
        rows={4}
        style={{
          width: '100%', padding: '0.65rem 0.85rem',
          borderRadius: 10, border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--admin-border-strong)'}`,
          background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)',
          fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
          resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
        }}
      />

      {/* Validation error */}
      {error && (
        <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.35rem' }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', justifyContent: 'flex-end' }}>
        {(testimonial || isEditing) && (
          <button
            onClick={handleCancel}
            style={{
              padding: '0.45rem 1rem', borderRadius: 8,
              border: '1px solid var(--admin-border)',
              background: 'transparent', color: 'var(--admin-text-muted)',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            padding: '0.45rem 1.25rem', borderRadius: 8, border: 'none',
            background: saving ? 'rgba(59,130,246,0.5)' : 'var(--admin-accent)',
            color: '#fff', fontSize: '0.82rem', fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          {saving && (
            <span style={{
              width: 12, height: 12, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              animation: 'spin 0.7s linear infinite',
              display: 'inline-block',
            }} />
          )}
          {saving ? 'Submitting…' : testimonial ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u?.username) setUsername(u.username); });

    Promise.all([
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/notifications').then(r => r.ok ? r.json() : null),
    ]).then(([dashData, notifData]) => {
      if (dashData?.data) setCounts(dashData.data);
      if (notifData?.data) setActivities(notifData.data.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const STAT_CARDS = [
    {
      label: 'Waiting Approval',
      value: counts?.waiting_approval ?? '—',
      icon: 'bi-inbox',
      color: '#f59e0b',
    },
    {
      label: 'Scheduled Posts',
      value: counts?.scheduled ?? '—',
      icon: 'bi-calendar-check',
      color: '#8b5cf6',
    },
    {
      label: 'Published This Month',
      value: counts?.published_this_month ?? '—',
      icon: 'bi-check-circle',
      color: '#10b981',
    },
    {
      label: 'Unread Messages',
      value: counts?.unread_messages ?? '—',
      icon: 'bi-chat-dots',
      color: '#3b82f6',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '3px solid var(--admin-border)',
          borderTopColor: 'var(--admin-accent)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Greeting */}
      <div>
        <h1 style={{
          fontSize: isMobile ? '1.1rem' : '1.3rem',
          fontWeight: 800,
          color: 'var(--admin-text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Welcome back{username ? `, ${username}` : ''}! 👋
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
          Here&apos;s what&apos;s happening with your campaigns.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '0.65rem' : '1rem',
      }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ ...card, padding: isMobile ? '0.75rem' : '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{
                fontSize: isMobile ? '0.65rem' : '0.72rem',
                fontWeight: 600,
                color: 'var(--admin-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {s.label}
              </span>
              <div style={{
                width: isMobile ? 26 : 32,
                height: isMobile ? 26 : 32,
                borderRadius: 8,
                background: `${s.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: isMobile ? '0.75rem' : '0.9rem' }} />
              </div>
            </div>
            <div style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 800,
              color: 'var(--admin-text-primary)',
              lineHeight: 1,
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial prompt */}
      <TestimonialCard />

      {/* Recent Activity */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid var(--admin-border)',
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
            Recent Activity
          </span>
        </div>

        {activities.length === 0 ? (
          <div style={{
            padding: '2.5rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--admin-text-muted)',
          }}>
            No recent activity yet.
          </div>
        ) : (
          <div>
            {activities.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  borderBottom: i < activities.length - 1 ? '1px solid var(--admin-border)' : 'none',
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--admin-accent)',
                  marginTop: '0.35rem',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    color: 'var(--admin-text-primary)',
                  }}>
                    {a.title}
                  </p>
                  {a.body && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--admin-text-muted)',
                      marginTop: '0.15rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {a.body}
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  color: 'var(--admin-text-muted)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {timeAgo(a.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
