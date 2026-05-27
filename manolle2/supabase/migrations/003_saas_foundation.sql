-- ============================================
-- MANOLLE AI — Migration 003
-- SaaS foundation: organizations, subscriptions, plan limits, usage ledger
-- Run this after schema.sql and migration 002.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- 1. Plan catalog ----------
CREATE TABLE IF NOT EXISTS public.plan_limits (
  plan TEXT PRIMARY KEY CHECK (plan IN ('starter', 'pro', 'enterprise')),
  monthly_call_limit INTEGER,
  monthly_minute_limit INTEGER,
  agent_limit INTEGER,
  lead_limit INTEGER,
  team_member_limit INTEGER,
  monthly_price_inr INTEGER,
  display_price TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.plan_limits (
  plan,
  monthly_call_limit,
  monthly_minute_limit,
  agent_limit,
  lead_limit,
  team_member_limit,
  monthly_price_inr,
  display_price
)
VALUES
  ('starter', 100, 500, 1, 1000, 1, 999, '₹999/month'),
  ('pro', 1000, 5000, 5, 10000, 5, 1699, '₹1,699/month'),
  ('enterprise', NULL, NULL, NULL, NULL, NULL, NULL, 'Contact me')
ON CONFLICT (plan) DO UPDATE SET
  monthly_call_limit = EXCLUDED.monthly_call_limit,
  monthly_minute_limit = EXCLUDED.monthly_minute_limit,
  agent_limit = EXCLUDED.agent_limit,
  lead_limit = EXCLUDED.lead_limit,
  team_member_limit = EXCLUDED.team_member_limit,
  monthly_price_inr = EXCLUDED.monthly_price_inr,
  display_price = EXCLUDED.display_price,
  updated_at = NOW();

ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read plan limits" ON public.plan_limits;
CREATE POLICY "Anyone can read plan limits" ON public.plan_limits
  FOR SELECT USING (TRUE);

-- ---------- 2. Organizations / workspaces ----------
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_organization_members_org_id
  ON public.organization_members(organization_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_user_id
  ON public.organization_members(user_id);

CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = org_id
      AND om.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  );
$$;

DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
CREATE POLICY "Users can view their organizations" ON public.organizations
  FOR SELECT USING (public.is_org_member(id));

DROP POLICY IF EXISTS "Users can create owned organizations" ON public.organizations;
CREATE POLICY "Users can create owned organizations" ON public.organizations
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Owners and admins can update organizations" ON public.organizations;
CREATE POLICY "Owners and admins can update organizations" ON public.organizations
  FOR UPDATE USING (public.is_org_admin(id));

DROP POLICY IF EXISTS "Users can view org memberships" ON public.organization_members;
CREATE POLICY "Users can view org memberships" ON public.organization_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_org_admin(organization_id)
  );

DROP POLICY IF EXISTS "Users can create their owner membership" ON public.organization_members;
CREATE POLICY "Users can create their owner membership" ON public.organization_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND role = 'owner'
    AND EXISTS (
      SELECT 1
      FROM public.organizations org
      WHERE org.id = organization_id
        AND org.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can manage org memberships" ON public.organization_members;
CREATE POLICY "Owners can manage org memberships" ON public.organization_members
  FOR UPDATE USING (public.is_org_admin(organization_id));

-- ---------- 3. Attach existing business data to organizations ----------
ALTER TABLE public.ai_agents
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.call_logs
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ai_agents_organization_id ON public.ai_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_organization_id ON public.campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_organization_id ON public.call_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON public.appointments(organization_id);

-- ---------- 4. Subscriptions ----------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter' REFERENCES public.plan_limits(plan),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (
    status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired')
  ),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id
  ON public.subscriptions(organization_id);

DROP POLICY IF EXISTS "Members can view org subscription" ON public.subscriptions;
CREATE POLICY "Members can view org subscription" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = subscriptions.organization_id
        AND om.user_id = auth.uid()
    )
  );

-- Inserts/updates happen from Stripe webhook or backend using service-role key.

-- ---------- 5. Usage ledger ----------
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('call_started', 'call_completed', 'call_failed', 'minute_used', 'agent_created', 'lead_imported')
  ),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_usage_events_org_created_at
  ON public.usage_events(organization_id, created_at DESC);

DROP POLICY IF EXISTS "Members can view org usage events" ON public.usage_events;
CREATE POLICY "Members can view org usage events" ON public.usage_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = usage_events.organization_id
        AND om.user_id = auth.uid()
    )
  );

-- Inserts happen through trusted backend only so customers cannot fake usage.

CREATE OR REPLACE VIEW public.organization_monthly_usage AS
SELECT
  organization_id,
  DATE_TRUNC('month', created_at)::DATE AS month,
  COALESCE(SUM(quantity) FILTER (WHERE event_type = 'call_completed'), 0)::INTEGER AS calls_used,
  COALESCE(SUM(quantity) FILTER (WHERE event_type = 'minute_used'), 0)::INTEGER AS minutes_used,
  COALESCE(SUM(quantity) FILTER (WHERE event_type = 'agent_created'), 0)::INTEGER AS agents_created,
  COALESCE(SUM(quantity) FILTER (WHERE event_type = 'lead_imported'), 0)::INTEGER AS leads_imported
FROM public.usage_events
GROUP BY organization_id, DATE_TRUNC('month', created_at)::DATE;

-- ---------- 6. Auto-create organization on signup ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  org_name := COALESCE(
    NULLIF(new.raw_user_meta_data->>'company_name', ''),
    NULLIF(new.raw_user_meta_data->>'full_name', ''),
    split_part(new.email, '@', 1),
    'My Organization'
  );

  INSERT INTO public.organizations (name, owner_user_id)
  VALUES (org_name, new.id)
  RETURNING id INTO org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, new.id, 'owner');

  INSERT INTO public.subscriptions (organization_id, plan, status)
  VALUES (org_id, 'starter', 'trialing');

  RETURN new;
END;
$$;

-- ---------- 7. Backfill existing prototype users ----------
DO $$
DECLARE
  profile_row RECORD;
  org_id UUID;
  org_name TEXT;
BEGIN
  FOR profile_row IN SELECT id, full_name, company_name FROM public.profiles LOOP
    SELECT om.organization_id
    INTO org_id
    FROM public.organization_members om
    WHERE om.user_id = profile_row.id
    ORDER BY om.created_at ASC
    LIMIT 1;

    IF org_id IS NULL THEN
      org_name := COALESCE(
        NULLIF(profile_row.company_name, ''),
        NULLIF(profile_row.full_name, ''),
        'My Organization'
      );

      INSERT INTO public.organizations (name, owner_user_id)
      VALUES (org_name, profile_row.id)
      RETURNING id INTO org_id;

      INSERT INTO public.organization_members (organization_id, user_id, role)
      VALUES (org_id, profile_row.id, 'owner')
      ON CONFLICT (organization_id, user_id) DO NOTHING;
    END IF;

    INSERT INTO public.subscriptions (organization_id, plan, status)
    VALUES (org_id, COALESCE((SELECT plan FROM public.profiles WHERE id = profile_row.id), 'starter'), 'trialing')
    ON CONFLICT (organization_id) DO NOTHING;

    UPDATE public.ai_agents
    SET organization_id = org_id
    WHERE user_id = profile_row.id AND organization_id IS NULL;

    UPDATE public.campaigns
    SET organization_id = org_id
    WHERE user_id = profile_row.id AND organization_id IS NULL;

    UPDATE public.leads
    SET organization_id = org_id
    WHERE user_id = profile_row.id AND organization_id IS NULL;

    UPDATE public.call_logs
    SET organization_id = org_id
    WHERE user_id = profile_row.id AND organization_id IS NULL;

    UPDATE public.appointments
    SET organization_id = org_id
    WHERE user_id = profile_row.id AND organization_id IS NULL;
  END LOOP;
END $$;
