import AdminPortal from "@/components/AdminPortal";
import { requireAdminPage } from "@/lib/auth";
import { getAdminOverview } from "@/lib/admin-data";

export default async function AdminPage() {
  await requireAdminPage();
  return <AdminPortal overview={await getAdminOverview()} />;
}
