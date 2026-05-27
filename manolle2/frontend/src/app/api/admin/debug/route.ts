import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";

export async function GET() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("manolle_admin")?.value;
  const jwtSecret = process.env.JWT_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUserId = process.env.ADMIN_USER_ID;

  let cookieInfo: Record<string, unknown> = { present: false };
  if (adminCookie) {
    const parts = adminCookie.split(".");
    const [expires, nonce, signature] = parts;
    const raw = `${expires}.${nonce}`;
    const secret = jwtSecret || adminPassword || "development-admin-secret";
    const expected = createHmac("sha256", secret).update(raw).digest("hex");
    cookieInfo = {
      present: true,
      parts: parts.length,
      expires: expires ? new Date(Number(expires)).toISOString() : null,
      expired: Number(expires) <= Date.now(),
      signatureMatch: signature === expected,
      secretUsed: jwtSecret ? "JWT_SECRET" : adminPassword ? "ADMIN_PASSWORD" : "fallback",
    };
  }

  return NextResponse.json({
    envVars: {
      JWT_SECRET: jwtSecret ? `set (${jwtSecret.length} chars)` : "NOT SET",
      ADMIN_PASSWORD: adminPassword ? `set (${adminPassword.length} chars)` : "NOT SET",
      ADMIN_USER_ID: adminUserId || "NOT SET",
    },
    cookie: cookieInfo,
  });
}