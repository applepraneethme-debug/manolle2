import { requireAdmin } from "@/lib/admin-actions";
import ClientsTable from "./ClientsTable";

export default async function ClientsPage() {
  await requireAdmin();
  return <ClientsTable />;
}
