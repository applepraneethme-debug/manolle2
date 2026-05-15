# Manolle AI — Test Credentials

## Supabase Configuration (ACTIVE)
- URL: https://wtgzckpqmskidxlfmscq.supabase.co
- Auth mode: REAL Supabase Auth
- Auto-confirm: ENABLED (signups go straight to logged-in, no email verification)

## Working Test Accounts
- User A: qa_test_a_1778863521@manolleai.test / TestPass123!
  (has Profile: Alpha Tester / +91 90000 11111 / Company: Alpha Co)
- User B: qa_test_b_1778863682@manolleai.test / TestPass123!  (fresh, empty)

## How to Create More Test Accounts
1. Visit /auth/signup
2. Any email format works; password ≥ 8 characters
3. Login is immediate after signup.

## DO NOT USE
- test@manolleai.com / TestPass123!  → returns "Invalid login credentials"

## App URL
https://ba97c98c-acb3-4891-ab97-d6f7ba44dd57.preview.emergentagent.com

## Database
Tables: profiles, ai_agents, campaigns, leads, call_logs, appointments, usage_tracking.
All queries scoped by user_id via RLS (auth.uid() = user_id).

## Supabase Migration to run (optional but recommended)
- `/app/supabase/migrations/002_realtime_and_profile_columns.sql`
- Adds: profile extra columns (timezone, website, industry, description, notif_*)
- Enables: Supabase Realtime publication for live cross-tab sync
- App works fully without this migration — Settings save already falls back gracefully.
