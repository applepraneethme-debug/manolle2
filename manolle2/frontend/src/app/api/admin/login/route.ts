import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminPassword(userId, password)) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
