# Manolle AI — PRD

## Overview
Manolle AI is a production-grade AI calling automation SaaS. AI voice agents call leads, qualify prospects, book appointments, and provide call summaries. Use cases: Real Estate, Healthcare.

## Tech Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind, Framer Motion, Shadcn UI
- **Data**: Supabase Postgres + Supabase Auth (RLS, user_id-scoped)
- **UI**: Dark-first, cyan (#00F0FF) accent, glassmorphism
- **Realtime**: Supabase `postgres_changes` (optional) PLUS hook-level auto-reload after every mutation

## Architecture
- `/app/frontend` — Next.js 15 app, prod mode (`next build && next start`)
- `/app/supabase/schema.sql` — base schema
- `/app/supabase/migrations/002_realtime_and_profile_columns.sql` — Realtime publication + extra profile columns
- `/app/frontend/src/hooks/useSupabaseData.ts` — central per-user data layer with `insert/update/remove/batchInsert` that auto-reload (works without Realtime publication)

## Implemented (verified Feb 2026)

### Auth
- Supabase email/password signup/login/forgot/reset
- Middleware-protected `/dashboard/*` routes
- Auto-confirm enabled (no email verification needed)

### Dashboard — all user-scoped, real-time
- **Header**: Notification dropdown + Avatar dropdown showing user email, Settings/Profile/Sign out
- **/dashboard overview**: Real per-user KPIs (Calls Completed, Minutes Used, Leads Contacted, Appointments Booked), 7-day call volume chart, recent activity, agent list, upcoming appointments — all from Supabase. ZERO mock data remaining.
- **/dashboard/agents**: Create/Edit/Delete/Toggle. Auto-refresh after mutation.
- **/dashboard/campaigns**: Create/Edit/Delete + Pause/Resume.
- **/dashboard/leads**: Add Lead, status changes, delete. Search + filter.
- **/dashboard/call-history**: View + delete call logs. Joins with leads/agents.
- **/dashboard/calendar**: Native `new Date()`, merges appointments + call_logs.
- **/dashboard/import**: Real CSV parsing (quoted fields), header detection, valid/error/duplicate badges, batch insert to Supabase.
- **/dashboard/analytics**: 4 KPIs (% change vs last month), 6-month volume area chart, outcome pie, agent performance bar chart — all computed from per-user Supabase data.
- **/dashboard/settings**: Profile + Company + Notifications + Billing tabs. Reads/upserts `profiles` table (email read-only from auth). Resilient upsert: splits into core columns (always exist) and extras (silently skipped if migration 002 not applied).

### Data isolation (verified multi-user)
- RLS server-side: every table has `auth.uid() = user_id` policy
- Hook-level: every SELECT adds `.eq("user_id", user.id)`, every INSERT auto-attaches `user_id`
- Verified: User B sees zero of User A's data

## Supabase migrations
1. `/app/supabase/schema.sql` — base tables, RLS policies, auto-profile trigger (already run)
2. `/app/supabase/migrations/002_realtime_and_profile_columns.sql` — adds profile columns + enables realtime publication (optional, app works without it)

## Backlog

### P1
- Run migration 002 in Supabase to unlock cross-tab realtime + full Settings persistence
- Create Supabase Storage bucket `csv-imports` for actual CSV file storage

### P2
- ChatGPT / Emergent LLM for agent prompt testing in-app
- Twilio/VAPI for outbound AI calls + recording playback + live transcripts
- Razorpay 3-plan subscription billing in Settings
- CRM integrations, white-label, mobile app

## Test Credentials
See `/app/memory/test_credentials.md`.

## Changelog
- **2026-02 (initial fork)**: header dropdowns, calendar new Date(), full CRUD on Agents/Leads/Campaigns/Call History/Import, deletes auto-update UI, sonner toast bottom-right.
- **2026-05 (this iteration)**:
  - Rewrote `useSupabaseData.ts` hook → mutators auto-reload after every CUD (works without Realtime publication)
  - Killed all mock data on `/dashboard` (no more 247/1847/189/43)
  - Rewrote `/dashboard/analytics` to be fully user-scoped
  - Wired Settings to live `profiles` table with resilient split upsert (core + extras)
  - Replaced last hardcoded "2025" strings with `new Date().getFullYear()` / dynamic
  - Added migration 002 SQL: realtime publication + profile extra columns
