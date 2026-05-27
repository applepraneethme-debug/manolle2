"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { createClient, IS_DEMO_MODE } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (IS_DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 800));
      router.push("/dashboard");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="font-outfit text-2xl font-semibold text-white mb-2">
            Check your email
          </h2>
          <p className="text-[#A1A1AA] text-sm mb-6">
            We&apos;ve sent a verification link to{" "}
            <span className="text-white font-medium">{email}</span>. Click it to
            activate your account and access the dashboard.
          </p>
          <Link href="/auth/login">
            <Button variant="secondary" className="w-full" data-testid="back-to-login-btn">
              Back to Login
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

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
            Create your account
          </h1>
          <p className="text-[#A1A1AA] text-sm">
            Start automating calls in minutes. Free 14-day trial.
          </p>
        </div>

        {IS_DEMO_MODE && (
          <Alert variant="default" className="mb-6 border-[#00F0FF]/20 bg-[#00F0FF]/5">
            <AlertDescription className="text-[#00F0FF] text-xs">
              Demo mode: Sign up will redirect to dashboard. Add Supabase credentials for real auth.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={!IS_DEMO_MODE}
              disabled={loading}
              data-testid="signup-name-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={!IS_DEMO_MODE}
              disabled={loading}
              data-testid="signup-email-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!IS_DEMO_MODE}
                disabled={loading}
                minLength={8}
                className="pr-10"
                data-testid="signup-password-input"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
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
            data-testid="signup-submit-btn"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-[#71717A] mt-4">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-[#00F0FF]/80 hover:text-[#00F0FF]">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#00F0FF]/80 hover:text-[#00F0FF]">Privacy Policy</Link>
        </p>

        <p className="text-center text-sm text-[#71717A] mt-4">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[#00F0FF] hover:text-[#00F0FF]/80 transition-colors font-medium"
            data-testid="login-link"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
