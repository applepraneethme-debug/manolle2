"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Loader2, LogOut, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Client = {
  id: string;
  client_id: string;
  business_name: string;
  business_type: string;
  plan: "starter" | "pro" | "enterprise";
  is_active: boolean;
  calls_limit: number;
  leads_limit: number;
  expires_at: string | null;
  created_at: string;
  org_users?: Array<{ id: string; email: string; role: string; is_active: boolean }>;
  usage?: {
    calls: number;
    minutes: number;
    leads: number;
    appointments: number;
  };
};

function formatDate(value: string | null) {
  if (!value) return "No expiry";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
}

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const totals = useMemo(
    () =>
      clients.reduce(
        (acc, client) => {
          acc.clients += 1;
          acc.calls += client.usage?.calls || 0;
          acc.leads += client.usage?.leads || 0;
          return acc;
        },
        { clients: 0, calls: 0, leads: 0 }
      ),
    [clients]
  );

  async function loadClients() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/clients", { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error || `Unable to load clients (${response.status})`);
      setLoading(false);
      return;
    }
    setClients(result.clients || []);
    setLoading(false);
  }

  async function runAction(client: Client, action: string, extra: Record<string, unknown> = {}) {
    setBusyId(client.id);
    setError(null);
    setTemporaryPassword(null);
    const response = await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: client.id, action, ...extra }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error || `Action failed (${response.status})`);
    } else if (result.password) {
      setTemporaryPassword(result.password);
    }
    await loadClients();
    setBusyId(null);
  }

  async function deleteClient(client: Client) {
    if (!confirm(`Delete ${client.business_name}? This cannot be undone.`)) return;
    setBusyId(client.id);
    setError(null);
    const response = await fetch(`/api/admin/clients?id=${client.id}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setError(result.error || `Delete failed (${response.status})`);
    await loadClients();
    setBusyId(null);
  }

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-[#71717A]">Manage tenants, access, limits, and monthly usage.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadClients} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/clients/new">
              <Plus className="h-4 w-4" />
              New Client
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass-card p-4">
          <p className="text-sm text-[#71717A]">Clients</p>
          <p className="mt-1 text-2xl font-semibold">{totals.clients}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-[#71717A]">Calls this month</p>
          <p className="mt-1 text-2xl font-semibold">{totals.calls}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-[#71717A]">Leads this month</p>
          <p className="mt-1 text-2xl font-semibold">{totals.leads}</p>
        </div>
      </div>

      {error && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}
      {temporaryPassword && (
        <Alert className="border-[#00F0FF]/30 bg-[#00F0FF]/5">
          <AlertDescription className="text-[#D4D4D8]">
            Temporary password: <span className="font-mono text-[#00F0FF]">{temporaryPassword}</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center text-[#A1A1AA]">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-[#A1A1AA]">No clients have been created yet.</p>
            <Button asChild>
              <Link href="/admin/clients/new">
                <Plus className="h-4 w-4" />
                New Client
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const owner = client.org_users?.find((user) => user.role === "owner") || client.org_users?.[0];
                const busy = busyId === client.id;
                return (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.business_name}</div>
                      <div className="text-xs text-[#71717A]">{client.client_id}</div>
                    </TableCell>
                    <TableCell>{owner?.email || "No owner"}</TableCell>
                    <TableCell className="capitalize">{client.plan}</TableCell>
                    <TableCell>
                      <div className="text-sm">{client.usage?.calls || 0} calls</div>
                      <div className="text-xs text-[#71717A]">
                        {client.usage?.leads || 0} leads, {client.usage?.appointments || 0} appointments
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(client.expires_at)}</TableCell>
                    <TableCell>
                      <Badge variant={client.is_active ? "default" : "secondary"}>
                        {client.is_active ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="icon" asChild aria-label="View client">
                          <Link href={`/admin/clients/${client.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() => runAction(client, "toggle", { is_active: !client.is_active })}
                        >
                          {client.is_active ? "Pause" : "Activate"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() => runAction(client, "extend", { months: 1 })}
                        >
                          +1 mo
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() => runAction(client, "reset_password")}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          disabled={busy}
                          onClick={() => runAction(client, "force_logout")}
                          aria-label="Force logout"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          disabled={busy}
                          onClick={() => deleteClient(client)}
                          aria-label="Delete client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
