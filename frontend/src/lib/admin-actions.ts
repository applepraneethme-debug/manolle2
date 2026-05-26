import "server-only";

import { redirect } from "next/navigation";
import { isAdminSessionValid } from "@/lib/auth";

export async function requireAdmin() {
  if (!(await isAdminSessionValid())) {
    redirect("/admin/login");
  }
}
