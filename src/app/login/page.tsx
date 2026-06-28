'use client';
import LoginLoadingScreen from '@/components/LoginLoadingScreen';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginLoader } from '@/components/LoadingOverlayProvider';

const SLIDES = ['/slides/1.png', '/slides/2.png', '/slides/3.png'];

const FEATURES = [
  { icon: 'bi-bar-chart-line-fill', title: 'Real-Time Insights', desc: 'Track performance metrics and KPIs as they happen.' },
  { icon: 'bi-people-fill',         title: 'Team Collaboration', desc: 'Coordinate goals and reviews across departments.' },
  { icon: 'bi-shield-lock-fill',    title: 'Secure & Reliable',  desc: 'Your data is protected with role-based access control.' },
];

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const { showLoginLoader } = useLoginLoader();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  // Theme init — read from what the blocking script already set
  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'dark';
    setDarkMode(saved === 'dark');
  }, []);

  useEffect(() => {
    if (darkMode === null) return;
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Slideshow
  useEffect(() => {
    if (SLIDES.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => {
      setActiveSlide(i => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Dot grid canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const SPACING = 28, RADIUS = 1.8, REPEL = 120, LERP = 0.08;
    let mouse = { x: -9999, y: -9999 };
    let animId: number;

    const cols = () => Math.ceil(canvas.width / SPACING) + 1;
    const rows = () => Math.ceil(canvas.height / SPACING) + 1;

    // dot positions (resting + current)
    type Dot = { rx: number; ry: number; cx: number; cy: number; vx: number; vy: number };
    let dots: Dot[] = [];
    const initDots = () => {
      dots = [];
      for (let r = 0; r < rows(); r++) {
        for (let c = 0; c < cols(); c++) {
          const x = c * SPACING, y = r * SPACING;
          dots.push({ rx: x, ry: y, cx: x, cy: y, vx: 0, vy: 0 });
        }
      }
    };
    initDots();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouse = { x: -9999, y: -9999 }; };
    canvas.parentElement?.addEventListener('mousemove', onMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', onMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = (darkMode ?? true) ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
      dots.forEach(d => {
        const dx = d.cx - mouse.x, dy = d.cy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL) {
          const force = (REPEL - dist) / REPEL;
          d.vx += (dx / dist) * force * 3;
          d.vy += (dy / dist) * force * 3;
        }
        d.cx += (d.rx - d.cx) * LERP + d.vx;
        d.cy += (d.ry - d.cy) * LERP + d.vy;
        d.vx *= 0.85;
        d.vy *= 0.85;
        ctx.beginPath();
        ctx.arc(d.cx, d.cy, RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', onMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [darkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Login failed.');
      return;
    }
    showLoginLoader();
    router.push('/admin/dashboard');
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: 10,
    border: `1px solid ${hasError ? '#f87171' : 'var(--admin-border-strong)'}`,
    background: 'var(--admin-bg-secondary)',
    color: 'var(--admin-text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'inherit',
  });

  return (
    <>
      <style>{`
        .login-page {
          display: flex; min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 26%),
            linear-gradient(180deg, var(--admin-bg-primary) 0%, var(--admin-bg-secondary) 100%);
        }
        .login-left {
          flex: 1; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0a0f1a 0%, #0f1a2e 60%, #0d1729 100%);
          display: flex; flex-direction: column; justify-content: center; padding: 2.5rem;
          padding-top: 5rem;
        }
        .login-right {
          width: 52%; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 2rem; position: relative;
          background:
            radial-gradient(circle at 60% 40%, rgba(59,130,246,0.04), transparent 60%),
            var(--admin-bg-primary);
        }
        :root[data-theme="light"] .login-right {
          background: radial-gradient(circle at 60% 40%, rgba(59,130,246,0.05), transparent 60%), var(--admin-bg-primary);
        }
        .login-card {
          width: 100%; max-width: 400px;
          background: var(--admin-card);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg);
          box-shadow: var(--admin-shadow);
          padding: 2rem 2rem 1.75rem;
        }
        .login-dots-bg {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }
        :root[data-theme="light"] .login-dots-bg {
          background-image: radial-gradient(circle, rgba(59,130,246,0.1) 1px, transparent 1px);
        }
        @media (max-width: 900px) {
          .login-left { display: none; }
          .login-right { width: 100%; }
        }
      `}</style>

      {/* Theme toggle — fixed top right */}
      <button
        onClick={() => setDarkMode(d => !(d ?? true))}
        style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 100,
          width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
          background: (darkMode ?? true) ? 'var(--admin-accent)' : '#cbd5e1',
          transition: 'background 0.2s',
          display: 'flex', alignItems: 'center', padding: '0 3px',
        }}
      >
        <span style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          marginLeft: (darkMode ?? true) ? 'auto' : 0,
          transition: 'margin 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {(darkMode ?? true)
            ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          }
        </span>
      </button>

      <div className="login-page">
        {/* LEFT PANEL */}
        <div className="login-left">
          {/* Slide images */}
          {SLIDES.map((src, i) => (
            <img key={src} src={src} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', opacity: i === activeSlide ? 0.45 : 0,
              transition: 'opacity 0.8s ease',
            }} />
          ))}
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(8,14,24,0.85) 0%, rgba(8,14,24,0.3) 50%, rgba(8,14,24,0.1) 100%)',
            zIndex: 2,
          }} />

          {/* Logo — top left */}
          <div style={{ position: 'absolute', top: '2.5rem', left: '2.5rem', zIndex: 3, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/logo.png" alt="MakiSync" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f4f8ff' }}>MakiSync</span>
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: 99,
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#60a5fa',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
            }}>
              Welcome Back!
            </span>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f4f8ff', lineHeight: 1.2, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
              Your portfolio,<br />synced perfectly.
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(244,248,255,0.65)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Manage your portfolio, skills, and services with clarity, efficiency, and real-time sync.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={`bi ${f.icon}`} style={{ color: '#60a5fa', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f4f8ff', marginBottom: '0.1rem' }}>{f.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(244,248,255,0.55)' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright — pinned to bottom */}
          <div style={{ position: 'absolute', bottom: '2rem', left: '2.5rem', zIndex: 3, fontSize: '0.72rem', color: 'rgba(244,248,255,0.35)' }}>
            © 2026 MakiSync. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <canvas ref={canvasRef} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 0,
          }} />
          <div className="login-card" style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
                Sign in
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>
                Enter your credentials to continue
              </p>
            </div>

            <div style={{ height: '1px', background: 'var(--admin-border)', marginBottom: '1.5rem' }} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Username */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem' }}>
                  <i className="bi bi-person" style={{ color: 'var(--admin-accent)' }} />
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={inputStyle(!!error && !username.trim())}
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.4rem' }}>
                  <i className="bi bi-lock" style={{ color: 'var(--admin-accent)' }} />
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ ...inputStyle(!!error && !password.trim()), paddingRight: '2.5rem' }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--admin-text-muted)', fontSize: '0.95rem', padding: 0,
                    }}
                  >
                    <i className={`bi bi-eye${showPass ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '-0.25rem' }}>{error}</div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none',
                  background: 'var(--admin-accent)', color: '#fff',
                  fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
                  fontFamily: 'inherit', marginTop: '0.25rem',
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              {/* OR divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--admin-border)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--admin-border)' }} />
              </div>

              {/* Secondary buttons */}
              <button
                type="button"
                style={{
                  width: '100%', padding: '0.65rem', borderRadius: 10,
                  border: '1px solid var(--admin-border-strong)',
                  background: 'transparent',
                  color: 'var(--admin-text-secondary)',
                  fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s',
                }}
              >
                Forgot password?
              </button>
            </form>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '1.25rem', fontSize: '0.72rem', color: 'var(--admin-text-muted)', textAlign: 'center' }}>
            © 2026 MakiSync
          </div>
        </div>
      </div>
    </>
  );
}
