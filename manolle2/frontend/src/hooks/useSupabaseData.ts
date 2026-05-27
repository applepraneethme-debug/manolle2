"use client";

import { useCallback, useEffect, useState } from "react";

type TableName =
  | "ai_agents"
  | "leads"
  | "campaigns"
  | "call_logs"
  | "appointments";

interface TableState<T> {
  data: T[];
  loading: boolean;
  reload: () => Promise<void>;
  insert: (payload: Record<string, unknown>) => Promise<T | null>;
  update: (id: string, payload: Record<string, unknown>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  batchInsert: (rows: Record<string, unknown>[]) => Promise<T[]>;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result as T;
}

function useTableData<T extends { id: string }>(
  table: TableName,
  orderCol = "created_at"
): TableState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await api<{ data: T[] }>(
        `/api/tenant-data?table=${table}&order=${orderCol}`
      );
      setData(result.data ?? []);
    } catch (error) {
      console.error(`load[${table}]`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [table, orderCol]);

  useEffect(() => {
    load();
  }, [load]);

  const insert = useCallback(
    async (payload: Record<string, unknown>) => {
      const result = await api<{ data: T | null }>(`/api/tenant-data?table=${table}`, {
        method: "POST",
        body: JSON.stringify({ payload }),
      });
      await load();
      return result.data;
    },
    [table, load]
  );

  const update = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      await api(`/api/tenant-data?table=${table}`, {
        method: "PATCH",
        body: JSON.stringify({ id, payload }),
      });
      await load();
    },
    [table, load]
  );

  const remove = useCallback(
    async (id: string) => {
      setData((prev) => prev.filter((row) => row.id !== id));
      try {
        await api(`/api/tenant-data?table=${table}&id=${id}`, { method: "DELETE" });
      } catch (error) {
        await load();
        throw error;
      }
      await load();
    },
    [table, load]
  );

  const batchInsert = useCallback(
    async (rows: Record<string, unknown>[]) => {
      const result = await api<{ data: T[] }>(`/api/tenant-data?table=${table}`, {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
      await load();
      return result.data ?? [];
    },
    [table, load]
  );

  return { data, loading, reload: load, insert, update, remove, batchInsert };
}

export function useAgents()       { return useTableData<DbAgent>("ai_agents"); }
export function useLeads()        { return useTableData<DbLead>("leads"); }
export function useCampaigns()    { return useTableData<DbCampaign>("campaigns"); }
export function useCallLogs()     { return useTableData<DbCallLog>("call_logs"); }
export function useAppointments() { return useTableData<DbAppointment>("appointments", "appointment_date"); }

export interface DbAgent {
  id: string;
  user_id: string;
  org_id?: string;
  organization_id?: string;
  name: string;
  voice: string;
  system_prompt: string;
  is_active: boolean;
  calls_made: number;
  created_at: string;
}
export interface DbLead {
  id: string;
  user_id: string;
  org_id?: string;
  organization_id?: string;
  name: string;
  phone: string;
  email?: string;
  status: "new" | "contacted" | "qualified" | "unqualified" | "booked";
  source?: string;
  campaign_id?: string;
  notes?: string;
  created_at: string;
}
export interface DbCampaign {
  id: string;
  user_id: string;
  org_id?: string;
  organization_id?: string;
  name: string;
  description?: string;
  status: "draft" | "running" | "paused" | "completed";
  agent_id?: string;
  total_leads: number;
  leads_called: number;
  appointments_booked: number;
  created_at: string;
}
export interface DbCallLog {
  id: string;
  user_id: string;
  org_id?: string;
  organization_id?: string;
  lead_id?: string;
  agent_id?: string;
  duration: number;
  status: "in_progress" | "completed" | "no_answer" | "failed" | "voicemail" | "busy";
  transcript?: string;
  recording_url?: string;
  summary?: string;
  vapi_call_id?: string;
  vapi_payload?: Record<string, unknown>;
  created_at: string;
}
export interface DbAppointment {
  id: string;
  user_id: string;
  org_id?: string;
  organization_id?: string;
  lead_id?: string;
  title: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: string;
  notes?: string;
}

export async function getAuthUser() {
  const result = await api<{ user: { id: string; email: string } }>("/api/auth/me");
  return result.user;
}
