'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  published: '#3b82f6',
  draft: '#6f83a6',
};

function timeAgo(dateStr: string) {
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

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [username, setUsername] = useState('');
  const bp = useBreakpoint();

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData);
    fetch('/api/auth/me').then(r => r.json()).then(u => u?.username && setUsername(u.username));
  }, []);

  const isDark = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') !== 'light'
    : true;
  const mutedColor  = isDark ? '#6f83a6' : '#64748b';
  const gridColor   = isDark ? 'rgba(140,171,214,0.1)' : 'rgba(59,130,246,0.1)';
  const tooltipBg   = isDark ? '#0f1724' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(59,130,246,0.22)' : 'rgba(59,130,246,0.2)';

  const stats = data?.stats;
  const isMobile = bp === 'mobile';
  const isDesktop = bp === 'desktop';

  const STAT_CARDS = [
    {
      label: 'Projects', icon: 'bi-briefcase-fill', color: '#3b82f6',
      value: stats?.projects.total ?? '—',
      sub: `${stats?.projects.published ?? 0} published · ${stats?.projects.draft ?? 0} draft`,
    },
    {
      label: 'Messages', icon: 'bi-envelope-fill',
      color: stats?.messages?.unread > 0 ? '#f87171' : '#4ade80',
      value: stats?.messages.total ?? '—',
      sub: stats?.messages?.unread > 0 ? `${stats.messages.unread} unread` : 'All read',
    },
    {
      label: 'Testimonials', icon: 'bi-chat-quote-fill', color: '#c084fc',
      value: stats?.testimonials.total ?? '—',
      sub: `${stats?.testimonials.published ?? 0} published`,
    },
    {
      label: 'Certifications', icon: 'bi-award-fill', color: '#facc15',
      value: stats?.certifications ?? '—',
      sub: 'Total earned',
    },
  ];

  return (
    <AppLayout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Greeting */}
        <div>
          <h1 style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
            Welcome back{username ? `, ${username}` : ''}! 👋
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
            Here&apos;s what&apos;s happening with your portfolio.
          </p>
        </div>

        {/* Stat Cards — 2 col mobile, 4 col desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '0.65rem' : '1rem',
        }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} style={{ ...card, padding: isMobile ? '0.75rem' : '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: isMobile ? '0.65rem' : '0.72rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s.label}
                </span>
                <div style={{ width: isMobile ? 26 : 32, height: isMobile ? 26 : 32, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: isMobile ? '0.75rem' : '0.9rem' }} />
                </div>
              </div>
              <div style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: 'var(--admin-text-primary)', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Charts — side by side on desktop/tablet, stacked on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr minmax(220px, 260px)',
          gap: '1rem',
        }}>
          {/* Messages line chart */}
          <div style={{ ...card, padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem' }}>
              Messages — Last 30 Days
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
              <LineChart data={data?.messagesChart ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke={gridColor} strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: mutedColor }} tickLine={false} axisLine={false} interval={isMobile ? 6 : 4} />
                <YAxis tick={{ fontSize: 9, fill: mutedColor }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: '0.78rem' }} cursor={{ stroke: 'var(--admin-accent)', strokeWidth: 1 }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Projects donut */}
          <div style={{ ...card, padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
              Projects by Status
            </div>
            {data?.projectsByStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
                <PieChart>
                  <Pie data={data.projectsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {data.projectsByStatus.map((entry: any) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#6f83a6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: '0.78rem' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', textTransform: 'capitalize' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: isMobile ? 160 : 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
                No projects yet
              </div>
            )}
          </div>
        </div>

        {/* Profile completion + Recent messages — stacked on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '1rem',
        }}>
          {/* Profile completion */}
          <div style={{ ...card, padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>Profile Completion</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--admin-accent)' }}>{data?.profileCompletion ?? 0}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--admin-border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${data?.profileCompletion ?? 0}%`,
                background: data?.profileCompletion === 100 ? '#4ade80' : 'var(--admin-accent)',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.45rem' }}>
              {data?.profileCompletion === 100 ? 'Profile is complete ✓' : 'Fill in your profile to improve your portfolio.'}
            </p>
          </div>

          {/* Recent messages */}
          <div style={{ ...card, padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.65rem' }}>Recent Messages</div>
            {data?.recentMessages?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {data.recentMessages.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="bi bi-person-fill" style={{ fontSize: '0.8rem', color: 'var(--admin-accent)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.sender_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.subject || m.sender_email}</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', flexShrink: 0 }}>{timeAgo(m.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>No messages yet.</div>
            )}
          </div>
        </div>

        {/* Recent projects */}
        <div style={{ ...card, padding: '1rem 1.25rem', overflowX: 'auto' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.65rem' }}>Recent Projects</div>
          {data?.recentProjects?.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', minWidth: isMobile ? 280 : 'auto' }}>
              <thead>
                <tr>
                  {['Title', 'Status', 'Added'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.35rem 0.5rem', fontSize: '0.68rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--admin-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentProjects.map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ padding: '0.55rem 0.5rem', color: 'var(--admin-text-primary)', fontWeight: 500 }}>{p.title}</td>
                    <td style={{ padding: '0.55rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: 99,
                        fontSize: '0.68rem', fontWeight: 600, textTransform: 'capitalize',
                        background: p.status === 'published' ? 'rgba(59,130,246,0.12)' : 'rgba(100,116,139,0.15)',
                        color: p.status === 'published' ? '#60a5fa' : '#94a3b8',
                        border: `1px solid ${p.status === 'published' ? 'rgba(59,130,246,0.3)' : 'rgba(100,116,139,0.3)'}`,
                      }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '0.55rem 0.5rem', color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>{timeAgo(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>No projects yet.</div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
