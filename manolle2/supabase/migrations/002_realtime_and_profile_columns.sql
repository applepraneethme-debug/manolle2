-- ============================================
-- MANOLLE AI — Migration 002
-- Adds missing profile columns + enables Realtime
-- Run this in Supabase → SQL Editor (it is safe to re-run)
-- ============================================

-- ---------- 1. Extend public.profiles with new columns ----------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS notif_call_completed BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notif_appointment_booked BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notif_campaign_finished BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notif_weekly_report BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notif_low_balance BOOLEAN DEFAULT TRUE;

-- ---------- 2. Enable Realtime (postgres_changes) on user tables ----------
-- Idempotent: drop-add pattern works on a fresh project; if a table is
-- already in the publication Supabase will simply error on the ADD — that's safe.
DO $$
BEGIN
  -- ai_agents
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_agents;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- campaigns
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- leads
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- call_logs
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- appointments
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- profiles
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ---------- 3. (Optional) Storage bucket for CSV uploads ----------
-- Run this in Supabase → Storage UI (or via SQL) if you want CSV files
-- physically stored. The app already works without this bucket.
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('csv-imports', 'csv-imports', false)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Users manage own csv imports"
--   ON storage.objects FOR ALL
--   USING (bucket_id = 'csv-imports' AND (storage.foldername(name))[1] = auth.uid()::text)
--   WITH CHECK (bucket_id = 'csv-imports' AND (storage.foldername(name))[1] = auth.uid()::text);
