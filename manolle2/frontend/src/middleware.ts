import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "manolle_session";
const ADMIN_COOKIE = "manolle_admin";

async function isTenantTokenValid(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  const response = await fetch(
    `${url}/rest/v1/active_sessions?session_token=eq.${token}&expires_at=gt.${new Date().toISOString()}&select=id,org_users!inner(id,is_active,organizations!inner(id,is_active,expires_at))`,
    {
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
      },
    }
  ).catch(() => null);

  if (!response?.ok) return false;
  const rows = await response.json().catch(() => []);
  const row = rows?.[0];
  const user = Array.isArray(row?.org_users) ? row.org_users[0] : row?.org_users;
  const org = Array.isArray(user?.organizations) ? user.organizations[0] : user?.organizations;
  return Boolean(user?.is_active && org?.is_active && (!org.expires_at || new Date(org.expires_at) > new Date()));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;

  if (
    pathname === "/auth/signup" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/auth/reset-password" ||
    pathname === "/auth/callback"
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token || !(await isTenantTokenValid(token))) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/auth/login" || pathname === "/login") {
    if (token && (await isTenantTokenValid(token))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico).*)",
  ],
};
