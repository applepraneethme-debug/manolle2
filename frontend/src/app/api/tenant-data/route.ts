import { NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";

const TABLES = new Set(["ai_agents", "leads", "campaigns", "call_logs", "appointments"]);
const DEFAULT_ORDER: Record<string, string> = {
  appointments: "appointment_date",
};

function tableFromUrl(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table") || "";
  if (!TABLES.has(table)) throw new Error("Invalid table");
  return table;
}

function cleanPayload(payload: Record<string, unknown>) {
  const copy = { ...payload };
  delete copy.id;
  delete copy.user_id;
  delete copy.org_id;
  delete copy.organization_id;
  return copy;
}

export async function GET(request: Request) {
  const session = await requireTenantSession();
  const table = tableFromUrl(request);
  const { searchParams } = new URL(request.url);
  const order = searchParams.get("order") || DEFAULT_ORDER[table] || "created_at";

  const { data, error } = await createAdminSupabase()
    .from(table)
    .select("*")
    .eq("org_id", session.organization.id)
    .order(order, { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: Request) {
  const session = await requireTenantSession();
  const table = tableFromUrl(request);
  const body = await request.json().catch(() => ({}));
  const rows = Array.isArray(body.rows) ? (body.rows as Record<string, unknown>[]) : null;
  const payload = rows
    ? rows.map((row) => ({
        ...cleanPayload(row),
        user_id: session.user.id,
        org_id: session.organization.id,
        organization_id: session.organization.id,
      }))
    : {
        ...cleanPayload(body.payload || body),
        user_id: session.user.id,
        org_id: session.organization.id,
        organization_id: session.organization.id,
      };

  const { data, error } = await createAdminSupabase().from(table).insert(payload).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: rows ? data || [] : data?.[0] || null });
}

export async function PATCH(request: Request) {
  const session = await requireTenantSession();
  const table = tableFromUrl(request);
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await createAdminSupabase()
    .from(table)
    .update(cleanPayload(body.payload || {}))
    .eq("id", id)
    .eq("org_id", session.organization.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await requireTenantSession();
  const table = tableFromUrl(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await createAdminSupabase()
    .from(table)
    .delete()
    .eq("id", id)
    .eq("org_id", session.organization.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
