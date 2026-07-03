'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/layouts/AppLayout';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const TABS = [
  { key: 'about',   label: 'About',   icon: 'bi-person-lines-fill' },
  { key: 'resume',  label: 'Resume',  icon: 'bi-file-earmark-text-fill' },
  { key: 'contact', label: 'Contact', icon: 'bi-telephone-fill' },
  { key: 'seo',     label: 'SEO',     icon: 'bi-search' },
] as const;
type TabKey = typeof TABS[number]['key'];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10,
  border: '1px solid var(--admin-border-strong)',
  background: 'var(--admin-bg-secondary)', color: 'var(--admin-text-primary)',
  fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem', display: 'block',
};
const cardStyle: React.CSSProperties = {
  background: 'var(--admin-card)', border: '1px solid var(--admin-border)',
  borderRadius: 'var(--admin-radius)', padding: '1.25rem', boxShadow: 'var(--admin-shadow)',
};

function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none',
      background: 'var(--admin-accent)', color: '#fff',
      fontWeight: 700, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
    }}>
      {loading ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

// ── About Tab ──────────────────────────────────────────────
function AboutTab() {
  const [form, setForm] = useState({ full_name: '', tagline: '', bio: '', location: '', years_experience: '' });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      setForm({ full_name: d.full_name ?? '', tagline: d.tagline ?? '', bio: d.bio ?? '', location: d.location ?? '', years_experience: d.years_experience ?? '' });
      setAvatar(d.avatar_url ?? null);
    });
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setAvatar(data.url + '?t=' + Date.now());
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Avatar */}
      <div style={cardStyle}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem' }}>Profile Photo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <i className="bi bi-person-fill" style={{ fontSize: '2rem', color: 'var(--admin-accent)' }} />}
          </div>
          <div>
            <button onClick={() => fileRef.current?.click()} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Upload Photo
            </button>
            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '0.35rem' }}>JPG, PNG or WebP. Max 5MB.</div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>
        </div>
      </div>

      {/* Fields */}
      <div style={cardStyle}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem' }}>Personal Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { key: 'full_name', label: 'Full Name', placeholder: 'Mark Juntilla' },
            { key: 'location', label: 'Location', placeholder: 'Philippines' },
            { key: 'years_experience', label: 'Years of Experience', placeholder: '5', type: 'number' },
          ].map(f => (
            <div key={f.key} style={f.key === 'years_experience' ? {} : {}}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type ?? 'text'} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={labelStyle}>Tagline</label>
          <input type="text" placeholder="Social Media Manager & VA" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={labelStyle}>Bio</label>
          <textarea placeholder="Tell visitors about yourself..." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={5} style={{ ...inputStyle, resize: 'vertical' as const }} />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
          {saved && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ Saved</span>}
          <SaveBtn loading={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  );
}

// ── Resume Tab ─────────────────────────────────────────────
function ResumeTab() {
  const [form, setForm] = useState({ title: '', description: '', file_url: '', thumbnail_url: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/profile/resume').then(r => r.json()).then(d => {
      setForm({ title: d.title ?? '', description: d.description ?? '', file_url: d.file_url ?? '', thumbnail_url: d.thumbnail_url ?? '' });
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/profile/resume-upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setForm(p => ({ ...p, file_url: data.url }));
    setUploading(false);
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/profile/resume-thumbnail', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setForm(p => ({ ...p, thumbnail_url: data.url + '?t=' + Date.now() }));
    setUploadingThumb(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/profile/resume', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem' }}>Resume</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Title</label>
          <input type="text" placeholder="My Resume 2026" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea placeholder="Brief description of your resume..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
        </div>
        <div>
          <label style={labelStyle}>PDF File</label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <i className="bi bi-upload" style={{ marginRight: '0.4rem' }} />
              {uploading ? 'Uploading…' : 'Upload PDF'}
            </button>
            {form.file_url && (
              <a href={form.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--admin-accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <i className="bi bi-file-earmark-pdf-fill" /> View current
              </a>
            )}
            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
          </div>
          {form.file_url && <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '0.35rem', wordBreak: 'break-all' }}>{form.file_url}</div>}
        </div>
        <div>
          <label style={labelStyle}>Thumbnail Image</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {form.thumbnail_url && (
              <div style={{ width: 120, height: 160, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--admin-border)', flexShrink: 0 }}>
                <img src={form.thumbnail_url} alt="Resume thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
              <button onClick={() => thumbRef.current?.click()} disabled={uploadingThumb} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <i className="bi bi-image" style={{ marginRight: '0.4rem' }} />
                {uploadingThumb ? 'Uploading…' : form.thumbnail_url ? 'Replace Thumbnail' : 'Upload Thumbnail'}
              </button>
              <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>JPG, PNG or WebP. Shown as preview on the public page.</div>
              <input ref={thumbRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleThumbUpload} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
          {saved && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ Saved</span>}
          <SaveBtn loading={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  );
}

// ── Contact Tab ────────────────────────────────────────────
function ContactTab() {
  const [contacts, setContacts] = useState<{ key: string; label: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const ICONS: Record<string, string> = { email: 'bi-envelope-fill', phone: 'bi-telephone-fill', instagram: 'bi-instagram', facebook: 'bi-facebook', linkedin: 'bi-linkedin', twitter: 'bi-twitter-x', website: 'bi-globe' };

  useEffect(() => {
    fetch('/api/profile/contacts').then(r => r.json()).then(setContacts);
  }, []);

  const update = (key: string, value: string) => setContacts(c => c.map(x => x.key === key ? { ...x, value } : x));

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/profile/contacts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contacts) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '1rem' }}>Contact & Social Links</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {contacts.map(c => (
          <div key={c.key}>
            <label style={labelStyle}>
              <i className={`bi ${ICONS[c.key] ?? 'bi-link-45deg'}`} style={{ marginRight: '0.4rem', color: 'var(--admin-accent)' }} />
              {c.label}
            </label>
            <input type={c.key === 'email' ? 'email' : 'text'} placeholder={c.key === 'email' ? 'you@email.com' : `Your ${c.label}`} value={c.value} onChange={e => update(c.key, e.target.value)} style={inputStyle} />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
          {saved && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ Saved</span>}
          <SaveBtn loading={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  );
}

// ── SEO Tab ────────────────────────────────────────────────
function SeoTab() {
  const [form, setForm] = useState({ meta_title: '', meta_description: '', og_image_url: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile/seo').then(r => r.json()).then(d => {
      setForm({ meta_title: d.meta_title ?? '', meta_description: d.meta_description ?? '', og_image_url: d.og_image_url ?? '' });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/profile/seo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>SEO Settings</div>
      <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '1rem' }}>Controls how your profile appears in search engines and social shares.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Meta Title</label>
          <input type="text" placeholder="Mark Juntilla — Social Media Manager" value={form.meta_title} onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))} style={inputStyle} />
          <div style={{ fontSize: '0.7rem', color: form.meta_title.length > 60 ? '#f87171' : 'var(--admin-text-muted)', marginTop: '0.3rem' }}>{form.meta_title.length}/60 characters</div>
        </div>
        <div>
          <label style={labelStyle}>Meta Description</label>
          <textarea placeholder="Professional Social Media Manager & VA based in the Philippines..." value={form.meta_description} onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
          <div style={{ fontSize: '0.7rem', color: form.meta_description.length > 160 ? '#f87171' : 'var(--admin-text-muted)', marginTop: '0.3rem' }}>{form.meta_description.length}/160 characters</div>
        </div>
        <div>
          <label style={labelStyle}>OG Image URL</label>
          <input type="text" placeholder="https://..." value={form.og_image_url} onChange={e => setForm(p => ({ ...p, og_image_url: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
          {saved && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>✓ Saved</span>}
          <SaveBtn loading={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
import { Suspense } from 'react';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bp = useBreakpoint();
  const activeTab = (searchParams.get('tab') as TabKey) ?? 'about';

  const setTab = (key: TabKey) => router.push(`/admin/profile?tab=${key}`, { scroll: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '0.35rem',
        overflowX: 'auto', scrollbarWidth: 'none',
        borderBottom: '1px solid var(--admin-border)',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: bp === 'mobile' ? '0.6rem 0.75rem' : '0.65rem 1rem',
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
              color: activeTab === t.key ? 'var(--admin-accent)' : 'var(--admin-text-muted)',
              borderBottom: `2px solid ${activeTab === t.key ? 'var(--admin-accent)' : 'transparent'}`,
              whiteSpace: 'nowrap', transition: 'color 0.15s',
              marginBottom: '-1px',
            }}
          >
            <i className={`bi ${t.icon}`} style={{ fontSize: '0.85rem' }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'about'   && <AboutTab />}
      {activeTab === 'resume'  && <ResumeTab />}
      {activeTab === 'contact' && <ContactTab />}
      {activeTab === 'seo'     && <SeoTab />}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppLayout title="Profile" description="Admin">
      <Suspense fallback={<div style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Loading…</div>}>
        <ProfileContent />
      </Suspense>
    </AppLayout>
  );
}
