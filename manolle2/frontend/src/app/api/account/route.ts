import { NextResponse } from "next/server";
import { hashPassword, requireTenantSession, verifyPassword } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  const session = await requireTenantSession();
  return NextResponse.json({ user: session.user, organization: session.organization });
}

export async function PATCH(request: Request) {
  const session = await requireTenantSession();
  const body = await request.json().catch(() => ({}));
  const supabase = createAdminSupabase();

  if (body.currentPassword && body.newPassword) {
    const { data: user } = await supabase
      .from("org_users")
      .select("password_hash")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!user || !(await verifyPassword(body.currentPassword, user.password_hash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    await supabase
      .from("org_users")
      .update({ password_hash: await hashPassword(body.newPassword) })
      .eq("id", session.user.id);
  }

  const orgPatch: Record<string, unknown> = {};
  if (typeof body.business_name === "string") orgPatch.business_name = body.business_name.trim();
  if (typeof body.business_type === "string") orgPatch.business_type = body.business_type;
  if (typeof body.vapi_assistant_id === "string") orgPatch.vapi_assistant_id = body.vapi_assistant_id.trim() || null;
  if (typeof body.vapi_phone_number_id === "string") orgPatch.vapi_phone_number_id = body.vapi_phone_number_id.trim() || null;

  if (Object.keys(orgPatch).length > 0) {
    const { error } = await supabase
      .from("organizations")
      .update(orgPatch)
      .eq("id", session.organization.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
