export interface Agent {
  id: string;
  name: string;
  voice: string;
  system_prompt: string;
  is_active: boolean;
  calls_made: number;
  created_at: string;
  user_id: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: "running" | "paused" | "completed" | "draft";
  agent_id: string;
  total_leads: number;
  leads_called: number;
  appointments_booked: number;
  created_at: string;
  user_id: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: "new" | "contacted" | "qualified" | "unqualified" | "booked";
  source?: string;
  campaign_id?: string;
  notes?: string;
  created_at: string;
  user_id: string;
}

export interface CallLog {
  id: string;
  lead_id: string;
  agent_id: string;
  duration: number;
  status: "in_progress" | "completed" | "no_answer" | "failed" | "voicemail" | "busy";
  transcript?: string;
  recording_url?: string;
  summary?: string;
  vapi_call_id?: string;
  created_at: string;
  lead_name?: string;
  agent_name?: string;
}

export interface Appointment {
  id: string;
  lead_id: string;
  title: string;
  date: string;
  time: string;
  type: "site_visit" | "clinic" | "consultation" | "demo" | "other";
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  lead_name?: string;
  phone?: string;
}

export interface DashboardStats {
  total_calls: number;
  total_minutes: number;
  leads_contacted: number;
  appointments_booked: number;
  calls_this_week: number;
  appointments_this_week: number;
}

export interface Profile {
  id: string;
  full_name?: string;
  company_name?: string;
  phone?: string;
  avatar_url?: string;
  plan: "starter" | "pro" | "enterprise";
  created_at: string;
}
