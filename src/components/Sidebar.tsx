'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/admin/dashboard',      label: 'Dashboard',      icon: 'bi-grid-1x2-fill' },
  { href: '/admin/profile',        label: 'Profile',        icon: 'bi-person-badge-fill' },
  { href: '/admin/projects',       label: 'Projects',       icon: 'bi-briefcase-fill' },
  { href: '/admin/gallery',        label: 'Gallery',        icon: 'bi-images' },
  { href: '/admin/skills',         label: 'Skills',         icon: 'bi-lightning-charge-fill' },
  { href: '/admin/tools',          label: 'Tools',          icon: 'bi-tools' },
  { href: '/admin/services',       label: 'Services',       icon: 'bi-box-seam-fill' },
  { href: '/admin/testimonials',   label: 'Testimonials',   icon: 'bi-chat-quote-fill' },
  { href: '/admin/certifications', label: 'Certifications', icon: 'bi-award-fill' },
  { href: '/admin/content',        label: 'Content',        icon: 'bi-file-earmark-richtext-fill' },
  { href: '/admin/messages',       label: 'Messages',       icon: 'bi-envelope-fill' },
  { href: '/admin/settings',       label: 'Settings',       icon: 'bi-gear-fill' },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const cls = [
    'admin-sidebar',
    collapsed ? 'sb-collapsed' : '',
    mobileOpen ? 'sb-mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <nav className={cls}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minHeight: 40 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(59,130,246,0.15)',
          border: '1px solid rgba(59,130,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="bi bi-shield-lock-fill" style={{ color: 'var(--admin-accent)', fontSize: '1rem' }} />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              MakiSync
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Admin Portal</div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--admin-text-muted)', fontSize: '1rem', padding: '0.25rem', flexShrink: 0,
              transition: 'color 0.15s',
            }}
            title="Collapse sidebar"
          >
            <i className="bi bi-chevron-left" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--admin-text-muted)', fontSize: '1rem', padding: '0.25rem',
              transition: 'color 0.15s',
            }}
            title="Expand sidebar"
          >
            <i className="bi bi-chevron-right" />
          </button>
        )}
      </div>

      <div style={{ height: '1px', background: 'var(--admin-border)', margin: '0 -0.25rem' }} />

      {/* Nav links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {NAV_LINKS.map(link => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sb-link${active ? ' sb-link-active' : ''}`}
              onClick={onCloseMobile}
              title={collapsed ? link.label : undefined}
            >
              <i className={`bi ${link.icon}`} style={{ fontSize: '1rem', flexShrink: 0 }} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
