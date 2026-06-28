import AppLayout from '@/layouts/AppLayout';
import UnderDevelopment from '@/components/UnderDevelopment';

export default function Page() {
  return (
    <AppLayout title="Account" description="Settings">
      <UnderDevelopment icon="bi-person-gear" label="Account" />
    </AppLayout>
  );
}
