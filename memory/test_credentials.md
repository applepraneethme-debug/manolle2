# Manolle AI — Test Credentials

## Supabase Configuration (ACTIVE)
- URL: https://wtgzckpqmskidxlfmscq.supabase.co
- Auth mode: REAL (not demo)

## Test Account
- Email: test@manolleai.com
- Password: TestPass123!
- NOTE: Account requires email verification (mailer_autoconfirm: false in Supabase).
  If login fails with "Email not confirmed", create a fresh account via the signup page:
    1. Visit /auth/signup
    2. Use email/password of choice (password ≥ 8 chars)
    3. If email confirmation is required, user must check email and click link.
    4. Alternatively, the project owner can disable "Confirm email" in Supabase Auth settings.

## App URL
https://ba97c98c-acb3-4891-ab97-d6f7ba44dd57.preview.emergentagent.com

## Database Tables (Supabase Public schema, RLS enabled)
- profiles, ai_agents, campaigns, leads, call_logs, appointments, usage_tracking
- All queries are scoped by user_id; RLS enforces auth.uid() = user_id.

## Supabase Dashboard Setup (Already done by user)
1. Authentication > URL Configuration:
   - Site URL & Redirect URL set to preview URL above
2. SQL Editor: /app/supabase/schema.sql has been executed
