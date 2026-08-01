'use client';
import PortalLayout from '@/components/portal/PortalLayout';

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout isAdmin={true}>{children}</PortalLayout>;
}
