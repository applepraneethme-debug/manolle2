import Link from "next/link";
import { requireAdmin } from "@/lib/admin-actions";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createAdminSupabase();
  const [{ data: org }, { data: users }, { data: sessions }, { data: calls }, { data: leads }, { data: appointments }] =
    await Promise.all([
      supabase.from("organizations").select("*").eq("id", id).maybeSingle(),
      supabase.from("org_users").select("id,email,role,is_active,last_login,login_count,created_at").eq("org_id", id),
      supabase.from("active_sessions").select("*, org_users!inner(org_id)").eq("org_users.org_id", id),
      supabase.from("call_logs").select("duration,created_at").eq("org_id", id),
      supabase.from("leads").select("id,created_at").eq("org_id", id),
      supabase.from("appointments").select("id,created_at").eq("org_id", id),
    ]);

  if (!org) {
    return <div className="text-sm text-[#71717A]">Client not found.</div>;
  }

  const minutes = (calls || []).reduce((sum, call) => sum + Math.ceil((call.duration || 0) / 60), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-semibold">{org.business_name}</h1>
          <p className="text-sm text-[#71717A]">
            {org.client_id} · {org.plan} plan
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/admin/clients">Back</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          ["Calls", calls?.length || 0],
          ["Minutes Used", minutes],
          ["Minutes Left", Math.max((org.calls_limit || 0) - minutes, 0)],
          ["Leads", leads?.length || 0],
          ["Appointments", appointments?.length || 0],
        ].map(([label, value]) => (
          <div key={label} className="glass-card p-5">
            <p className="text-xs text-[#71717A]">{label}</p>
            <p className="font-outfit mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card space-y-3 p-5">
          <h2 className="font-outfit font-semibold">Organization Info</h2>
          <p className="text-sm text-[#A1A1AA]">Business type: {org.business_type}</p>
          <p className="text-sm text-[#A1A1AA]">Status: {org.is_active ? "Active" : "Inactive"}</p>
          <p className="text-sm text-[#A1A1AA]">
            Expires: {org.expires_at ? new Date(org.expires_at).toLocaleString() : "No expiry"}
          </p>
          <p className="text-sm text-[#A1A1AA]">Vapi assistant: {org.vapi_assistant_id || "Not set"}</p>
        </div>
        <div className="glass-card space-y-3 p-5">
          <h2 className="font-outfit font-semibold">Users & Sessions</h2>
          {(users || []).map((user) => (
            <div key={user.id} className="border-b border-white/5 pb-3 last:border-0">
              <p className="text-sm text-white">{user.email}</p>
              <p className="text-xs text-[#71717A]">
                {user.role} · {user.login_count || 0} logins · last{" "}
                {user.last_login ? new Date(user.last_login).toLocaleString() : "never"}
              </p>
            </div>
          ))}
          {(sessions || []).map((session) => (
            <div key={session.id} className="text-xs text-[#A1A1AA]">
              Active session: {session.ip_address || "unknown IP"} · expires{" "}
              {new Date(session.expires_at).toLocaleString()}
            </div>
          ))}
          {sessions?.length === 0 && <p className="text-xs text-[#71717A]">No active sessions.</p>}
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-outfit font-semibold">Knowledge Base</h2>
        <p className="mt-2 text-sm text-[#71717A]">
          RAG is not enabled for Manolle right now, so no knowledge files are managed here.
        </p>
      </div>
    </div>
  );
}
