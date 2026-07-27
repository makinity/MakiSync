'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';

// ── Types ────────────────────────────────────────────────
type Config = {
  id: number; enabled: boolean; scan_interval: string; auto_notify: boolean;
  min_match_score: number; exclude_keywords: string[]; notify_channel: string;
  notify_frequency: string; updated_at: string;
};
type Group = { id: number; name: string; url: string; status: string; last_scan: string | null; order: number; created_at: string };
type Skill = { id: number; name: string; order: number };
type Match = { id: number; group_id: number | null; group_name: string | null; title: string; content: string | null; author: string | null; post_url: string | null; match_score: number | null; notified: boolean; status: string; created_at: string };

// ── Style Constants ──────────────────────────────────────
const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };
const card: React.CSSProperties = { background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)', boxShadow: 'var(--admin-shadow)' };
const pill = (active: boolean): React.CSSProperties => ({
  display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: 99,
  fontSize: '0.68rem', fontWeight: 600, textTransform: 'capitalize',
  background: active ? 'rgba(59,130,246,0.12)' : 'rgba(100,116,139,0.15)',
  color: active ? '#60a5fa' : '#94a3b8',
  border: `1px solid ${active ? 'rgba(59,130,246,0.3)' : 'rgba(100,116,139,0.3)'}`,
});

const INTERVALS = ['15m', '30m', '1h', '2h', '6h', '12h'];
function scoreLabel(score: number): string {
  if (score >= 95) return 'Very Strict';
  if (score >= 85) return 'Strict';
  if (score >= 70) return 'Balanced';
  return 'Loose';
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Main Page ────────────────────────────────────────────
export default function JobHunterPage() {
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  // Data
  const [config, setConfig] = useState<Config | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [groupForm, setGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupFormName, setGroupFormName] = useState('');
  const [groupFormUrl, setGroupFormUrl] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);

  const [skillForm, setSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillFormName, setSkillFormName] = useState('');
  const [savingSkill, setSavingSkill] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'group' | 'skill'; item: Group | Skill } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // ── Load Data ────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    const [c, g, s, m] = await Promise.all([
      fetch('/api/jobhunter/config').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/jobhunter/groups').then(r => r.json()).catch(() => []),
      fetch('/api/jobhunter/skills').then(r => r.json()).catch(() => []),
      fetch('/api/jobhunter/matches?limit=20').then(r => r.json()).catch(() => []),
    ]);
    setConfig(c);
    setGroups(g);
    setSkills(s);
    setMatches(m);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // ── Config Toggle ────────────────────────────────────────
  const toggleEnabled = async () => {
    if (!config) return;
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    await fetch('/api/jobhunter/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
  };

  const updateConfig = async (patch: Partial<Config>) => {
    if (!config) return;
    const updated = { ...config, ...patch };
    setConfig(updated);
    await fetch('/api/jobhunter/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
  };

  // ── Group CRUD ───────────────────────────────────────────
  const openCreateGroup = () => { setEditingGroup(null); setGroupFormName(''); setGroupFormUrl(''); setGroupForm(true); };
  const openEditGroup = (g: Group) => { setEditingGroup(g); setGroupFormName(g.name); setGroupFormUrl(g.url); setGroupForm(true); };

  const saveGroup = async () => {
    if (!groupFormName.trim() || !groupFormUrl.trim()) return;
    setSavingGroup(true);
    if (editingGroup) {
      await fetch(`/api/jobhunter/groups/${editingGroup.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: groupFormName, url: groupFormUrl, status: editingGroup.status }) });
    } else {
      await fetch('/api/jobhunter/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: groupFormName, url: groupFormUrl }) });
    }
    setSavingGroup(false); setGroupForm(false); load();
  };

  const toggleGroupStatus = async (g: Group) => {
    const newStatus = g.status === 'active' ? 'paused' : 'active';
    await fetch(`/api/jobhunter/groups/${g.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: g.name, url: g.url, status: newStatus }) });
    load();
  };

  // ── Skill CRUD ───────────────────────────────────────────
  const openCreateSkill = () => { setEditingSkill(null); setSkillFormName(''); setSkillForm(true); };
  const openEditSkill = (s: Skill) => { setEditingSkill(s); setSkillFormName(s.name); setSkillForm(true); };

  const saveSkill = async () => {
    if (!skillFormName.trim()) return;
    setSavingSkill(true);
    if (editingSkill) {
      await fetch(`/api/jobhunter/skills/${editingSkill.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: skillFormName }) });
    } else {
      await fetch('/api/jobhunter/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: skillFormName }) });
    }
    setSavingSkill(false); setSkillForm(false); load();
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const endpoint = deleteTarget.type === 'group'
      ? `/api/jobhunter/groups/${deleteTarget.item.id}`
      : `/api/jobhunter/skills/${deleteTarget.item.id}`;
    await fetch(endpoint, { method: 'DELETE' });
    setDeleting(false); setDeleteTarget(null); load();
  };

  // ── Manual Scan ──────────────────────────────────────────
  const triggerScan = async () => {
    setScanning(true); setScanResult(null);
    try {
      const res = await fetch('/api/jobhunter/scan', { method: 'POST' });
      const data = await res.json();
      setScanResult(data.ok ? data.message : data.error);
    } catch {
      setScanResult('Scan failed');
    }
    setScanning(false);
    setTimeout(() => setScanResult(null), 5000);
  };

  // ── Match Status Update ──────────────────────────────────
  const updateMatchStatus = async (id: number, status: string) => {
    await fetch(`/api/jobhunter/matches/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  if (loading) {
    return (
      <AppLayout title="JobHunter AI">
        <div style={{ ...card, padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>
      </AppLayout>
    );
  }

  const activeGroups = groups.filter(g => g.status === 'active').length;
  const totalMatches = matches.length;

  return (
    <AppLayout title="JobHunter AI">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ── Header + Status Bar ─────────────────────────── */}
        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-search-heart" style={{ color: 'var(--admin-accent)' }} />
              JobHunter AI
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
              AI-powered SMM/VA job monitoring assistant
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={triggerScan} disabled={scanning || !config?.enabled} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: scanning || !config?.enabled ? 'not-allowed' : 'pointer', opacity: scanning || !config?.enabled ? 0.5 : 1, fontFamily: 'inherit' }}>
              <i className={`bi ${scanning ? 'bi-arrow-repeat' : 'bi-play-fill'}`} style={scanning ? { animation: 'spin 1s linear infinite' } : {}} />
              {scanning ? 'Scanning…' : 'Scan Now'}
            </button>
          </div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

        {/* Scan result toast */}
        {scanResult && (
          <div style={{ padding: '0.65rem 1rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, background: scanResult.includes('disabled') || scanResult.includes('failed') ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', color: scanResult.includes('disabled') || scanResult.includes('failed') ? '#f87171' : '#4ade80', border: `1px solid ${scanResult.includes('disabled') || scanResult.includes('failed') ? '#f87171' : '#4ade80'}` }}>
            {scanResult}
          </div>
        )}

        {/* ── Status Cards ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Status', value: config?.enabled ? 'Active' : 'Inactive', icon: 'bi-circle-fill', color: config?.enabled ? '#4ade80' : '#94a3b8' },
            { label: 'Groups', value: `${activeGroups}/${groups.length}`, icon: 'bi-facebook', color: '#3b82f6' },
            { label: 'Skills', value: skills.length, icon: 'bi-lightning-charge-fill', color: '#facc15' },
            { label: 'Matches', value: totalMatches, icon: 'bi-bullseye', color: '#c084fc' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: isMobile ? '0.75rem' : '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '0.8rem' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text-primary)', lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── General Settings ────────────────────────────── */}
        <div style={{ ...card, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-gear-fill" style={{ color: 'var(--admin-accent)', fontSize: '0.9rem' }} />
            General Settings
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
            {/* Master Toggle */}
            <div>
              <label style={lbl}>Monitoring</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={toggleEnabled} style={{ width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: config?.enabled ? 'var(--admin-accent)' : '#cbd5e1', transition: 'background 0.2s', display: 'flex', alignItems: 'center', padding: '0 3px', flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s', transform: config?.enabled ? 'translateX(22px)' : 'translateX(0)' }} />
                </button>
                <span style={{ fontSize: '0.82rem', color: config?.enabled ? '#4ade80' : 'var(--admin-text-muted)', fontWeight: 600 }}>
                  {config?.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Scan Interval */}
            <div>
              <label style={lbl}>Scan Interval</label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {INTERVALS.map(iv => (
                  <button key={iv} onClick={() => updateConfig({ scan_interval: iv })} style={{ padding: '0.4rem 0.75rem', borderRadius: 99, border: `1px solid ${config?.scan_interval === iv ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: config?.scan_interval === iv ? 'rgba(59,130,246,0.12)' : 'transparent', color: config?.scan_interval === iv ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {iv}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Notify */}
            <div>
              <label style={lbl}>Auto-Notify</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => updateConfig({ auto_notify: !config?.auto_notify })} style={{ width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: config?.auto_notify ? 'var(--admin-accent)' : '#cbd5e1', transition: 'background 0.2s', display: 'flex', alignItems: 'center', padding: '0 3px', flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s', transform: config?.auto_notify ? 'translateX(22px)' : 'translateX(0)' }} />
                </button>
                <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)', fontWeight: 600 }}>
                  {config?.auto_notify ? 'On' : 'Off'}
                </span>
              </div>
            </div>

            {/* Min Match Score */}
            <div>
              <label style={lbl}>Match Strictness — {scoreLabel(config?.min_match_score ?? 70)} ({config?.min_match_score ?? 70}%)</label>
              <input type="range" min={50} max={95} step={5} value={config?.min_match_score ?? 70}
                onChange={e => updateConfig({ min_match_score: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--admin-accent)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--admin-text-muted)' }}>
                <span>Loose (50%)</span><span>Strict (95%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Facebook Groups ─────────────────────────────── */}
        <div style={{ ...card, padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-facebook" style={{ color: '#3b82f6', fontSize: '0.95rem' }} />
              Facebook Groups
            </div>
            <button onClick={openCreateGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <i className="bi bi-plus-lg" /> Add Group
            </button>
          </div>
          {groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
              <i className="bi bi-facebook" style={{ fontSize: '2rem', opacity: 0.2, display: 'block', marginBottom: '0.5rem' }} />
              No groups yet. Add Facebook groups to monitor.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groups.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.85rem', background: 'var(--admin-bg-secondary)', borderRadius: 10, border: '1px solid var(--admin-border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="bi bi-facebook" style={{ color: '#3b82f6', fontSize: '0.85rem' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>Last scan: {timeAgo(g.last_scan)}</div>
                  </div>
                  <span style={pill(g.status === 'active')}>{g.status}</span>
                  <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                    <button onClick={() => toggleGroupStatus(g)} title={g.status === 'active' ? 'Pause' : 'Resume'} style={{ padding: '0.3rem 0.55rem', borderRadius: 7, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <i className={`bi ${g.status === 'active' ? 'bi-pause-fill' : 'bi-play-fill'}`} />
                    </button>
                    <button onClick={() => openEditGroup(g)} title="Edit" style={{ padding: '0.3rem 0.55rem', borderRadius: 7, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <i className="bi bi-pencil-fill" />
                    </button>
                    <button onClick={() => setDeleteTarget({ type: 'group', item: g })} title="Delete" style={{ padding: '0.3rem 0.55rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <i className="bi bi-trash3-fill" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── AI Matching Skills ──────────────────────────── */}
        <div style={{ ...card, padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-lightning-charge-fill" style={{ color: '#facc15', fontSize: '0.9rem' }} />
              Matching Skills
            </div>
            <button onClick={openCreateSkill} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <i className="bi bi-plus-lg" /> Add Skill
            </button>
          </div>
          {skills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
              No skills yet. Add skills for AI matching.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {skills.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-accent)' }}>
                  {s.name}
                  <button onClick={() => openEditSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-accent)', fontSize: '0.7rem', padding: 0, display: 'flex', opacity: 0.6 }}>
                    <i className="bi bi-pencil-fill" />
                  </button>
                  <button onClick={() => setDeleteTarget({ type: 'skill', item: s })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '0.7rem', padding: 0, display: 'flex', opacity: 0.6 }}>
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Notification Settings ───────────────────────── */}
        <div style={{ ...card, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-bell-fill" style={{ color: '#4ade80', fontSize: '0.9rem' }} />
            Notifications
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
            {/* Channel */}
            <div>
              <label style={lbl}>Channel</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {(['telegram', 'email', 'both'] as const).map(ch => (
                  <button key={ch} onClick={() => updateConfig({ notify_channel: ch })} style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1px solid ${config?.notify_channel === ch ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: config?.notify_channel === ch ? 'rgba(59,130,246,0.12)' : 'transparent', color: config?.notify_channel === ch ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label style={lbl}>Frequency</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {(['instant', 'digest'] as const).map(f => (
                  <button key={f} onClick={() => updateConfig({ notify_frequency: f })} style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1px solid ${config?.notify_frequency === f ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: config?.notify_frequency === f ? 'rgba(59,130,246,0.12)' : 'transparent', color: config?.notify_frequency === f ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                    {f === 'instant' ? 'Instant' : '2x Daily Digest'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--admin-bg-secondary)', borderRadius: 10, border: '1px solid var(--admin-border)', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            <i className="bi bi-info-circle" style={{ marginRight: '0.35rem' }} />
            Telegram bot token and chat ID are configured in environment variables. Email notifications coming soon.
          </div>
        </div>

        {/* ── Recent Matches ──────────────────────────────── */}
        <div style={{ ...card, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-bullseye" style={{ color: '#c084fc', fontSize: '0.9rem' }} />
            Recent Matches
          </div>
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
              <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.2, display: 'block', marginBottom: '0.5rem' }} />
              No matches yet. Enable monitoring and add groups to start scanning.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', minWidth: isMobile ? 400 : 'auto' }}>
                <thead>
                  <tr>
                    {['Job', 'Score', 'Group', 'Status', 'When', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.35rem 0.5rem', fontSize: '0.68rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--admin-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matches.map(m => (
                    <tr key={m.id}>
                      <td style={{ padding: '0.55rem 0.5rem', color: 'var(--admin-text-primary)', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.post_url ? <a href={m.post_url} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-accent)', textDecoration: 'none' }}>{m.title}</a> : m.title}
                      </td>
                      <td style={{ padding: '0.55rem 0.5rem' }}>
                        <span style={{ ...pill(true), background: (m.match_score ?? 0) >= 80 ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)', color: (m.match_score ?? 0) >= 80 ? '#4ade80' : '#facc15', border: `1px solid ${(m.match_score ?? 0) >= 80 ? 'rgba(74,222,128,0.3)' : 'rgba(250,204,21,0.3)'}` }}>
                          {m.match_score ?? '—'}%
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem 0.5rem', color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>{m.group_name ?? '—'}</td>
                      <td style={{ padding: '0.55rem 0.5rem' }}>
                        <span style={{ ...pill(m.status === 'new'), background: m.status === 'new' ? 'rgba(59,130,246,0.12)' : m.status === 'applied' ? 'rgba(74,222,128,0.12)' : 'rgba(100,116,139,0.15)', color: m.status === 'new' ? '#60a5fa' : m.status === 'applied' ? '#4ade80' : '#94a3b8', border: `1px solid ${m.status === 'new' ? 'rgba(59,130,246,0.3)' : m.status === 'applied' ? 'rgba(74,222,128,0.3)' : 'rgba(100,116,139,0.3)'}` }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem 0.5rem', color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>{timeAgo(m.created_at)}</td>
                      <td style={{ padding: '0.55rem 0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {m.status === 'new' && (
                            <>
                              <button onClick={() => updateMatchStatus(m.id, 'applied')} title="Mark Applied" style={{ padding: '0.2rem 0.45rem', borderRadius: 6, border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)', color: '#4ade80', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                <i className="bi bi-check-lg" />
                              </button>
                              <button onClick={() => updateMatchStatus(m.id, 'ignored')} title="Ignore" style={{ padding: '0.2rem 0.45rem', borderRadius: 6, border: '1px solid rgba(100,116,139,0.3)', background: 'rgba(100,116,139,0.08)', color: '#94a3b8', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                <i className="bi bi-x-lg" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Group Create/Edit Modal ──────────────────────── */}
      {groupForm && (
        <FormModal title={editingGroup ? 'Edit Group' : 'Add Facebook Group'} onClose={() => setGroupForm(false)} onSubmit={saveGroup} loading={savingGroup} submitLabel={editingGroup ? 'Update' : 'Add'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={lbl}>Group Name <span style={{ color: '#f87171' }}>*</span></label>
              <input type="text" placeholder="e.g. Virtual Assistant Philippines" value={groupFormName} onChange={e => setGroupFormName(e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Group URL <span style={{ color: '#f87171' }}>*</span></label>
              <input type="url" placeholder="https://facebook.com/groups/..." value={groupFormUrl} onChange={e => setGroupFormUrl(e.target.value)} style={inp} />
            </div>
          </div>
        </FormModal>
      )}

      {/* ── Skill Create/Edit Modal ──────────────────────── */}
      {skillForm && (
        <FormModal title={editingSkill ? 'Edit Skill' : 'Add Skill'} onClose={() => setSkillForm(false)} onSubmit={saveSkill} loading={savingSkill} submitLabel={editingSkill ? 'Update' : 'Add'}>
          <div>
            <label style={lbl}>Skill Name <span style={{ color: '#f87171' }}>*</span></label>
            <input type="text" placeholder="e.g. Social Media Management" value={skillFormName} onChange={e => setSkillFormName(e.target.value)} style={inp} />
          </div>
        </FormModal>
      )}

      {/* ── Delete Confirm ───────────────────────────────── */}
      {deleteTarget && (
        <ConfirmModal
          message={`Delete "${deleteTarget.item.name}"? This cannot be undone.`}
          danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
        />
      )}
    </AppLayout>
  );
}
