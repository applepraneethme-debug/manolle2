"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type TableName = "ai_agents" | "leads" | "campaigns" | "call_logs" | "appointments";

// Generic real-time hook for any Supabase table scoped to current user
function useTableData<T>(table: TableName, orderCol = "created_at") {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: rows } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", user.id)
        .order(orderCol, { ascending: false });
      setData((rows as T[]) ?? []);
    } catch (e) {
      console.error(`useTableData [${table}]`, e);
    } finally {
      setLoading(false);
    }
  }, [table, orderCol]);

  useEffect(() => {
    load();
    const supabase = createClient();
    const ch = supabase
      .channel(`rt_${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load, table]);

  return { data, loading, reload: load, setData };
}

export function useAgents()       { return useTableData<DbAgent>("ai_agents"); }
export function useLeads()        { return useTableData<DbLead>("leads"); }
export function useCampaigns()    { return useTableData<DbCampaign>("campaigns"); }
export function useCallLogs()     { return useTableData<DbCallLog>("call_logs"); }
export function useAppointments() { return useTableData<DbAppointment>("appointments", "appointment_date"); }

// ─── Types ────────────────────────────────────────────────────────────────
export interface DbAgent {
  id: string; user_id: string; name: string; voice: string;
  system_prompt: string; is_active: boolean; calls_made: number; created_at: string;
}
export interface DbLead {
  id: string; user_id: string; name: string; phone: string; email?: string;
  status: "new"|"contacted"|"qualified"|"unqualified"|"booked";
  source?: string; campaign_id?: string; notes?: string; created_at: string;
}
export interface DbCampaign {
  id: string; user_id: string; name: string; description?: string;
  status: "draft"|"running"|"paused"|"completed"; agent_id?: string;
  total_leads: number; leads_called: number; appointments_booked: number; created_at: string;
}
export interface DbCallLog {
  id: string; user_id: string; lead_id?: string; agent_id?: string;
  duration: number; status: "completed"|"no_answer"|"failed"|"voicemail"|"busy";
  transcript?: string; recording_url?: string; summary?: string; created_at: string;
}
export interface DbAppointment {
  id: string; user_id: string; lead_id?: string; title: string;
  appointment_date: string; appointment_time: string; type: string; status: string; notes?: string;
}

// ─── CRUD helpers (always scoped to current user) ─────────────────────────
export async function dbInsert(table: TableName, payload: Record<string, unknown>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from(table)
    .insert({ ...payload, user_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

export async function dbUpdate(table: TableName, id: string, payload: Record<string, unknown>) {
  const supabase = createClient();
  const { error } = await supabase.from(table).update(payload).eq("id", id);
  if (error) throw error;
}

export async function dbDelete(table: TableName, id: string) {
  const supabase = createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function dbBatchInsert(table: TableName, rows: Record<string, unknown>[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from(table)
    .insert(rows.map(r => ({ ...r, user_id: user.id }))).select();
  if (error) throw error;
  return data ?? [];
}

export async function getAuthUser() {
  const { data: { user } } = await createClient().auth.getUser();
  return user;
}
