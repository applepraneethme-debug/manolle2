"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

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

// Generic real-time hook for any Supabase table, scoped to current user.
// Uses both:
//   1) Supabase realtime postgres_changes (if publication is enabled), AND
//   2) Explicit reload() after every insert/update/remove call from this hook.
// This ensures the UI updates immediately even if realtime is disabled.
function useTableData<T extends { id: string }>(
  table: TableName,
  orderCol = "created_at"
): TableState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setData([]);
        return;
      }
      userIdRef.current = user.id;
      const { data: rows, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", user.id)
        .order(orderCol, { ascending: false });
      if (error) {
        console.error(`load[${table}]`, error);
        return;
      }
      setData((rows as T[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, [table, orderCol]);

  useEffect(() => {
    load();
    const supabase = createClient();
    const ch = supabase
      .channel(`rt_${table}_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          load();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load, table]);

  const insert = useCallback(
    async (payload: Record<string, unknown>) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: row, error } = await supabase
        .from(table)
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      await load();
      return (row as T) ?? null;
    },
    [table, load]
  );

  const update = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      const supabase = createClient();
      const { error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id);
      if (error) throw error;
      await load();
    },
    [table, load]
  );

  const remove = useCallback(
    async (id: string) => {
      const supabase = createClient();
      // Optimistic removal so the UI updates instantly, then reload to confirm.
      setData((prev) => prev.filter((r) => r.id !== id));
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        await load(); // restore on failure
        throw error;
      }
      await load();
    },
    [table, load]
  );

  const batchInsert = useCallback(
    async (rows: Record<string, unknown>[]) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: inserted, error } = await supabase
        .from(table)
        .insert(rows.map((r) => ({ ...r, user_id: user.id })))
        .select();
      if (error) throw error;
      await load();
      return (inserted as T[]) ?? [];
    },
    [table, load]
  );

  return { data, loading, reload: load, insert, update, remove, batchInsert };
}

// ─── Typed wrappers ───────────────────────────────────────────────────────
export function useAgents()       { return useTableData<DbAgent>("ai_agents"); }
export function useLeads()        { return useTableData<DbLead>("leads"); }
export function useCampaigns()    { return useTableData<DbCampaign>("campaigns"); }
export function useCallLogs()     { return useTableData<DbCallLog>("call_logs"); }
export function useAppointments() { return useTableData<DbAppointment>("appointments", "appointment_date"); }

// ─── Types ─────────────────────────────────────────────────────────────────
export interface DbAgent {
  id: string;
  user_id: string;
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
  lead_id?: string;
  agent_id?: string;
  duration: number;
  status: "completed" | "no_answer" | "failed" | "voicemail" | "busy";
  transcript?: string;
  recording_url?: string;
  summary?: string;
  created_at: string;
}
export interface DbAppointment {
  id: string;
  user_id: string;
  lead_id?: string;
  title: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: string;
  notes?: string;
}

export async function getAuthUser() {
  const { data: { user } } = await createClient().auth.getUser();
  return user;
}
