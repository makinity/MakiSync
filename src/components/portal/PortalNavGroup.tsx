'use client';
import { useState } from 'react';
import PortalNavItem from './PortalNavItem';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface PortalNavGroupProps {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  collapsed?: boolean;
  onNavClick?: () => void;
}

export default function PortalNavGroup({
  label,
  items,
  collapsible = false,
  defaultOpen = true,
  collapsed,
  onNavClick,
}: PortalNavGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Single item with no group label — render directly like admin sidebar
  if (items.length === 1 && !collapsible) {
    return (
      <div style={{ marginBottom: 2 }}>
        <PortalNavItem {...items[0]} collapsed={collapsed} onClick={onNavClick} />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Group label — hidden when sidebar is collapsed */}
      {!collapsed && (
        <button
          onClick={() => collapsible && setOpen(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            gap: '0.4rem',
            padding: '0.5rem 0.95rem 0.3rem',
            background: 'none',
            border: 'none',
            cursor: collapsible ? 'pointer' : 'default',
            color: 'var(--admin-text-muted)',
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            transition: 'color 0.15s',
          }}
        >
          <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
          {collapsible && (
            <i
              className="bi bi-chevron-down"
              style={{
                fontSize: '0.6rem',
                transition: 'transform 0.15s',
                transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
            />
          )}
        </button>
      )}

      {/* Items — show when open or not collapsible */}
      {(!collapsible || open) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(item => (
            <PortalNavItem
              key={item.href}
              {...item}
              collapsed={collapsed}
              onClick={onNavClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
