'use client';
import PortalLayout from '@/components/portal/PortalLayout';

export default function PortalGroupLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout isAdmin={false}>{children}</PortalLayout>;
}
