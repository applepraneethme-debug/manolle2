import { NextResponse } from "next/server";
import { clearTenantSession } from "@/lib/auth";

export async function POST() {
  await clearTenantSession();
  return NextResponse.json({ ok: true });
}
