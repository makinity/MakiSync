'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PortalNavItemProps {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  collapsed?: boolean;
  onClick?: () => void;
}

export default function PortalNavItem({
  href,
  label,
  icon,
  badge,
  collapsed,
  onClick,
}: PortalNavItemProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <style>{`
        .sb-link {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.8rem 0.95rem; border-radius: 12px;
          color: var(--admin-text-secondary); text-decoration: none;
          font-size: 0.875rem; font-weight: 500;
          border: 1px solid transparent;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; overflow: hidden;
        }
        .sb-link:hover { background: rgba(59,130,246,0.08); color: var(--admin-text-primary); }
        .sb-link-active {
          background: rgba(59,130,246,0.12);
          border-color: rgba(59,130,246,0.22);
          color: var(--admin-accent);
        }
        .sb-collapsed .sb-link { padding: 0.8rem; justify-content: center; gap: 0; }
      `}</style>
      <Link
        href={href}
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={`sb-link${active ? ' sb-link-active' : ''}`}
        style={collapsed ? { padding: '0.8rem', justifyContent: 'center', gap: 0 } : undefined}
      >
        <i
          className={`bi ${icon}`}
          style={{ fontSize: '1rem', flexShrink: 0, color: active ? 'var(--admin-accent)' : undefined }}
        />
        {!collapsed && <span>{label}</span>}
        {!collapsed && badge != null && badge > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              borderRadius: 99,
              background: 'var(--admin-accent)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        {collapsed && badge != null && badge > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--admin-accent)',
            }}
          />
        )}
      </Link>
    </>
  );
}
