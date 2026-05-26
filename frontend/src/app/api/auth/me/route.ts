import { NextResponse } from "next/server";
import { getTenantSession } from "@/lib/auth";

export async function GET() {
  const session = await getTenantSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    user: session.user,
    organization: session.organization,
  });
}
