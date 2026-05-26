import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { onboardClient } from "@/lib/client-new";

async function guard() {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  try {
    const supabase = createAdminSupabase();
    const { data: organizations, error } = await supabase
      .from("organizations")
      .select("*, org_users(id,email,role,is_active,last_login,login_count)")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const orgList = organizations || [];

    // If no orgs yet, skip usage queries entirely
    if (orgList.length === 0) {
      return NextResponse.json({ clients: [] });
    }

    const orgIds = orgList.map((org) => org.id);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [calls, leads, appointments] = await Promise.all([
      supabase.from("call_logs").select("org_id,duration").in("org_id", orgIds).gte("created_at", monthStart),
      supabase.from("leads").select("org_id").in("org_id", orgIds).gte("created_at", monthStart),
      supabase.from("appointments").select("org_id").in("org_id", orgIds).gte("created_at", monthStart),
    ]);

    const usageByOrg = new Map<string, { calls: number; minutes: number; leads: number; appointments: number }>();
    for (const orgId of orgIds) usageByOrg.set(orgId, { calls: 0, minutes: 0, leads: 0, appointments: 0 });
    for (const row of calls.data || []) {
      const usage = usageByOrg.get(row.org_id);
      if (usage) {
        usage.calls += 1;
        usage.minutes += Math.ceil((row.duration || 0) / 60);
      }
    }
    for (const row of leads.data || []) usageByOrg.get(row.org_id)!.leads += 1;
    for (const row of appointments.data || []) usageByOrg.get(row.org_id)!.appointments += 1;

    return NextResponse.json({
      clients: orgList.map((org) => ({
        ...org,
        usage: usageByOrg.get(org.id) || { calls: 0, minutes: 0, leads: 0, appointments: 0 },
      })),
    });
  } catch (err: unknown) {
    console.error("[GET /api/admin/clients] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));

    const businessName = String(body.businessName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    if (!businessName) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const client = await onboardClient({
      businessName,
      businessType: body.businessType || "other",
      email,
      plan: body.plan || "starter",
      durationMonths: Number(body.durationMonths || 1),
    });

    return NextResponse.json(client);
  } catch (err: unknown) {
    console.error("[POST /api/admin/clients] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  const action = String(body.action || "");
  const supabase = createAdminSupabase();

  if (action === "toggle") {
    const { error } = await supabase.from("organizations").update({ is_active: body.is_active }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (action === "extend") {
    const months = Number(body.months || 1);
    const expires = new Date();
    expires.setMonth(expires.getMonth() + months);
    const { error } = await supabase.from("organizations").update({ expires_at: expires.toISOString() }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (action === "reset_password") {
    const { generateTemporaryPassword, hashPassword } = await import("@/lib/auth");
    const password = generateTemporaryPassword();
    const { data: user } = await supabase.from("org_users").select("id").eq("org_id", id).eq("role", "owner").maybeSingle();
    if (user) {
      await supabase.from("org_users").update({ password_hash: await hashPassword(password) }).eq("id", user.id);
    }
    return NextResponse.json({ password });
  }

  if (action === "force_logout") {
    const { data: users } = await supabase.from("org_users").select("id").eq("org_id", id);
    await supabase.from("active_sessions").delete().in("user_id", (users || []).map((user) => user.id));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await createAdminSupabase().from("organizations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
