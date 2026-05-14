"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Bell, Settings, LogOut, User } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/agents": "AI Agents",
  "/dashboard/campaigns": "Campaigns",
  "/dashboard/leads": "Leads",
  "/dashboard/import": "Import CSV",
  "/dashboard/call-history": "Call History",
  "/dashboard/calendar": "Calendar",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] || "Dashboard";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Sidebar
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Top header */}
        <header className="h-16 border-b border-white/[0.06] bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-[#71717A] hover:text-white"
              onClick={() => setMobileOpen(true)}
              data-testid="mobile-menu-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-outfit font-semibold text-white text-lg" data-testid="page-title">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  data-testid="notifications-btn"
                >
                  <Bell className="w-4 h-4 text-[#71717A]" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72" data-testid="notifications-menu">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-6 text-center text-xs text-[#71717A]">
                  You&apos;re all caught up.
                  <div className="mt-1 text-[#52525B]">
                    Activity from your AI agents will appear here.
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile / Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-8 h-8 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/30 flex items-center justify-center text-xs font-semibold text-[#00F0FF] cursor-pointer hover:bg-[#00F0FF]/30 transition-colors"
                  data-testid="user-avatar"
                  aria-label="User menu"
                >
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" data-testid="user-menu">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-[#71717A]">Signed in as</span>
                    <span className="text-sm text-white truncate" data-testid="user-email">
                      {userEmail || "—"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard/settings">
                  <DropdownMenuItem data-testid="menu-settings">
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/settings">
                  <DropdownMenuItem data-testid="menu-profile">
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-400"
                  onClick={handleSignOut}
                  data-testid="menu-sign-out"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6" data-testid="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
