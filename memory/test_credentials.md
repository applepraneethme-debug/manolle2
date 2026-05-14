# Manolle AI — Test Credentials

## Supabase Configuration (ACTIVE)
- URL: https://wtgzckpqmskidxlfmscq.supabase.co
- Auth mode: REAL (Supabase Auth, no demo)
- Auto-confirm: ENABLED (signups go straight to logged-in, no email verification needed)

## Working Test Account (verified by testing agent on 2026-05-14)
- Email: qa_test_1778769601@manolleai.test
- Password: TestPass123!

## How to Create More Test Accounts
1. Visit /auth/signup
2. Any email format works; password ≥ 8 characters
3. Login is immediate after signup (no email link needed).

## DO NOT USE
- test@manolleai.com / TestPass123!  → returns "Invalid login credentials"

## App URL
https://ba97c98c-acb3-4891-ab97-d6f7ba44dd57.preview.emergentagent.com

## Database (Supabase Public schema, RLS enabled)
Tables: profiles, ai_agents, campaigns, leads, call_logs, appointments, usage_tracking.
All queries scoped by user_id via RLS (auth.uid() = user_id).
