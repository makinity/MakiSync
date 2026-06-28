'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/layouts/AppLayout';
import { uploadFile } from '@/lib/upload';

const TABS = [
  { key: 'website', label: 'Website', icon: 'bi-globe' },
  { key: 'account', label: 'Account', icon: 'bi-person-gear' },
] as const;
type TabKey = typeof TABS[number]['key'];

const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block' };
const card: React.CSSProperties = { background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius)', padding: '1.25rem', boxShadow: 'var(--admin-shadow)', display: 'flex', flexDirection: 'column', gap: '1rem' };

function SaveBtn({ loading, saved, onClick }: { loading: boolean; saved: boolean; onClick: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
      {saved && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ Saved</span>}
      <button onClick={onClick} disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'var(--admin-accent)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}

// ── Website Tab ──────────────────────────────────────────
function WebsiteTab() {
  const [form, setForm] = useState({ site_name: '', logo_url: '', favicon_url: '', maintenance_mode: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings/website').then(r => r.json()).then(d =>
      setForm({ site_name: d.site_name ?? '', logo_url: d.logo_url ?? '', favicon_url: d.favicon_url ?? '', maintenance_mode: d.maintenance_mode ?? false })
    );
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'favicon_url') => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(field);
    try { const url = await uploadFile('general', file); setForm(f => ({ ...f, [field]: url })); }
    finally { setUploading(null); }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings/website', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
      <div style={card}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>General</div>
        <div>
          <label style={lbl}>Site Name</label>
          <input type="text" placeholder="MakiSync" value={form.site_name} onChange={e => setForm(f => ({ ...f, site_name: e.target.value }))} style={inp} />
        </div>

        {/* Logo */}
        <div>
          <label style={lbl}>Logo</label>
          <div onClick={() => logoRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: 10, border: '1px dashed var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', cursor: 'pointer', transition: 'border-color 0.15s' }}>
            <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: 'rgba(59,130,246,0.08)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {form.logo_url ? <img src={form.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <i className="bi bi-image" style={{ color: 'var(--admin-text-muted)', fontSize: '1.4rem' }} />}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>{uploading === 'logo_url' ? 'Uploading…' : form.logo_url ? 'Click to change logo' : 'Click to upload logo'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>PNG, SVG or WebP recommended</div>
            </div>
          </div>
          <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'logo_url')} />
        </div>

        {/* Favicon */}
        <div>
          <label style={lbl}>Favicon</label>
          <div onClick={() => faviconRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: 10, border: '1px dashed var(--admin-border-strong)', background: 'var(--admin-bg-secondary)', cursor: 'pointer', transition: 'border-color 0.15s' }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', background: 'rgba(59,130,246,0.08)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {form.favicon_url ? <img src={form.favicon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <i className="bi bi-image" style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }} />}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>{uploading === 'favicon_url' ? 'Uploading…' : form.favicon_url ? 'Click to change favicon' : 'Click to upload favicon'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>ICO, PNG or SVG · 32×32px recommended</div>
            </div>
          </div>
          <input ref={faviconRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'favicon_url')} />
        </div>
      </div>

      {/* Maintenance mode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={card}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>Maintenance Mode</div>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>Enable Maintenance Mode</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>Visitors will see a maintenance page instead of your portfolio.</div>
            </div>
            <div onClick={() => setForm(f => ({ ...f, maintenance_mode: !f.maintenance_mode }))} style={{ width: 44, height: 24, borderRadius: 99, background: form.maintenance_mode ? '#f87171' : 'var(--admin-border-strong)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, marginLeft: '1rem' }}>
              <div style={{ position: 'absolute', top: 3, left: form.maintenance_mode ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
          </label>
          {form.maintenance_mode && (
            <div style={{ padding: '0.65rem 0.85rem', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', fontSize: '0.78rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-exclamation-triangle-fill" /> Maintenance mode is ON — your portfolio is hidden from visitors.
            </div>
          )}
        </div>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
}

// ── Account Tab ──────────────────────────────────────────
function AccountTab() {
  const [form, setForm] = useState({ username: '', email: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [savingInfo, setSavingInfo] = useState(false);
  const [savedInfo, setSavedInfo] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/account').then(r => r.json()).then(d =>
      setForm({ username: d.username ?? '', email: d.email ?? '' })
    );
  }, []);

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    await fetch('/api/settings/account', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSavingInfo(false); setSavedInfo(true); setTimeout(() => setSavedInfo(false), 2000);
  };

  const handleSavePw = async () => {
    setPwError('');
    if (pwForm.new_password !== pwForm.confirm_password) { setPwError('Passwords do not match.'); return; }
    if (pwForm.new_password.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    setSavingPw(true);
    const res = await fetch('/api/settings/account', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, current_password: pwForm.current_password, new_password: pwForm.new_password }) });
    const data = await res.json();
    setSavingPw(false);
    if (!res.ok) { setPwError(data.error); return; }
    setPwSaved(true); setPwForm({ current_password: '', new_password: '', confirm_password: '' }); setTimeout(() => setPwSaved(false), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
      <div style={card}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>Account Info</div>
        <div><label style={lbl}>Username</label><input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={inp} /></div>
        <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} /></div>
        <SaveBtn loading={savingInfo} saved={savedInfo} onClick={handleSaveInfo} />
      </div>

      <div style={card}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>Change Password</div>
        <div><label style={lbl}>Current Password</label><input type="password" value={pwForm.current_password} onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} style={inp} autoComplete="current-password" /></div>
        <div><label style={lbl}>New Password</label><input type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} style={inp} autoComplete="new-password" /></div>
        <div><label style={lbl}>Confirm New Password</label><input type="password" value={pwForm.confirm_password} onChange={e => setPwForm(f => ({ ...f, confirm_password: e.target.value }))} style={inp} autoComplete="new-password" /></div>
        {pwError && <div style={{ fontSize: '0.8rem', color: '#f87171' }}>{pwError}</div>}
        <SaveBtn loading={savingPw} saved={pwSaved} onClick={handleSavePw} />
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────
function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) ?? 'website';
  const setTab = (key: TabKey) => router.push(`/admin/settings?tab=${key}`, { scroll: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--admin-border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit', color: activeTab === t.key ? 'var(--admin-accent)' : 'var(--admin-text-muted)', borderBottom: `2px solid ${activeTab === t.key ? 'var(--admin-accent)' : 'transparent'}`, whiteSpace: 'nowrap', marginBottom: '-1px', transition: 'color 0.15s' }}>
            <i className={`bi ${t.icon}`} />{t.label}
          </button>
        ))}
      </div>
      {activeTab === 'website' && <WebsiteTab />}
      {activeTab === 'account' && <AccountTab />}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppLayout title="Settings" description="Admin">
      <Suspense fallback={<div style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>}>
        <SettingsContent />
      </Suspense>
    </AppLayout>
  );
}
