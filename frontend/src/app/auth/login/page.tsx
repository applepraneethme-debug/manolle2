"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient, IS_DEMO_MODE } from "@/lib/supabase/client";
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

    if (IS_DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Demo mode: Redirecting to dashboard...");
      router.push("/dashboard");
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
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

        {IS_DEMO_MODE && (
          <Alert variant="default" className="mb-6 border-[#00F0FF]/20 bg-[#00F0FF]/5">
            <AlertDescription className="text-[#00F0FF] text-xs">
              Demo mode active. Click &ldquo;Sign In&rdquo; to explore the dashboard.
              Add Supabase credentials in .env to enable real auth.
            </AlertDescription>
          </Alert>
        )}

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
              required={!IS_DEMO_MODE}
              disabled={loading}
              autoComplete="email"
              data-testid="login-email-input"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[#00F0FF] hover:text-[#00F0FF]/80 transition-colors"
                data-testid="forgot-password-link"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!IS_DEMO_MODE}
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
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-[#00F0FF] hover:text-[#00F0FF]/80 transition-colors font-medium"
            data-testid="signup-link"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
