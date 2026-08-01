'use client';
import { useState, useEffect, useRef } from 'react';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/portal/notifications');
      if (!res.ok) return;
      const data = await res.json();
      const list: Notification[] = data.data ?? [];
      setNotifications(list.slice(0, 10));
      setUnreadCount(data.unread_count ?? 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/portal/notifications/read-all', { method: 'POST' });
    setNotifications(n => n.map(x => ({ ...x, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        style={{
          position: 'relative',
          padding: '0.4rem 0.5rem',
          borderRadius: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--admin-text-muted)',
          fontSize: '1.1rem',
          transition: 'background 0.15s, color 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
          e.currentTarget.style.color = 'var(--admin-text-primary)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = 'var(--admin-text-muted)';
        }}
      >
        <i className="bi bi-bell" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              background: '#f87171',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 700,
              width: 16,
              height: 16,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            width: 320,
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-border)',
            borderRadius: 14,
            boxShadow: 'var(--admin-shadow)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--admin-border)',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--admin-text-primary)',
              }}
            >
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: 'var(--admin-accent)',
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  color: 'var(--admin-text-muted)',
                }}
              >
                No notifications yet
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    padding: '0.7rem 1rem',
                    borderBottom:
                      i < notifications.length - 1
                        ? '1px solid var(--admin-border)'
                        : 'none',
                    background: !n.is_read
                      ? 'rgba(59,130,246,0.04)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background = 'rgba(59,130,246,0.06)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = !n.is_read
                      ? 'rgba(59,130,246,0.04)'
                      : 'transparent')
                  }
                >
                  {/* Unread dot */}
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: !n.is_read ? 'var(--admin-accent)' : 'transparent',
                      border: !n.is_read ? 'none' : '1px solid var(--admin-border)',
                      marginTop: '0.35rem',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--admin-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p
                        style={{
                          fontSize: '0.73rem',
                          color: 'var(--admin-text-muted)',
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.body}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--admin-text-muted)',
                        marginTop: 3,
                      }}
                    >
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
