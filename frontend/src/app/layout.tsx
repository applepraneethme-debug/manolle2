import type { Metadata } from "next";
import { Outfit, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Manolle AI — AI Voice Agents for Sales Automation",
  description:
    "Deploy intelligent AI voice agents that call your leads, qualify prospects, and book appointments automatically. Built for real estate and appointment-driven businesses.",
  keywords: ["AI calling", "voice agents", "sales automation", "lead qualification", "appointment booking"],
  openGraph: {
    title: "Manolle AI — AI Voice Agents for Sales Automation",
    description: "Automate every sales call with AI. Book more appointments, qualify more leads.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${manrope.variable} ${jetbrainsMono.variable} bg-[#0A0A0A] text-white antialiased`}
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          duration={3000}
          toastOptions={{
            style: {
              background: "#121214",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
