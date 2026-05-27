"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Building2, LogOut, Plus, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/clients/new", label: "Create Client", icon: Plus },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-white/[0.06] bg-[#0D0D0F] lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00F0FF]/30 bg-[#00F0FF]/10">
            <Shield className="h-4 w-4 text-[#00F0FF]" />
          </div>
          <div>
            <div className="font-outfit text-sm font-semibold">Manolle Admin</div>
            <div className="text-xs text-[#71717A]">Owner console</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "border border-white/10 bg-white/[0.08] text-white"
                    : "text-[#71717A] hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4", active && "text-[#00F0FF]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#71717A] hover:bg-red-500/5 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0A0A0A]/80 px-6 backdrop-blur-xl">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold lg:hidden">
            <Zap className="h-4 w-4 text-[#00F0FF]" />
            Admin
          </Link>
          <div className="hidden text-sm text-[#71717A] lg:block">Private Manolle control room</div>
          <div className="flex gap-2 lg:hidden">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-[#A1A1AA]">
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
