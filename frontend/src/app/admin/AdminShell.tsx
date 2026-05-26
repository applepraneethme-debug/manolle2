"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Building2, LogOut, Plus, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/clients/new", label: "Create Client", icon: Plus },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
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
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0D0D0F] border-r border-white/[0.06] hidden lg:flex flex-col">
        <div className="h-16 px-5 border-b border-white/[0.06] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div>
            <div className="font-outfit font-semibold text-sm">Manolle Admin</div>
            <div className="text-xs text-[#71717A]">Owner console</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active ? "bg-white/[0.08] border border-white/10 text-white" : "text-[#71717A] hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4", active && "text-[#00F0FF]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#71717A] hover:text-red-400 hover:bg-red-500/5">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="h-16 sticky top-0 z-20 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.06] px-6 flex items-center justify-between">
          <Link href="/admin" className="lg:hidden flex items-center gap-2 text-sm font-semibold">
            <Zap className="w-4 h-4 text-[#00F0FF]" />
            Admin
          </Link>
          <div className="hidden lg:block text-sm text-[#71717A]">Private Manolle control room</div>
          <div className="flex gap-2 lg:hidden">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-[#A1A1AA]">{item.label}</Link>
            ))}
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
