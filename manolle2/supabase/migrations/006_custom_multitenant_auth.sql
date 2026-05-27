-- ============================================
-- MANOLLE AI — Migration 006
-- Custom multi-tenant auth + admin-managed clients
-- RAG/pgvector intentionally omitted.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT UNIQUE,
  business_name TEXT,
  business_type TEXT CHECK (business_type IN ('salon', 'clinic', 'realestate', 'other')),
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT TRUE,
  max_users INTEGER DEFAULT 1,
  calls_limit INTEGER DEFAULT 500,
  leads_limit INTEGER DEFAULT 200,
  vapi_assistant_id TEXT,
  vapi_phone_number_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS client_id TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS calls_limit INTEGER DEFAULT 500,
  ADD COLUMN IF NOT EXISTS leads_limit INTEGER DEFAULT 200,
  ADD COLUMN IF NOT EXISTS vapi_assistant_id TEXT,
  ADD COLUMN IF NOT EXISTS vapi_phone_number_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_client_id_unique
  ON public.organizations(client_id)
  WHERE client_id IS NOT NULL;

WITH numbered_orgs AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS row_number
  FROM public.organizations
  WHERE client_id IS NULL
)
UPDATE public.organizations org
SET
  business_name = COALESCE(org.business_name, org.name, 'Manolle Client'),
  business_type = COALESCE(org.business_type, 'other'),
  client_id = COALESCE(
    org.client_id,
    'MAN-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(numbered_orgs.row_number::TEXT, 3, '0')
  )
FROM numbered_orgs
WHERE org.id = numbered_orgs.id;

UPDATE public.organizations
SET
  business_name = COALESCE(business_name, name, 'Manolle Client'),
  business_type = COALESCE(business_type, 'other')
WHERE business_name IS NULL OR business_type IS NULL;

ALTER TABLE public.organizations
  ALTER COLUMN client_id SET NOT NULL,
  ALTER COLUMN business_name SET NOT NULL,
  ALTER COLUMN business_type SET DEFAULT 'other';

CREATE TABLE IF NOT EXISTS public.org_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'staff')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.org_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.call_logs ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.usage_tracking ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);

UPDATE public.leads SET org_id = organization_id WHERE org_id IS NULL AND organization_id IS NOT NULL;
UPDATE public.call_logs SET org_id = organization_id WHERE org_id IS NULL AND organization_id IS NOT NULL;
UPDATE public.campaigns SET org_id = organization_id WHERE org_id IS NULL AND organization_id IS NOT NULL;
UPDATE public.appointments SET org_id = organization_id WHERE org_id IS NULL AND organization_id IS NOT NULL;
UPDATE public.ai_agents SET org_id = organization_id WHERE org_id IS NULL AND organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_org_users_org_id ON public.org_users(org_id);
CREATE INDEX IF NOT EXISTS idx_org_users_email ON public.org_users(email);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON public.active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON public.leads(org_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_org_id ON public.call_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON public.campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_appointments_org_id ON public.appointments(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_org_id ON public.ai_agents(org_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_org_id ON public.usage_tracking(org_id);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_current_org_id(token TEXT)
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT ou.org_id
  FROM public.active_sessions s
  JOIN public.org_users ou ON s.user_id = ou.id
  JOIN public.organizations org ON org.id = ou.org_id
  WHERE s.session_token = token
    AND s.expires_at > NOW()
    AND ou.is_active = TRUE
    AND org.is_active = TRUE
    AND (org.expires_at IS NULL OR org.expires_at > NOW())
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.next_client_id()
RETURNS TEXT LANGUAGE PLPGSQL AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX((regexp_match(client_id, '^MAN-[0-9]{4}-([0-9]+)$'))[1]::INTEGER), 0) + 1
  INTO next_number
  FROM public.organizations
  WHERE client_id LIKE 'MAN-%';

  RETURN 'MAN-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(next_number::TEXT, 3, '0');
END;
$$;
