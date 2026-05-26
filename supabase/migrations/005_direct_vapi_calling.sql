-- Direct Vapi calling support.
-- Run after 003_saas_foundation.sql.

ALTER TABLE public.call_logs
  ADD COLUMN IF NOT EXISTS vapi_call_id TEXT,
  ADD COLUMN IF NOT EXISTS vapi_payload JSONB DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_call_logs_vapi_call_id
  ON public.call_logs(vapi_call_id)
  WHERE vapi_call_id IS NOT NULL;

ALTER TABLE public.call_logs
  DROP CONSTRAINT IF EXISTS call_logs_status_check;

ALTER TABLE public.call_logs
  ADD CONSTRAINT call_logs_status_check
  CHECK (status IN ('in_progress', 'completed', 'no_answer', 'failed', 'voicemail', 'busy'));
