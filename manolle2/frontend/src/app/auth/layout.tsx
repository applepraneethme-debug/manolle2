import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(0,240,255,0.08), rgba(0,0,0,0) 50%)",
        }}
      />
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>
          <span
            className="font-outfit font-semibold text-white text-sm"
            style={{ textShadow: "0 0 15px rgba(0,240,255,0.4)" }}
          >
            Manolle AI
          </span>
        </Link>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}
