import "server-only";

import { cookies, headers } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const SESSION_COOKIE = "manolle_session";
export const ADMIN_COOKIE = "manolle_admin";
const SESSION_DAYS = 7;
const ADMIN_HOURS = 8;

export type TenantSession = {
  token: string;
  user: {
    id: string;
    email: string;
    role: "owner" | "staff";
  };
  organization: {
    id: string;
    client_id: string;
    business_name: string;
    business_type: "salon" | "clinic" | "realestate" | "other";
    plan: "starter" | "pro" | "enterprise";
    is_active: boolean;
    calls_limit: number;
    leads_limit: number;
    expires_at: string | null;
    vapi_assistant_id?: string | null;
    vapi_phone_number_id?: string | null;
  };
};

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function generateTemporaryPassword() {
  return randomBytes(18).toString("base64url");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createTenantSession(userId: string) {
  const supabase = createAdminSupabase();
  const token = generateSessionToken();
  const headerStore = await headers();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await supabase.from("active_sessions").delete().eq("user_id", userId);

  const { error } = await supabase.from("active_sessions").insert({
    user_id: userId,
    session_token: token,
    ip_address:
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerStore.get("x-real-ip") ||
      null,
    device_info: headerStore.get("user-agent"),
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw error;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function clearTenantSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await createAdminSupabase().from("active_sessions").delete().eq("session_token", token);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getTenantSession(): Promise<TenantSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getTenantSessionByToken(token);
}

export async function getTenantSessionByToken(token: string): Promise<TenantSession | null> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("active_sessions")
    .select(
      "session_token, expires_at, org_users!inner(id,email,role,is_active,org_id, organizations!inner(id,client_id,business_name,business_type,plan,is_active,calls_limit,leads_limit,expires_at,vapi_assistant_id,vapi_phone_number_id))"
    )
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;

  const orgUser = Array.isArray(data.org_users) ? data.org_users[0] : data.org_users;
  const organization = Array.isArray(orgUser?.organizations)
    ? orgUser.organizations[0]
    : orgUser?.organizations;

  if (!orgUser?.is_active || !organization?.is_active) return null;
  if (organization.expires_at && new Date(organization.expires_at) <= new Date()) return null;

  return {
    token,
    user: {
      id: orgUser.id,
      email: orgUser.email,
      role: orgUser.role,
    },
    organization,
  };
}

function adminSecret() {
  return process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || "development-admin-secret";
}

function signAdminValue(value: string) {
  return createHmac("sha256", adminSecret()).update(value).digest("hex");
}

export function verifyAdminPassword(userId: string, password: string) {
  const expectedUser = process.env.ADMIN_USER_ID || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;
  return Boolean(expectedPassword && userId === expectedUser && password === expectedPassword);
}

export async function createAdminSession() {
  const expires = Date.now() + ADMIN_HOURS * 60 * 60 * 1000;
  const raw = `${expires}.${randomBytes(16).toString("hex")}`;
  const value = `${raw}.${signAdminValue(raw)}`;
  (await cookies()).set(ADMIN_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
   path: "/",
    expires: new Date(expires),
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdminSessionValid() {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const [expires, nonce, signature] = value.split(".");
  if (!expires || !nonce || !signature || Number(expires) <= Date.now()) return false;

  const raw = `${expires}.${nonce}`;
  const expected = signAdminValue(raw);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function requireTenantSession() {
  const session = await getTenantSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}
