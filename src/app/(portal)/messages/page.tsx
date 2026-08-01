'use client';
import { useEffect, useState, useRef } from 'react';

interface Message {
  id: string;
  sender_id: number;
  body: string;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [clientId, setClientId] = useState('');
  const [userId, setUserId]     = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(user => {
      setUserId(user?.id ?? 0);
      if (user?.role === 'client') {
        fetch('/api/portal/clients').then(r => r.json()).then(data => {
          const list = data?.data ?? [];
          const my = list.find((c: { user_id: number }) => c.user_id === user.id);
          if (my) {
            setClientId(my.id);
            fetch(`/api/portal/messages?client_id=${my.id}`)
              .then(r => r.json()).then(d => { setMessages(d?.data ?? []); setLoading(false); });
          } else { setLoading(false); }
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !clientId) return;
    setSending(true);
    const res = await fetch('/api/portal/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, body: input.trim() }),
    });
    if (res.ok) {
      const d = await res.json();
      setMessages(prev => [...prev, d.data]);
    }
    setInput('');
    setSending(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em', flexShrink: 0 }}>
        Messages
      </h2>

      <div style={{
        flex: 1, minHeight: 0,
        background: 'var(--admin-card)',
        border: '1px solid var(--admin-border)',
        borderRadius: 'var(--admin-radius)',
        boxShadow: 'var(--admin-shadow)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Message list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.7s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--admin-text-muted)', textAlign: 'center' }}>
              <div>
                <i className="bi bi-chat-dots" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.9rem' }}>No messages yet. Start a conversation!</p>
              </div>
            </div>
          ) : messages.map(msg => {
            const isMine = msg.sender_id === userId;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    padding: '0.6rem 1rem',
                    borderRadius: 18,
                    borderBottomRightRadius: isMine ? 4 : 18,
                    borderBottomLeftRadius: isMine ? 18 : 4,
                    background: isMine ? 'var(--admin-accent)' : 'var(--admin-bg-secondary)',
                    color: isMine ? '#fff' : 'var(--admin-text-primary)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  }}>
                    {msg.body}
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', marginTop: 3, textAlign: isMine ? 'right' : 'left' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--admin-border)', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: '0.6rem 0.85rem', borderRadius: 12,
              border: '1px solid var(--admin-border-strong)',
              background: 'var(--admin-bg-secondary)',
              color: 'var(--admin-text-primary)',
              fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button type="submit" disabled={sending || !input.trim()} style={{
            padding: '0.6rem 1rem', borderRadius: 12, border: 'none',
            background: 'var(--admin-accent)', color: '#fff',
            cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: sending || !input.trim() ? 0.5 : 1,
            fontSize: '1rem', transition: 'opacity 0.15s',
          }}>
            <i className="bi bi-send" />
          </button>
        </form>
      </div>
    </div>
  );
}
