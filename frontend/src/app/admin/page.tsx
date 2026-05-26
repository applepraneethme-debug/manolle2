import { requireAdmin } from "@/lib/admin-actions";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { Activity, Building2, IndianRupee, UserCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { data: clients } = await supabase
    .from("organizations")
    .select("id,business_name,plan,is_active,created_at,expires_at")
    .order("created_at", { ascending: false });

  const total = clients?.length || 0;
  const active = clients?.filter((client) => client.is_active).length || 0;
  const monthlyRevenue = (clients || []).reduce((sum, client) => {
    if (!client.is_active) return sum;
    if (client.plan === "starter") return sum + 999;
    if (client.plan === "pro") return sum + 1699;
    return sum;
  }, 0);

  const cards = [
    { label: "Total Clients", value: total, icon: Building2 },
    { label: "Active Clients", value: active, icon: UserCheck },
    { label: "Inactive Clients", value: total - active, icon: Activity },
    { label: "Monthly Revenue", value: `₹${monthlyRevenue.toLocaleString("en-IN")}`, icon: IndianRupee },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-semibold text-white">Admin Dashboard</h1>
        <p className="text-sm text-[#71717A]">Client access, revenue, and recent onboarding.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#71717A]">{card.label}</p>
                <p className="font-outfit text-2xl font-semibold mt-2">{card.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
                <card.icon className="w-5 h-5 text-[#00F0FF]" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-outfit font-semibold">Recent Signups</h2>
        </div>
        <div className="divide-y divide-white/5">
          {(clients || []).slice(0, 8).map((client) => (
            <div key={client.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{client.business_name}</p>
                <p className="text-xs text-[#71717A]">{client.plan} plan</p>
              </div>
              <p className="text-xs text-[#71717A]">{new Date(client.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {total === 0 && <div className="p-8 text-center text-sm text-[#71717A]">No clients yet.</div>}
        </div>
      </div>
    </div>
  );
}
