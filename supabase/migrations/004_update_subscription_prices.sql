-- ============================================
-- MANOLLE AI — Migration 004
-- Updates subscription display prices.
-- Run this after migration 003 if your Supabase project already has plan_limits.
-- ============================================

ALTER TABLE public.plan_limits
  ADD COLUMN IF NOT EXISTS monthly_price_inr INTEGER,
  ADD COLUMN IF NOT EXISTS display_price TEXT;

UPDATE public.plan_limits
SET
  monthly_price_inr = 999,
  display_price = '₹999/month',
  updated_at = NOW()
WHERE plan = 'starter';

UPDATE public.plan_limits
SET
  monthly_price_inr = 1699,
  display_price = '₹1,699/month',
  updated_at = NOW()
WHERE plan = 'pro';

UPDATE public.plan_limits
SET
  monthly_price_inr = NULL,
  display_price = 'Contact me',
  updated_at = NOW()
WHERE plan = 'enterprise';
