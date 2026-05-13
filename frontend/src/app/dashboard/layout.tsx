"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";

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
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

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
            <Button variant="ghost" size="icon" className="relative" data-testid="notifications-btn">
              <Bell className="w-4 h-4 text-[#71717A]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
            </Button>
            <div
              className="w-8 h-8 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/30 flex items-center justify-center text-xs font-semibold text-[#00F0FF] cursor-pointer"
              data-testid="user-avatar"
            >
              U
            </div>
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
