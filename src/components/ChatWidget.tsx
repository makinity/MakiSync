'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = { role: 'user' | 'bot'; text: string };

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export default function ChatWidget() {
  const dark = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hi! I'm Maki's assistant. Ask me anything about his services, skills, or how to get in touch!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const t = {
    bg:         dark ? '#0f1623' : '#ffffff',
    card:       dark ? '#1a2235' : '#f1f5f9',
    border:     dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
    text:       dark ? '#e2e8f0' : '#1e293b',
    textMuted:  dark ? '#94a3b8' : '#64748b',
    accent:     '#3b82f6',
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const updated: Message[] = [...messages, { role: 'user', text }];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, text: m.text })) }),
      });
      const { reply } = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Something went wrong. Please try again.' }]);
    }
    setLoading(false);
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: t.accent, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(59,130,246,0.5)', color: '#fff', fontSize: 22,
        }}
      >
        <i className={`bi ${open ? 'bi-x-lg' : 'bi-chat-dots-fill'}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', bottom: 96, right: 28, zIndex: 999,
              width: 340, height: 460, borderRadius: 16,
              background: t.bg, border: `1px solid ${t.border}`,
              boxShadow: dark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px', background: t.accent, color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
              <i className="bi bi-robot" style={{ marginRight: 8 }} />
              Ask Maki&apos;s Assistant
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: t.bg }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '8px 12px', borderRadius: 12,
                    background: m.role === 'user' ? t.accent : t.card,
                    color: m.role === 'user' ? '#fff' : t.text,
                    fontSize: '0.88rem', lineHeight: 1.5,
                    border: m.role === 'bot' ? `1px solid ${t.border}` : 'none',
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '8px 14px', borderRadius: 12, background: t.card, border: `1px solid ${t.border}`, fontSize: '0.88rem', color: t.textMuted }}>
                    <i className="bi bi-three-dots" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '10px 12px', borderTop: `1px solid ${t.border}`, display: 'flex', gap: 8, background: t.bg }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10,
                  border: `1px solid ${t.border}`, background: t.card,
                  color: t.text, fontSize: '0.88rem', outline: 'none',
                }}
              />
              <motion.button
                onClick={send} whileTap={{ scale: 0.9 }}
                disabled={loading || !input.trim()}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none',
                  background: t.accent, color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: loading || !input.trim() ? 0.5 : 1,
                }}
              >
                <i className="bi bi-send-fill" style={{ fontSize: 14 }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
