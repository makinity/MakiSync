'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ── Types ────────────────────────────────────────────────
type Profile = {
  full_name: string;
  tagline: string;
  bio: string;
  avatar_url: string | null;
  location: string;
  years_experience: number;
};

type Project = {
  id: number;
  title: string;
  description: string;
  cover_url: string | null;
  client: string | null;
  url: string | null;
  status: string;
};

type Service = {
  id: number;
  title: string;
  description: string;
  icon: string;
  category?: string;
};

type Skill = {
  id: number;
  name: string;
  logo_url: string | null;
  category: string;
};

type Contact = {
  key: string;
  label: string;
  value: string;
};

type GalleryItem = {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  category_name: string | null;
};

type Certification = {
  id: number;
  title: string;
  issuer: string | null;
  credential_url: string | null;
  image_url: string | null;
};

const socialIconMap: Record<string, string> = {
  email: 'bi-envelope-fill', phone: 'bi-telephone-fill',
  instagram: 'bi-instagram', facebook: 'bi-facebook',
  linkedin: 'bi-linkedin', twitter: 'bi-twitter-x', website: 'bi-globe',
};

// ── Marquee Text (scrolling stroke letters behind photo) ─
function MarqueeText({ text, speed = 40, reverse = false }: { text: string; speed?: number; reverse?: boolean }) {
  // Duplicate enough times to fill screen width
  const repeated = Array(8).fill(text).join('  ·  ');

  return (
    <div style={{ overflow: 'hidden', width: '100%', userSelect: 'none' }}>
      <motion.div
        style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {/* Two copies so the loop is seamless */}
        {[0, 1].map(i => (
          <span
            key={i}
            style={{
              fontSize: 'clamp(72px, 13vw, 160px)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'transparent',
              WebkitTextStroke: '1.5px var(--stroke-color)',
              lineHeight: 1,
              paddingRight: '0.4em',
              fontFamily: 'inherit',
            }}
          >
            {repeated}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────
const NAV_LINKS = ['Work', 'Services', 'About', 'Gallery', 'Contact'];

function Navbar({ name }: { name: string }) {
  const [dark, setDark] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('theme') ?? 'dark';
    setDark(t === 'dark');
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const toggle = () => {
    const nd = !dark;
    setDark(nd);
    const t = nd ? 'dark' : 'light';
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const go = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <>
      {/* Outer wrapper — full width, truly centered */}
      <div style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          pointerEvents: 'all',
          display: 'flex', alignItems: 'center', gap: 0,
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--admin-border)',
          borderRadius: 99,
          padding: '8px 8px 8px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          width: 'fit-content',
        }}
        className="v2-nav"
      >
        {/* Logo + Name */}
        {/* Logo + Name */}
        <div onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 28, flexShrink: 0, cursor: 'pointer' }}>
          <img src="/logo.png" alt="logo" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--admin-text-primary)', letterSpacing: '-0.01em' }}>
            MakiSync
          </span>
        </div>

        {/* Links */}
        <div className="v2-nav-links" style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }}>
          {NAV_LINKS.map(l => (
            <button key={l} onClick={() => go(l)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--admin-text-secondary)',
                fontFamily: 'inherit', padding: '6px 14px', borderRadius: 99,
                transition: 'all 0.2s', letterSpacing: '0.04em', textTransform: 'uppercase',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.1)'; (e.currentTarget as HTMLElement).style.color = 'var(--admin-accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--admin-text-secondary)'; }}
            >{l}</button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, flexShrink: 0 }}>
          {/* Theme toggle icon */}
          <button onClick={toggle} style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--admin-border)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--admin-text-secondary)', fontSize: 15, transition: 'all 0.2s',
          }}>
            {dark
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></svg>
            }
          </button>

          {/* Hire Me CTA */}
          <a href="#contact"
            style={{
              padding: '8px 20px', borderRadius: 99,
              background: 'var(--admin-accent)', color: '#fff',
              fontSize: '0.8rem', fontWeight: 700,
              textDecoration: 'none', letterSpacing: '0.03em',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Hire Me
          </a>

          {/* Hamburger (mobile) */}
          <button className="v2-hamburger" onClick={() => setOpen(o => !o)}
            style={{
              display: 'none', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--admin-text-primary)', fontSize: 20, padding: '4px',
              alignItems: 'center',
            }}
          >
            <i className={`bi ${open ? 'bi-x' : 'bi-list'}`} />
          </button>
        </div>
      </motion.nav>
      </div> {/* end centering wrapper */}

      {/* Mobile drawer */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 101 }} />}
      <motion.div
        initial={{ x: '100%' }} animate={{ x: open ? '0%' : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 240,
          background: 'var(--admin-card)', borderLeft: '1px solid var(--admin-border)',
          zIndex: 102, display: 'flex', flexDirection: 'column', padding: '1.5rem 1.25rem', gap: '0.35rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: 20 }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        {NAV_LINKS.map(l => (
          <button key={l} onClick={() => go(l)}
            style={{
              background: 'none', border: '1px solid transparent', borderRadius: 10,
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
              color: 'var(--admin-text-secondary)', textAlign: 'left',
              textTransform: 'uppercase', fontFamily: 'inherit',
              padding: '0.7rem 0.85rem', letterSpacing: '0.05em',
            }}
          >{l}</button>
        ))}
      </motion.div>

      <style>{`
        @media(max-width: 640px) {
          .v2-nav { width: calc(100% - 32px) !important; padding: 8px 8px 8px 12px !important; }
          .v2-nav-links { display: none !important; }
          .v2-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

// ── Hero Section ─────────────────────────────────────────
function HeroSection({ profile }: { profile: Profile | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const name = profile?.full_name || 'MakiSync';
  const tagline = profile?.tagline || 'Social Media Manager & VA';
  const avatarUrl = profile?.avatar_url;

  // Split name for the marquee — use name or a default
  const marqueeText = name.toUpperCase();

  return (
    <section
      ref={containerRef}
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--admin-bg-primary)',
      }}
    >
      {/* ── Marquee rows (behind the photo) ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 0,
        pointerEvents: 'none', zIndex: 0,
        overflow: 'hidden',
      }}>
        {/* Row 1 — left scroll */}
        <div style={{ transform: 'translateY(0)' }}>
          <MarqueeText text={marqueeText} speed={60} reverse={false} />
        </div>
        {/* Row 2 — right scroll */}
        <div style={{ marginTop: -20 }}>
          <MarqueeText text={tagline.toUpperCase()} speed={45} reverse={true} />
        </div>
      </div>

      {/* ── Profile photo (center, above marquee) ── */}
      <motion.div
        style={{ y: photoY, position: 'relative', zIndex: 2 }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            style={{
              width: 'auto',
              height: '100vh',
              maxHeight: '100vh',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
              filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.5))',
            }}
          />
        ) : (
          /* Placeholder silhouette if no avatar yet */
          <div style={{
            width: 'clamp(280px, 38vw, 520px)',
            height: '100vh',
            background: 'linear-gradient(160deg, rgba(59,130,246,0.15), rgba(99,102,241,0.08))',
            border: '1px solid var(--admin-border)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12, color: 'var(--admin-text-muted)',
          }}>
            <i className="bi bi-person-fill" style={{ fontSize: '6rem', color: 'var(--admin-accent)', opacity: 0.4 }} />
            <span style={{ fontSize: '0.82rem' }}>Add profile photo</span>
          </div>
        )}
      </motion.div>

      {/* ── Bottom info bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          position: 'absolute', bottom: 36, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 3rem', zIndex: 3,
        }}
        className="v2-hero-bar"
      >
        {/* Left — tagline */}
        <div style={{ maxWidth: 260 }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--admin-accent)', marginBottom: 4,
          }}>
            Available for work
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--admin-text-secondary)', lineHeight: 1.4 }}>
            {tagline}
          </div>
        </div>

        {/* Center — scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: 'var(--admin-text-muted)', fontSize: '0.65rem',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}
        >
          <span>Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
            <motion.rect
              x="6.5" y="4" width="3" height="5" rx="1.5" fill="currentColor"
              animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            />
          </svg>
        </motion.div>

        {/* Right — experience badge */}
        <div style={{ textAlign: 'right', maxWidth: 200 }}>
          {profile?.years_experience ? (
            <>
              <div style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 900, color: 'var(--admin-text-primary)', lineHeight: 1 }}>
                {profile.years_experience}+
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', marginTop: 2 }}>
                Years Experience
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontStyle: 'italic' }}>
              {profile?.location || ''}
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        @media(max-width: 640px) {
          .v2-hero-bar { padding: 0 1.25rem !important; }
          .v2-hero-bar > div:first-child { display: none; }
          .v2-hero-bar > div:last-child { display: none; }
        }
      `}</style>
    </section>
  );
}

// ── Work Gallery ─────────────────────────────────────────
function WorkGallery({ projects }: { projects: Project[] }) {
  const pub = projects.filter(p => p.status === 'published');
  const [index, setIndex] = useState(0); // unbounded, wraps via modulo

  if (pub.length === 0) return null;

  const count = pub.length;
  const activeIdx = ((index % count) + count) % count;
  const current = pub[activeIdx];

  // Get project at a virtual offset from active
  function getProject(offset: number) {
    return pub[((activeIdx + offset) % count + count) % count];
  }

  // Framer Motion animate props per slot
  function getAnimate(offset: number) {
    const abs = Math.abs(offset);
    return {
      x: offset * 230,
      scale: offset === 0 ? 1 : 0.75 - (abs - 1) * 0.04,
      rotateY: offset * -14,
      filter: `brightness(${offset === 0 ? 1 : 0.5 - (abs - 1) * 0.05})`,
      zIndex: offset === 0 ? 10 : 10 - abs * 3,
    };
  }

  const slots = [-2, -1, 0, 1, 2];

  return (
    <section id="work" style={{
      padding: '6rem 2rem 5rem',
      background: 'var(--admin-bg-primary)',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: 8 }}>
              Selected Work
            </div>
            <h2 style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 900, color: 'var(--admin-text-primary)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
              Work Gallery
              <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block', width: 3, height: '0.85em', background: 'var(--admin-accent)', borderRadius: 2, marginLeft: 4 }} />
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)', marginTop: 10 }}>
              A collection of social media, design, and web projects.
            </p>
          </div>
          <motion.a href="/" whileHover={{ scale: 1.03 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, border: '1px solid var(--admin-border)', color: 'var(--admin-text-primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0, transition: 'border-color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--admin-accent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--admin-border)'; }}
          >
            View More Projects <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.8rem' }} />
          </motion.a>
        </div>

        {/* Fan carousel — each slot is a persistent motion.div that animates its position */}
        <div style={{ position: 'relative', height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem', perspective: 1200 }}>
          {slots.map(offset => {
            const p = getProject(offset);
            const anim = getAnimate(offset);
            return (
              <motion.div
                key={offset}
                animate={anim}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                onClick={() => offset !== 0 && setIndex(i => i + offset)}
                whileTap={offset !== 0 ? { scale: 1.12, transition: { duration: 0.15 } } : undefined}
                style={{
                  position: 'absolute',
                  cursor: offset !== 0 ? 'pointer' : 'default',
                  transformOrigin: 'center center',
                  transformStyle: 'preserve-3d',
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: offset === 0
                      ? '0 32px 80px rgba(59,130,246,0.35), 0 8px 24px rgba(0,0,0,0.3)'
                      : '0 8px 32px rgba(0,0,0,0.25)',
                    borderColor: offset === 0 ? 'rgba(59,130,246,0.5)' : 'var(--admin-border)',
                  }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: 340, height: 240, borderRadius: 16, overflow: 'hidden',
                    border: '1px solid var(--admin-border)',
                    background: 'var(--admin-card)',
                  }}
                >
                  {p.cover_url
                    ? <motion.img
                        key={p.id}
                        src={p.cover_url} alt={p.title}
                        initial={{ opacity: 0.6, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.05))', color: 'var(--admin-text-muted)' }}>
                        <i className="bi bi-image" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                      </div>
                  }
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Active project info */}
        <motion.div key={activeIdx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
          <h3 style={{ fontSize: 'clamp(1.2rem,2.5vw,1.65rem)', fontWeight: 800, color: 'var(--admin-text-primary)', marginBottom: 12, letterSpacing: '-0.02em' }}>
            {current.title}
          </h3>
          {current.description && (
            <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-secondary)', lineHeight: 1.7, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {current.description}
            </p>
          )}
          {current.url && (
            <a href={current.url} target="_blank" rel="noreferrer"
              style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)', textDecoration: 'none', borderBottom: '1px solid var(--admin-accent)', paddingBottom: 2, transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--admin-accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--admin-text-primary)'; }}
            >
              View Project →
            </a>
          )}
        </motion.div>

      </div>
    </section>
  );
}

// ── Capabilities (Services + Skills) ─────────────────────
function CapabilitiesSec({ services, skills }: { services: Service[]; skills: Skill[] }) {
  if (services.length === 0 && skills.length === 0) return null;

  return (
    <section id="services" style={{
      padding: '6rem 2rem',
      background: 'var(--admin-bg-secondary)',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 32, alignItems: 'start' }} className="cap-grid">

        {/* ── Left: heading + skill logos ── */}
        <div style={{ position: 'sticky', top: 120 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: 12 }}>
            My Capabilities
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(2rem,4.5vw,3rem)', fontWeight: 900, color: 'var(--admin-text-primary)', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 }}
          >
            What I Can Do
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}
            style={{ fontSize: '0.9rem', color: 'var(--admin-text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 320 }}
          >
            Social media strategy, content creation, virtual assistance, and digital operations — all in one place.
          </motion.p>

          {/* Skill logos — 4 col grid, left 2 cols = first category, right 2 cols = second */}
          {skills.length > 0 && (() => {
            const grouped: Record<string, Skill[]> = {};
            skills.forEach(s => {
              const cat = s.category || 'General';
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push(s);
            });
            const cols = Object.values(grouped);
            const left = cols[0] ?? [];
            const right = cols[1] ?? [];
            const rows = Math.max(Math.ceil(left.length / 2), Math.ceil(right.length / 2));

            const Icon = ({ s }: { s: Skill }) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.12, y: -2 }}
                title={s.name}
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'var(--admin-card)',
                  border: '1px solid var(--admin-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0,
                }}
              >
                {s.logo_url
                  ? <img src={s.logo_url} alt={s.name} style={{ width: 30, height: 30, objectFit: 'contain' }} />
                  : <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--admin-accent)' }}>{s.name.slice(0, 2).toUpperCase()}</span>
                }
              </motion.div>
            );

            return (
              <motion.div
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
              >
                {/* Left category — 3 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 52px)', gap: 10 }}>
                  {left.map(s => <Icon key={s.id} s={s} />)}
                </div>
                {/* Divider */}
                <div style={{ width: 1, background: 'var(--admin-border)', alignSelf: 'stretch', margin: '0 4px' }} />
                {/* Right category — 3 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 52px)', gap: 10 }}>
                  {right.map(s => <Icon key={s.id} s={s} />)}
                </div>
              </motion.div>
            );
          })()}
        </div>

        {/* ── Right: service cards — compact 2-col grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="cap-cards">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: 14,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Number + icon row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--admin-text-muted)', opacity: 0.3, lineHeight: 1 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`bi ${s.icon || 'bi-stars'}`} style={{ fontSize: 16, color: 'var(--admin-accent)' }} />
                </div>
              </div>

              {/* Title */}
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-primary)', lineHeight: 1.3 }}>
                {s.title}
              </div>

              {/* Description — clamped to 2 lines */}
              <p style={{
                fontSize: '0.78rem', color: 'var(--admin-text-secondary)', lineHeight: 1.6, margin: 0,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
              }}>
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width: 768px) {
          .cap-grid { grid-template-columns: 1fr !important; }
          .cap-cards { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width: 480px) {
          .cap-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────
const TYPEWRITER_WORDS = ['Creative.', 'Strategic.', 'Reliable.', 'Passionate.'];

function AboutSec({
  profile, contacts, resume, projectCount, certCount,
}: {
  profile: Profile;
  contacts: Contact[];
  resume: { file_url: string | null } | null;
  projectCount: number;
  certCount: number;
}) {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const word = TYPEWRITER_WORDS[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIdx(i => (i + 1) % TYPEWRITER_WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIdx]);

  return (
    <section id="about" style={{
      padding: '6rem 2rem',
      background: 'var(--admin-bg-primary)',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Label + typewriter heading */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: 12 }}>
            About Me
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem,5.5vw,4rem)', fontWeight: 900,
            color: 'var(--admin-text-primary)', letterSpacing: '-0.03em',
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3em',
            margin: 0, lineHeight: 1.1,
          }}>
            {profile.full_name?.split(' ')[0] || 'Hi'} is&nbsp;
            <span style={{ color: 'var(--admin-accent)', whiteSpace: 'nowrap' }}>
              {displayed}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                style={{ display: 'inline-block', width: 3, height: '0.8em', background: 'var(--admin-accent)', borderRadius: 2, marginLeft: 3, verticalAlign: 'middle' }}
              />
            </span>
          </h2>
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48, alignItems: 'start' }} className="about-grid-v2">

          {/* Left — avatar + stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ position: 'relative', width: 'fit-content' }}
            >
              <div style={{
                width: 120, height: 120, borderRadius: '50%', overflow: 'hidden',
                border: '3px solid var(--admin-accent)',
                background: 'rgba(59,130,246,0.1)',
              }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <i className="bi bi-person-fill" style={{ fontSize: '3.5rem', color: 'var(--admin-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} />
                }
              </div>
              {/* Verified badge */}
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--admin-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--admin-bg-primary)',
              }}>
                <i className="bi bi-check-lg" style={{ fontSize: 11, color: '#fff' }} />
              </div>
            </motion.div>

            {/* Name */}
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginBottom: 2 }}>
                {profile.full_name}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{profile.tagline}</div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Projects', value: `${projectCount}+` },
                { label: 'Certifications', value: certCount },
                ...(profile.years_experience ? [{ label: 'Years Exp.', value: `${profile.years_experience}+` }] : []),
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--admin-text-primary)', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--admin-text-muted)', marginTop: 3 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {contacts.filter(c => socialIconMap[c.key] && c.value).map(c => (
                <motion.a
                  key={c.key}
                  href={c.key === 'email' ? `mailto:${c.value}` : c.value}
                  target="_blank" rel="noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  style={{
                    width: 38, height: 38, borderRadius: '50%',
                    border: '1px solid var(--admin-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--admin-text-secondary)', fontSize: 16, textDecoration: 'none',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--admin-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--admin-accent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--admin-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--admin-text-secondary)'; }}
                >
                  <i className={`bi ${socialIconMap[c.key]}`} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right — bio + currently + resume */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <p style={{ fontSize: '1rem', color: 'var(--admin-text-secondary)', lineHeight: 1.8, margin: 0 }}>
                {profile.bio}
              </p>
              {resume?.file_url && (
                <a href={resume.file_url} target="_blank" rel="noreferrer" download
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)', textDecoration: 'none', borderBottom: '1px solid var(--admin-accent)', paddingBottom: 2, transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--admin-accent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--admin-text-primary)'; }}
                >
                  Download my resume <i className="bi bi-download" style={{ fontSize: '0.8rem' }} />
                </a>
              )}
            </motion.div>

            {/* Currently bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.5 }}
              style={{
                padding: '1.25rem 1.5rem',
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: 14,
              }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: 16 }}>
                Currently
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {[
                  { icon: 'bi-code-slash', label: 'Building', sub: 'Social media & web projects' },
                  { icon: 'bi-graph-up-arrow', label: 'Growing', sub: 'Client brands & presence' },
                  { icon: 'bi-lightbulb', label: 'Learning', sub: 'New tools & strategies' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className={`bi ${item.icon}`} style={{ fontSize: 15, color: 'var(--admin-accent)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Location */}
            {profile.location && (
              <motion.div
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}
              >
                <i className="bi bi-geo-alt-fill" style={{ color: 'var(--admin-accent)', fontSize: 14 }} />
                {profile.location}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width: 768px) {
          .about-grid-v2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── Recognition (Gallery cards + Certifications) ─────────
function RecognitionSec({ gallery, certs }: { gallery: GalleryItem[]; certs: Certification[] }) {
  const [lightbox, setLightbox] = useState<{ open: boolean; image: string; title: string }>({ open: false, image: '', title: '' });
  const [dealt, setDealt] = useState(false);

  // Trigger deal animation when section enters view
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setDealt(true); }, { threshold: 0.2 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(s => ({ ...s, open: false })); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const photos = certs.slice(0, 8);

  // Dynamically compute fan positions centered around 0
  const totalCards = photos.length;
  const spreadPerCard = 120; // px between cards
  const rotatePerCard = 8;   // degrees between cards
  const cardPositions = photos.map((_, i) => {
    const offset = i - (totalCards - 1) / 2; // center the fan
    return {
      x: offset * spreadPerCard,
      y: -Math.abs(offset) * 18,
      rotate: offset * rotatePerCard,
    };
  });

  return (
    <section id="recognition" ref={sectionRef} style={{
      padding: '6rem 2rem',
      background: 'var(--admin-bg-secondary)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: 12 }}>
            Recognition
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: 'var(--admin-text-primary)', letterSpacing: '-0.03em', margin: 0 }}
          >
            Awards and Achievements
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }}
            style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)', marginTop: 10 }}
          >
            A collection of certifications and memorable moments.
          </motion.p>
        </div>

        {/* Two-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }} className="recog-grid">

          {/* ── Left: casino card fan ── */}
          <div style={{ position: 'relative', height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* All cards positioned absolute from center of this div */}
            {photos.map((c, i) => {
              const pos = cardPositions[i] ?? { x: 0, y: 0, rotate: 0 };
              return (
                <motion.div
                  key={c.id}
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                  animate={dealt ? {
                    x: pos.x,
                    y: pos.y,
                    rotate: pos.rotate,
                    opacity: 1,
                  } : { x: 0, y: 0, rotate: 0, opacity: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: pos.y - 24, scale: 1.08, zIndex: 20, transition: { duration: 0.2 } }}
                  onClick={() => c.image_url && setLightbox({ open: true, image: c.image_url, title: c.title })}
                  style={{
                    position: 'absolute',
                    width: 200,
                    height: 270,
                    marginLeft: -100, // center the card on the anchor
                    marginTop: -135,
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: '3px solid var(--admin-card)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    cursor: c.image_url ? 'zoom-in' : 'default',
                    transformOrigin: 'center center',
                    zIndex: i,
                    background: 'var(--admin-card)',
                  }}
                >
                  {c.image_url
                    ? <img src={c.image_url} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '1rem', textAlign: 'center' }}>
                        <i className="bi bi-award-fill" style={{ fontSize: '2rem', color: 'var(--admin-accent)', opacity: 0.5 }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-text-muted)', lineHeight: 1.3 }}>{c.title}</span>
                      </div>
                  }
                </motion.div>
              );
            })}
          </div>

          {/* ── Right: certification list ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {certs.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ borderColor: 'var(--admin-accent)' }}
                onClick={() => c.credential_url && window.open(c.credential_url, '_blank')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, padding: '1rem 1.25rem',
                  background: 'var(--admin-card)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 12,
                  cursor: c.credential_url ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="bi bi-patch-check-fill" style={{ fontSize: 16, color: 'var(--admin-accent)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text-primary)', lineHeight: 1.3 }}>{c.title}</div>
                    {c.issuer && <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>{c.issuer}</div>}
                  </div>
                </div>
                {c.credential_url && <i className="bi bi-box-arrow-up-right" style={{ fontSize: 13, color: 'var(--admin-text-muted)', flexShrink: 0 }} />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setLightbox(s => ({ ...s, open: false }))}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'zoom-out' }}
        >
          <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={lightbox.image} alt={lightbox.title} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
            <button onClick={() => setLightbox(s => ({ ...s, open: false }))} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-x-lg" />
            </button>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        @media(max-width: 768px) {
          .recog-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── Gallery ───────────────────────────────────────────────
function GallerySec({ gallery }: { gallery: GalleryItem[] }) {
  const [active, setActive] = useState('');
  const [lightbox, setLightbox] = useState<{ open: boolean; image: string; title: string; desc: string }>({ open: false, image: '', title: '', desc: '' });

  if (gallery.length === 0) return null;

  const cats = Array.from(new Set(gallery.map(g => g.category_name).filter(Boolean))) as string[];
  const filtered = active ? gallery.filter(g => g.category_name === active) : gallery;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(s => ({ ...s, open: false })); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  return (
    <section id="gallery" style={{ padding: '6rem 2rem', background: 'var(--admin-bg-secondary)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: 8 }}>
              Creative Work
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              style={{ fontSize: 'clamp(2rem,4.5vw,3rem)', fontWeight: 900, color: 'var(--admin-text-primary)', letterSpacing: '-0.03em', margin: 0 }}
            >
              Gallery
            </motion.h2>
          </div>

          {/* Category filters */}
          {cats.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setActive('')}
                style={{ padding: '6px 16px', borderRadius: 99, border: `1px solid ${active === '' ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: active === '' ? 'rgba(59,130,246,0.12)' : 'transparent', color: active === '' ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                All
              </button>
              {cats.map(c => (
                <button key={c} onClick={() => setActive(c === active ? '' : c)}
                  style={{ padding: '6px 16px', borderRadius: 99, border: `1px solid ${active === c ? 'var(--admin-accent)' : 'var(--admin-border)'}`, background: active === c ? 'rgba(59,130,246,0.12)' : 'transparent', color: active === c ? 'var(--admin-accent)' : 'var(--admin-text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Masonry-style grid */}
        <div style={{ columns: '3 280px', gap: 14 }}>
          {filtered.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setLightbox({ open: true, image: g.image_url, title: g.title || '', desc: g.description || '' })}
              style={{
                breakInside: 'avoid', marginBottom: 14,
                borderRadius: 14, overflow: 'hidden',
                border: '1px solid var(--admin-border)',
                cursor: 'zoom-in', position: 'relative', display: 'block',
              }}
            >
              <img src={g.image_url} alt={g.title || ''} style={{ width: '100%', display: 'block', objectFit: 'cover' }} loading="lazy" />
              {(g.title || g.description) && (
                <motion.div
                  initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)',
                    padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  }}
                >
                  {g.title && <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{g.title}</div>}
                  {g.description && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{g.description}</div>}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setLightbox(s => ({ ...s, open: false }))}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'zoom-out' }}
        >
          <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={lightbox.image} alt={lightbox.title} style={{ maxWidth: '100%', maxHeight: '88vh', borderRadius: 12, objectFit: 'contain', display: 'block' }} />
            {lightbox.title && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{lightbox.title}</div>
                {lightbox.desc && <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{lightbox.desc}</div>}
              </div>
            )}
            <button onClick={() => setLightbox(s => ({ ...s, open: false }))} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-x-lg" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────
function ContactSec({ contacts, resume }: { contacts: Contact[]; resume: { file_url: string | null } | null }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [fb, setFb] = useState<{ ok: boolean; msg: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const r = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_name: form.name, sender_email: form.email, subject: form.subject, body: form.message }),
      });
      setFb(r.ok ? { ok: true, msg: 'Message sent!' } : { ok: false, msg: 'Failed. Try again.' });
      if (r.ok) setForm({ name: '', email: '', subject: '', message: '' });
    } catch { setFb({ ok: false, msg: 'An error occurred.' }); }
    setSending(false);
    setTimeout(() => setFb(null), 3000);
  };

  const displayedContacts = contacts.filter(c => c.value && c.key !== 'website');

  const inpStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--admin-border)',
    borderRadius: 8, color: 'var(--admin-text-primary)',
    fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
  };

  return (
    <section id="contact" style={{ padding: '6rem 2rem', background: 'var(--admin-bg-primary)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'start' }} className="contact-grid-v2">

          {/* ── Left: big text ── */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: 20 }}>
              Get In Touch
            </div>

            {/* Giant heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}
            >
              {["LET'S", 'WORK', 'TOGETHER'].map((word, i) => (
                <div key={word} style={{
                  fontSize: 'clamp(3.5rem,9vw,7rem)', fontWeight: 900,
                  color: i === 1 ? 'transparent' : 'var(--admin-text-primary)',
                  WebkitTextStroke: i === 1 ? '2px var(--admin-text-primary)' : undefined,
                  letterSpacing: '-0.03em', lineHeight: 1, display: 'block',
                }}>
                  {word}
                </div>
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }}
              style={{ marginTop: 32 }}
            >
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: 8 }}>
                Looking for a dedicated Social Media Manager & VA?
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-secondary)', lineHeight: 1.7, maxWidth: 420 }}>
                I'm open to opportunities where I can help grow your brand, manage your content, and streamline your digital operations.
              </p>
            </motion.div>

            {/* Download Resume */}
            {resume?.file_url && (
              <motion.a
                href={resume.file_url} target="_blank" rel="noreferrer" download
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  marginTop: 32, padding: '13px 28px',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 99, color: 'var(--admin-text-primary)',
                  textDecoration: 'none', fontSize: '0.82rem',
                  fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--admin-accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--admin-border)'; }}
              >
                Download Resume →
              </motion.a>
            )}
          </div>

          {/* ── Right: contact cards + CTA ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Contact link cards */}
            {displayedContacts.map((c, i) => (
              <motion.a
                key={c.key}
                href={c.key === 'email' ? `mailto:${c.value}` : c.value}
                target="_blank" rel="noreferrer"
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ borderColor: 'var(--admin-accent)', x: 4 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '1rem 1.25rem',
                  background: 'var(--admin-card)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 14, textDecoration: 'none',
                  position: 'relative',
                }}
              >
                {/* Number */}
                <span style={{
                  position: 'absolute', top: 10, right: 14,
                  fontSize: '0.65rem', fontWeight: 700,
                  color: 'var(--admin-text-muted)', letterSpacing: '0.05em',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`bi ${socialIconMap[c.key] || 'bi-link-45deg'}`} style={{ fontSize: 18, color: 'var(--admin-accent)' }} />
                </div>

                {/* Label + value */}
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--admin-text-muted)', marginBottom: 2 }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                    {c.value}
                  </div>
                </div>

                {/* External icon */}
                {c.key !== 'email' && c.key !== 'phone' && (
                  <i className="bi bi-box-arrow-up-right" style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginLeft: 'auto' }} />
                )}
              </motion.a>
            ))}

            {/* Send Message CTA */}
            <motion.button
              onClick={() => setShowForm(s => !s)}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                marginTop: 8, padding: '16px',
                background: 'var(--admin-accent)', color: '#fff',
                border: 'none', borderRadius: 14, cursor: 'pointer',
                fontSize: '0.88rem', fontWeight: 800,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                fontFamily: 'inherit',
              }}
            >
              {showForm ? 'Close Form' : 'Send Me a Message →'}
            </motion.button>

            {/* Inline message form */}
            {showForm && (
              <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}
              >
                <input type="text" placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={inpStyle} />
                <input type="email" placeholder="Your Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required style={inpStyle} />
                <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inpStyle} />
                <textarea placeholder="Your Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={4} style={{ ...inpStyle, resize: 'vertical' as const }} />
                {fb && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, background: fb.ok ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: fb.ok ? '#4ade80' : '#f87171', border: `1px solid ${fb.ok ? '#4ade80' : '#f87171'}` }}>
                    {fb.msg}
                  </div>
                )}
                <motion.button type="submit" disabled={sending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '12px', background: 'var(--admin-accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {sending ? 'Sending…' : 'Send Message'}
                </motion.button>
              </motion.form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width: 768px) {
          .contact-grid-v2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── Main Page ────────────────────────────────────────────
export default function MainV2Page() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [resume, setResume] = useState<{ file_url: string | null } | null>(null);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p: Promise<Response>) => p.then(r => r.ok ? r.json() : null).catch(() => null);
    Promise.all([
      safe(fetch('/api/profile')),
      safe(fetch('/api/projects')),
      safe(fetch('/api/services')),
      safe(fetch('/api/skills')),
      safe(fetch('/api/profile/contacts')),
      safe(fetch('/api/profile/resume')),
      safe(fetch('/api/certifications')),
      safe(fetch('/api/gallery')),
    ]).then(([prof, projs, svcs, skls, ctcts, res, certsData, galleryData]) => {
      setProfile(prof);
      setProjects(projs ?? []);
      setServices(svcs ?? []);
      setSkills(skls ?? []);
      setContacts(ctcts ?? []);
      setResume(res ?? null);
      setCerts(certsData ?? []);
      setGallery(galleryData ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--admin-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-accent)', letterSpacing: '0.1em' }}>
          LOADING
        </motion.div>
      </div>
    );
  }

  const publishedProjects = projects.filter(p => p.status === 'published');

  return (
    <>
      <style>{`
        :root { --nav-bg: rgba(10,15,26,0.72); --stroke-color: rgba(255,255,255,0.25); }
        :root[data-theme="light"] { --nav-bg: rgba(240,244,255,0.72); --stroke-color: rgba(0,0,0,0.75); }
      `}</style>
      <Navbar name={profile?.full_name || 'MakiSync'} />
      <main>
        <HeroSection profile={profile} />
        <WorkGallery projects={projects} />
        <CapabilitiesSec services={services} skills={skills} />
        {profile && (
          <AboutSec
            profile={profile}
            contacts={contacts}
            resume={resume}
            projectCount={publishedProjects.length}
            certCount={certs.length}
          />
        )}
        <RecognitionSec gallery={gallery} certs={certs} />
        <GallerySec gallery={gallery} />
        <ContactSec contacts={contacts} resume={resume} />
      </main>
    </>
  );
}
