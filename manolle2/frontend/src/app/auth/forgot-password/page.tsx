"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { createClient, IS_DEMO_MODE } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (IS_DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#00F0FF]" />
          </div>
          <h2 className="font-outfit text-2xl font-semibold text-white mb-2">
            Reset link sent
          </h2>
          <p className="text-[#A1A1AA] text-sm mb-6">
            Check your inbox at{" "}
            <span className="text-white font-medium">{email}</span> for the
            password reset link.
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
        <div className="mb-8">
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-[#71717A] hover:text-white transition-colors text-sm mb-6"
            data-testid="back-to-login-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
          <h1 className="font-outfit text-3xl font-semibold text-white mb-2">
            Forgot password?
          </h1>
          <p className="text-[#A1A1AA] text-sm">
            No worries. Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleReset} className="space-y-5">
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
              data-testid="forgot-password-email-input"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
            data-testid="forgot-password-submit-btn"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
