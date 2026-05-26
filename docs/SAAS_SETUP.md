# Manolle AI SaaS Setup

This file tracks the production setup steps for turning the prototype into a real SaaS app.

## Step 1 — Foundation

Files added or changed:

- `.gitignore` keeps secrets, local build output, generated state, and test credentials out of Git.
- `.env.example` lists all shared production variables.
- `frontend/.env.example` lists frontend-safe public variables.
- `backend/.env.example` lists private backend secrets.
- `backend/server.py` now uses `BACKEND_ALLOWED_ORIGINS` instead of allowing every website.
- `supabase/migrations/003_saas_foundation.sql` adds SaaS tables for organizations, members, subscriptions, plan limits, and usage events.

## Step 2 — Supabase

Run these SQL files in Supabase SQL Editor, in this order:

1. `supabase/schema.sql`
2. `supabase/migrations/002_realtime_and_profile_columns.sql`
3. `supabase/migrations/003_saas_foundation.sql`

After running migration 003, every new signup automatically gets:

- one organization
- one owner membership
- one trialing starter subscription

Existing prototype users are backfilled into organizations too.

## Step 3 — Local Environment

Create these local files from the examples:

- copy `frontend/.env.example` to `frontend/.env.local`
- copy `backend/.env.example` to `backend/.env`

Never commit real `.env` files.

## Step 4 — Required Values

Frontend:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VAPI_PRIVATE_KEY=your_vapi_private_api_key
VAPI_ASSISTANT_ID=your_vapi_assistant_id
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
VAPI_WEBHOOK_SECRET=replace_with_long_random_secret
```

Backend:

```env
BACKEND_ALLOWED_ORIGINS=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VAPI_PRIVATE_KEY=your_vapi_private_api_key
VAPI_ASSISTANT_ID=your_vapi_assistant_id
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
VAPI_WEBHOOK_SECRET=replace_with_long_random_secret
```

Production `BACKEND_ALLOWED_ORIGINS` should be your real domain, for example:

```env
BACKEND_ALLOWED_ORIGINS=https://manolle.ai,https://www.manolle.ai
```

## Step 5 — Next Build Items

The next code layers are:

1. Stripe checkout and webhook routes.
2. Usage-limit checks before every call.
3. Dashboard billing and usage screen.

## Step 6 — Auth Email Verification

In Supabase:

1. Go to `Authentication` → `Providers` → `Email`.
2. Turn on email confirmation.
3. Go to `Authentication` → `URL Configuration`.
4. Set `Site URL` to your production website URL.
5. Add this redirect URL:

```text
https://your-domain.com/auth/callback
```

For local testing, also add:

```text
http://localhost:3000/auth/callback
```

The app signup page already sends users to `/auth/callback` after email verification.
