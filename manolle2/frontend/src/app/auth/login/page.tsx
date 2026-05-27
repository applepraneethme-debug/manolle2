"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(result.error || "Login failed");
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="glass-card p-8">
        <div className="mb-8 text-center">
          <h1 className="font-outfit text-3xl font-semibold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-[#A1A1AA] text-sm">
            Sign in to your Manolle AI account
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              data-testid="login-email-input"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <span className="text-xs text-[#71717A]">Ask your admin to reset it</span>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="pr-10"
                data-testid="login-password-input"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="toggle-password-visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
            data-testid="login-submit-btn"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-[#71717A] mt-6">
          New clients are created by the Manolle admin.
        </p>
      </div>
    </motion.div>
  );
}
