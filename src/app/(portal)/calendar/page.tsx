'use client';
import { useEffect, useState } from 'react';
import { ContentItem } from '@/types/content.types';
import { PLATFORM_LABELS } from '@/constants/platforms';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const PLATFORM_DOT: Record<string, string> = {
  facebook:  '#3b82f6',
  instagram: '#d946ef',
  tiktok:    '#94a3b8',
  linkedin:  '#0a66c2',
  twitter:   '#0ea5e9',
  youtube:   '#ef4444',
};

export default function CalendarPage() {
  const [items, setItems]           = useState<ContentItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/content?status=scheduled').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/content?status=published').then(r => r.ok ? r.json() : null),
    ]).then(([s, p]) => {
      setItems([...(s?.data ?? []), ...(p?.data ?? [])]);
      setLoading(false);
    });
  }, []);

  const year        = currentDate.getFullYear();
  const month       = currentDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();

  const getItemsForDay = (day: number) =>
    items.filter(item => {
      const d = new Date(item.scheduled_at ?? item.published_at ?? item.created_at);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const selectedItems = selectedDay ? getItemsForDay(selectedDay) : [];

  const card: React.CSSProperties = {
    background: 'var(--admin-card)',
    border: '1px solid var(--admin-border)',
    borderRadius: 'var(--admin-radius)',
    boxShadow: 'var(--admin-shadow)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
        Content Calendar
      </h2>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ ...card, padding: '1.25rem' }}>
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              style={{ padding: '0.4rem 0.6rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: '1rem', borderRadius: 8, transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <i className="bi bi-chevron-left" />
            </button>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
              {MONTHS[month]} {year}
            </h3>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              style={{ padding: '0.4rem 0.6rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: '1rem', borderRadius: 8, transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <i className="bi bi-chevron-right" />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--admin-text-muted)', padding: '0.35rem 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day      = i + 1;
              const dayItems = getItemsForDay(day);
              const isToday  = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const isSel    = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSel ? null : day)}
                  style={{
                    minHeight: 64, padding: '0.4rem', borderRadius: 10, textAlign: 'left',
                    background: isSel ? 'rgba(59,130,246,0.12)' : isToday ? 'rgba(59,130,246,0.06)' : 'transparent',
                    border: `1px solid ${isSel ? 'rgba(59,130,246,0.3)' : isToday ? 'rgba(59,130,246,0.2)' : 'var(--admin-border)'}`,
                    cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSel && !isToday) e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                  onMouseLeave={e => { if (!isSel && !isToday) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--admin-accent)' : 'var(--admin-text-secondary)' }}>{day}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 4 }}>
                    {dayItems.slice(0, 3).map(item => (
                      <div key={item.id} title={item.title} style={{ width: 7, height: 7, borderRadius: '50%', background: PLATFORM_DOT[item.platform] ?? 'var(--admin-text-muted)', flexShrink: 0 }} />
                    ))}
                    {dayItems.length > 3 && <span style={{ fontSize: '0.6rem', color: 'var(--admin-text-muted)' }}>+{dayItems.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Day detail */}
          {selectedDay && selectedItems.length > 0 && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.65rem' }}>
                {MONTHS[month]} {selectedDay} — {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'var(--admin-bg-secondary)', borderRadius: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PLATFORM_DOT[item.platform] ?? 'var(--admin-text-muted)', flexShrink: 0 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{PLATFORM_LABELS[item.platform] ?? item.platform} · {item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
