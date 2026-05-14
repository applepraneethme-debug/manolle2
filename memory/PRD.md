# Manolle AI — PRD

## Overview
Manolle AI is a production-grade AI calling automation SaaS platform. AI voice agents automatically call leads, qualify prospects, book appointments, and provide call summaries. Primary use cases: Real Estate (site visits) and Healthcare/Appointments.

## Tech Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend / Data**: Supabase PostgreSQL + Supabase Auth (RLS enforced). FastAPI placeholder exists but is unused.
- **UI**: Glassmorphism, dark-first, cyan (#00F0FF) accent, Outfit + Manrope fonts
- **Realtime**: Supabase `postgres_changes` subscriptions per table

## Architecture
- `/app/frontend` — Next.js 15 app (port 3000), runs in PRODUCTION mode via `next build && next start`
- `/app/backend` — empty FastAPI (placeholder)
- `/app/supabase/schema.sql` — PostgreSQL schema (RLS policies + auto-profile trigger)
- `/app/frontend/src/hooks/useSupabaseData.ts` — central real-time data layer + CRUD helpers scoped to user_id

## Implemented Features (Feb 2026)

### Landing & Auth
- Landing page with hero, features, use cases, pricing
- Supabase email/password Signup, Login, Forgot/Reset Password, OAuth callback route
- Middleware-based route protection

### Dashboard — wired to live Supabase (user-scoped, real-time)
- **Header**: Notification dropdown (Bell) + Profile dropdown (Avatar) with email, Settings/Profile links, Sign out — `data-testid` on every element
- **AI Agents** (`/dashboard/agents`): Create/Edit/Delete/Toggle active via `ai_agents` table. Real-time list refresh.
- **Campaigns** (`/dashboard/campaigns`): Create/Edit/Delete + Pause/Resume status toggle via `campaigns` table.
- **Leads** (`/dashboard/leads`): Add Lead dialog (name + phone required), status changes, delete. Filter + search.
- **Call History** (`/dashboard/call-history`): Lists `call_logs` joined with leads/agents from hooks. Delete supported. Dynamic Today/Yesterday/date formatting.
- **Calendar** (`/dashboard/calendar`): Native `new Date()` for current month, merges `appointments` + `call_logs`, Today button, day-event preview, upcoming list.
- **Import CSV** (`/dashboard/import`): Real CSV parsing (quoted fields supported), header detection (name/phone/email), valid/error/duplicate classification, batch insert via `dbBatchInsert`, optional per-user storage path `csv-imports/{user_id}/...`.
- **Settings**: Profile, Company, Notifications toggles, Billing (UI for 3 plans).

### Data layer (`useSupabaseData.ts`)
- `useAgents/useLeads/useCampaigns/useCallLogs/useAppointments` — auto-fetch + subscribe to postgres_changes
- `dbInsert/dbUpdate/dbDelete/dbBatchInsert` — always attach `user_id` from auth on insert
- RLS policies on every table ensure server-side isolation

### Still on mock data (deferred)
- `/dashboard` overview KPIs and activity feed (P1)
- `/dashboard/analytics` charts (P1)

## Configuration

### Environment Variables
Frontend (`.env`):
- REACT_APP_BACKEND_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Backend (`.env`):
- MONGO_URL, DB_NAME (unused — FastAPI is placeholder)

## Backlog

### P1 (Next)
- Wire `/dashboard` overview KPIs & activity feed to real Supabase counts
- Wire `/dashboard/analytics` charts to real call_logs / appointments data
- Create optional Supabase Storage bucket `csv-imports` (currently bypassed gracefully if missing)

### P2 (Future)
- ChatGPT / Emergent LLM integration to test agent system prompts
- Twilio/VAPI for actual outbound AI calls
- Call recording playback UI
- Real-time call transcripts
- Razorpay subscription billing (3 plans)
- CRM integrations
- White-label option for Enterprise
- Mobile app

## Test Credentials
See `/app/memory/test_credentials.md` for the verified working account.

## Recent Changes (2026-02 fork)
- 2026-05-14: Implemented Message 94 P0 batch — header dropdowns wired, calendar uses native `new Date()`, full Supabase CRUD on Agents/Leads/Campaigns/Call History/Import, deletes now fire real DB requests with auto-refresh via realtime subscriptions, CSV import does real parsing + batch insert. Moved sonner toast to `bottom-right` (was overlapping header buttons).
