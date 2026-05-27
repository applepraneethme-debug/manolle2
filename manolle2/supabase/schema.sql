-- ============================================
-- MANOLLE AI — SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- AI AGENTS
-- ============================================
CREATE TABLE public.ai_agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  voice TEXT DEFAULT 'professional-male',
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  calls_made INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own agents" ON public.ai_agents
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CAMPAIGNS
-- ============================================
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  agent_id UUID REFERENCES public.ai_agents(id),
  total_leads INTEGER DEFAULT 0,
  leads_called INTEGER DEFAULT 0,
  appointments_booked INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own campaigns" ON public.campaigns
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'booked')),
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own leads" ON public.leads
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CALL LOGS
-- ============================================
CREATE TABLE public.call_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id),
  agent_id UUID REFERENCES public.ai_agents(id),
  duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'no_answer', 'failed', 'voicemail', 'busy')),
  transcript TEXT,
  recording_url TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own call logs" ON public.call_logs
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id),
  title TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  type TEXT DEFAULT 'other' CHECK (type IN ('site_visit', 'clinic', 'consultation', 'demo', 'other')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own appointments" ON public.appointments
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USAGE TRACKING
-- ============================================
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  calls_used INTEGER DEFAULT 0,
  minutes_used INTEGER DEFAULT 0,
  agents_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, month)
);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.usage_tracking
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_campaign_id ON public.leads(campaign_id);
CREATE INDEX idx_call_logs_user_id ON public.call_logs(user_id);
CREATE INDEX idx_call_logs_lead_id ON public.call_logs(lead_id);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_ai_agents_user_id ON public.ai_agents(user_id);
