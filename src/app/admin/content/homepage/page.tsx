import AppLayout from '@/layouts/AppLayout';
import UnderDevelopment from '@/components/UnderDevelopment';

export default function Page() {
  return (
    <AppLayout title="Homepage" description="Content">
      <UnderDevelopment icon="bi-house-fill" label="Homepage" />
    </AppLayout>
  );
}
