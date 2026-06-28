'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import ConfirmModal from '@/components/ConfirmModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';

type Message = { id: number; sender_name: string; sender_email: string; subject: string | null; body: string; is_read: boolean; created_at: string };

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState(false);
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  const load = () => {
    setLoading(true);
    fetch('/api/messages').then(r => r.json()).then(d => { setMessages(d); setLoading(false); });
  };
  useEffect(load, []);

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    if (!msg.is_read) {
      await fetch(`/api/messages/${msg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_read: true }) });
      setMessages(m => m.map(x => x.id === msg.id ? { ...x, is_read: true } : x));
    }
  };

  const toggleRead = async (msg: Message, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/messages/${msg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_read: !msg.is_read }) });
    setMessages(m => m.map(x => x.id === msg.id ? { ...x, is_read: !x.is_read } : x));
    if (selected?.id === msg.id) setSelected(s => s ? { ...s, is_read: !s.is_read } : s);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/messages/${deleteTarget.id}`, { method: 'DELETE' });
    setMessages(m => m.filter(x => x.id !== deleteTarget.id));
    if (selected?.id === deleteTarget.id) setSelected(null);
    setDeleting(false); setDeleteTarget(null);
  };

  const filtered = filter === 'all' ? messages : messages.filter(m => !m.is_read);
  const unreadCount = messages.filter(m => !m.is_read).length;

  const listPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.35rem', padding: '0 0 0.75rem' }}>
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.35rem 0.85rem', borderRadius: 99, border: `1px solid ${filter === f ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: filter === f ? 'rgba(59,130,246,0.12)' : 'transparent', color: filter === f ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {f === 'all' ? `All (${messages.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.2, color: 'var(--admin-accent)', display: 'block', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>No messages</div>
          </div>
        ) : filtered.map(msg => (
          <div key={msg.id} onClick={() => openMessage(msg)} style={{ padding: '0.85rem 1rem', borderRadius: 10, cursor: 'pointer', background: selected?.id === msg.id ? 'rgba(59,130,246,0.1)' : msg.is_read ? 'var(--admin-card)' : 'rgba(59,130,246,0.06)', border: `1px solid ${selected?.id === msg.id ? 'rgba(59,130,246,0.3)' : 'var(--admin-border)'}`, transition: 'background 0.1s', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {!msg.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--admin-accent)', flexShrink: 0 }} />}
                <span style={{ fontSize: '0.85rem', fontWeight: msg.is_read ? 500 : 700, color: 'var(--admin-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{msg.sender_name}</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', flexShrink: 0 }}>{timeAgo(msg.created_at)}</span>
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: msg.is_read ? 400 : 600, color: 'var(--admin-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject || '(No subject)'}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>{msg.body}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const detailPanel = selected ? (
    <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)', padding: '1.5rem', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.35rem' }}>{selected.subject || '(No subject)'}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-person-fill" style={{ fontSize: '0.85rem', color: 'var(--admin-accent)' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>{selected.sender_name}</div>
              <a href={`mailto:${selected.sender_email}`} style={{ fontSize: '0.72rem', color: 'var(--admin-accent)' }}>{selected.sender_email}</a>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button onClick={e => toggleRead(selected, e)} title={selected.is_read ? 'Mark unread' : 'Mark read'} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className={`bi bi-${selected.is_read ? 'envelope' : 'envelope-open'}`} /> {selected.is_read ? 'Mark unread' : 'Mark read'}
          </button>
          <button onClick={() => setDeleteTarget(selected)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className="bi bi-trash3-fill" /> Delete
          </button>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{new Date(selected.created_at).toLocaleString()}</div>
      <div style={{ height: '1px', background: 'var(--admin-border)' }} />
      <div style={{ fontSize: '0.88rem', color: 'var(--admin-text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', flex: 1 }}>{selected.body}</div>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
        <a href={`mailto:${selected.sender_email}?subject=Re: ${encodeURIComponent(selected.subject ?? '')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', borderRadius: 10, background: 'var(--admin-accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
          <i className="bi bi-reply-fill" /> Reply via Email
        </a>
      </div>
    </div>
  ) : (
    <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', color: 'var(--admin-text-muted)', height: '100%' }}>
      <i className="bi bi-envelope-open" style={{ fontSize: '2rem', opacity: 0.2 }} />
      <div style={{ fontSize: '0.85rem' }}>Select a message to read</div>
    </div>
  );

  return (
    <AppLayout title="Messages" description="Admin">
      {unreadCount > 0 && (
        <div style={{ marginBottom: '0.75rem', padding: '0.6rem 1rem', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.82rem', color: 'var(--admin-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="bi bi-envelope-fill" /> {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
        </div>
      )}

      {isMobile ? (
        selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-accent)', fontSize: '0.85rem', fontWeight: 600, padding: 0, fontFamily: 'inherit' }}>
              <i className="bi bi-arrow-left" /> Back to inbox
            </button>
            <div style={{ minHeight: '60vh' }}>{detailPanel}</div>
          </div>
        ) : (
          <div style={{ minHeight: '60vh' }}>{listPanel}</div>
        )
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem', minHeight: 'calc(100vh - 120px)' }}>
          {listPanel}
          {detailPanel}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal message={`Delete message from "${deleteTarget.sender_name}"?`} danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
    </AppLayout>
  );
}
