"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminLoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(result.error || "Admin login failed");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] grid place-items-center px-6">
      <form onSubmit={submit} className="glass-card p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#00F0FF]" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-semibold text-white">Manolle Admin</h1>
            <p className="text-sm text-[#71717A]">Separate owner access for client management.</p>
          </div>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-1.5">
          <Label>Admin User ID</Label>
          <Input value={userId} onChange={(event) => setUserId(event.target.value)} required autoComplete="username" />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : "Enter Admin"}
        </Button>
      </form>
    </main>
  );
}
