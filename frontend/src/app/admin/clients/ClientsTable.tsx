"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, KeyRound, Power, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type Client = {
  id: string;
  client_id: string;
  business_name: string;
  plan: string;
  is_active: boolean;
  calls_limit: number;
  expires_at: string | null;
  org_users?: { email: string }[];
  usage: { calls: number; minutes: number; leads: number; appointments: number };
};

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/clients");
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || `Server error ${response.status}`);
        return;
      }
      setClients(result.clients || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error — could not reach server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const action = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Action failed");
    return result;
  };

  const resetPassword = async (id: string) => {
    try {
      const result = await action({ id, action: "reset_password" });
      toast.success(`New password: ${result.password}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Delete this client and all tenant data?")) return;
    try {
      await fetch(`/api/admin/clients?id=${id}`, { method: "DELETE" });
      await load();
    } catch {
      toast.error("Failed to delete client");
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-xl font-semibold">Clients</h1>
          <p className="text-xs text-[#71717A]">Plans, usage, expiry, and account controls.</p>
        </div>
        <Link href="/admin/clients/new">
          <Button>Create Client</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 m-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          ❌ Failed to load clients: {error}
          <button onClick={load} className="ml-3 underline text-red-300 hover:text-red-100">Retry</button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-72">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="font-medium text-white">{client.business_name}</div>
                <div className="text-xs text-[#71717A]">{client.client_id} · {client.org_users?.[0]?.email || "No user"}</div>
              </TableCell>
              <TableCell><Badge>{client.plan}</Badge></TableCell>
              <TableCell>
                <Badge variant={client.is_active ? "success" : "destructive"}>
                  {client.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-[#A1A1AA]">
                {client.usage.calls}/{client.calls_limit} calls · {Math.max(client.calls_limit - client.usage.calls, 0)} left
                <div className="text-xs text-[#71717A]">{client.usage.minutes} minutes · {client.usage.leads} leads</div>
              </TableCell>
              <TableCell className="text-xs text-[#A1A1AA]">
                {client.expires_at ? new Date(client.expires_at).toLocaleDateString() : "No expiry"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/clients/${client.id}`}>
                    <Button variant="secondary" size="sm"><Eye className="w-3.5 h-3.5" /> View</Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={async () => { await action({ id: client.id, action: "toggle", is_active: !client.is_active }); await load(); }}>
                    <Power className="w-3.5 h-3.5" /> {client.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={async () => { await action({ id: client.id, action: "extend", months: 1 }); await load(); }}>
                    <RefreshCw className="w-3.5 h-3.5" /> Extend
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => resetPassword(client.id)}>
                    <KeyRound className="w-3.5 h-3.5" /> Reset
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteClient(client.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {loading && <div className="p-8 text-center text-sm text-[#71717A]">Loading clients...</div>}
      {!loading && !error && clients.length === 0 && (
        <div className="p-8 text-center text-sm text-[#71717A]">No clients yet. Click "Create Client" to add one.</div>
      )}
    </div>
  );
}
