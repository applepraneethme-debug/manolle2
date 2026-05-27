import { NextResponse, type NextRequest } from "next/server";
import { createTenantSession, verifyPassword } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";

const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimitKey(request: NextRequest, email: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `${ip}:${email.toLowerCase()}`;
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (current.count >= 5) return false;
  current.count += 1;
  attempts.set(key, current);
  return true;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const key = rateLimitKey(request, email);
  if (!checkRateLimit(key)) {
    return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }

  const supabase = createAdminSupabase();
  const { data: user, error } = await supabase
    .from("org_users")
    .select("id,email,password_hash,role,is_active,login_count, organizations!inner(id,client_id,business_name,business_type,plan,is_active,calls_limit,leads_limit,expires_at)")
    .eq("email", email)
    .maybeSingle();

  if (error || !user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const organization = Array.isArray(user.organizations) ? user.organizations[0] : user.organizations;
  const validPassword = await verifyPassword(password, user.password_hash);
  const expired = organization?.expires_at && new Date(organization.expires_at) <= new Date();

  if (!validPassword || !user.is_active || !organization?.is_active || expired) {
    return NextResponse.json({ error: "Invalid login or inactive account" }, { status: 401 });
  }

  const token = await createTenantSession(user.id);
  await supabase
    .from("org_users")
    .update({ last_login: new Date().toISOString(), login_count: (user.login_count || 0) + 1 })
    .eq("id", user.id);

  attempts.delete(key);

  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
    organization,
  });
}
