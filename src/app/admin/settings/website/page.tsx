import AppLayout from '@/layouts/AppLayout';
import UnderDevelopment from '@/components/UnderDevelopment';

export default function Page() {
  return (
    <AppLayout title="Website" description="Settings">
      <UnderDevelopment icon="bi-globe" label="Website" />
    </AppLayout>
  );
}
