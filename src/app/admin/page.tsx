import AdminDashboard from '@/components/AdminDashboard';
import { requireAdminPage } from '@/lib/auth';

export default async function AdminPage() {
  await requireAdminPage();
  return <AdminDashboard />;
}
