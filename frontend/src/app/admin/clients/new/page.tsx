"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ clientId: string; email: string; password: string } | null>(null);
  const [form, setForm] = useState({ businessName: "", businessType: "other", email: "", plan: "starter", durationMonths: "1" });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/clients", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, durationMonths: Number(form.durationMonths) }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error || `Server error: ${response.status}`); return; }
      setCreated({ clientId: result.organization?.client_id, email: result.user?.email, password: result.password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally { setLoading(false); }
  };
  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="font-outfit text-2xl font-semibold">Create Client</h1><p className="text-sm text-[#71717A]">Creates the tenant, owner login, limits, expiry, and optional Vapi assistant.</p></div>
      {created && (<Alert className="border-[#00F0FF]/30 bg-[#00F0FF]/5"><AlertDescription className="text-[#D4D4D8]">✅ Client created! ID: <span className="text-[#00F0FF]">{created.clientId}</span> Email: {created.email} Password: <span className="text-[#00F0FF]">{created.password}</span></AlertDescription></Alert>)}
      {error && (<Alert className="border-red-500/30 bg-red-500/10"><AlertDescription className="text-red-400">❌ {error}</AlertDescription></Alert>)}
      <form onSubmit={submit} className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Business Name</Label><Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Email Address</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Business Type</Label><Select value={form.businessType} onValueChange={(v) => setForm({ ...form, businessType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="salon">Salon</SelectItem><SelectItem value="clinic">Clinic</SelectItem><SelectItem value="realestate">Real Estate</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Plan</Label><Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="starter">Starter</SelectItem><SelectItem value="pro">Pro</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Duration (months)</Label><Input type="number" min="1" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} /></div>
        </div>
        <div className="flex gap-3">
          <Button disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Client"}</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/clients")}>Back</Button>
        </div>
      </form>
    </div>
  );
}
