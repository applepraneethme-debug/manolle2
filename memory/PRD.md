# Manolle AI — PRD

## Overview
Manolle AI is a production-grade AI calling automation SaaS platform for businesses. AI voice agents automatically call leads, qualify prospects, book appointments, and provide call summaries. Primary use cases: Real Estate (site visits) and Healthcare/Appointments.

## Tech Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: FastAPI (placeholder for future AI integrations), Supabase PostgreSQL + Auth
- **UI**: Glassmorphism, dark-first, cyan (#00F0FF) accent, Outfit + Manrope fonts
- **Deployment**: Vercel-ready, GitHub-ready

## Architecture
- `/app/frontend` — Next.js 15 app (port 3000)
- `/app/backend` — FastAPI service (port 8001) for future AI integrations
- `/app/supabase/schema.sql` — PostgreSQL schema for Supabase

## Implemented Features (as of Feb 2025)

### Landing Page
- Hero section with CTA buttons
- Features grid (6 cards)
- Use Cases section (Real Estate + Healthcare)
- How It Works (3 steps)
- Testimonials (3 cards)
- Pricing section (Starter ₹2,999 / Pro ₹7,999 / Enterprise Custom)
- Footer

### Authentication (Supabase)
- Login page with demo mode support
- Signup page (with email verification)
- Forgot password page
- Reset password page
- Auth callback route
- Middleware for route protection
- Demo mode when credentials are placeholder values

### Dashboard
- Overview: 4 stat cards, call volume chart, recent activity, agent status, upcoming appointments
- AI Agents: Create/edit/delete agents, name/voice/system prompt, active toggle
- Campaigns: List with status (running/paused/completed/draft), progress bars, pause/resume
- Leads: Searchable/filterable table with status badges
- Import CSV: Drag-drop upload, preview table with validation, import summary
- Call History: Searchable/filterable table with duration, status, transcripts
- Calendar: Monthly grid with appointment dots, upcoming meetings sidebar
- Analytics: KPI cards, area chart, pie chart, bar chart
- Settings: Profile, Company, Notifications (toggles), Billing (3 plans)

### Database Schema
Tables: profiles, ai_agents, campaigns, leads, call_logs, appointments, usage_tracking

## Configuration

### Environment Variables
Frontend (.env):
- REACT_APP_BACKEND_URL — backend API URL
- NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key

Backend (.env):
- MONGO_URL — MongoDB connection string
- DB_NAME — Database name

## Pending / Backlog

### P0 (Must Have)
- Connect real Supabase credentials
- Run schema.sql in Supabase SQL Editor
- Test full auth flow with real Supabase

### P1 (High Priority - Next Phase)
- Razorpay subscription integration for 3 billing plans
- Connect OpenAI for AI voice agent system prompt testing
- Real Supabase CRUD for agents, campaigns, leads, call logs

### P2 (Future)
- Actual AI calling integration (Twilio/VAPI)
- Call recording playback
- Real-time call transcripts
- CSV import with validation + Supabase insertion
- CRM integrations
- White-label option for Enterprise
- Mobile app

## Next Action Items
1. User provides NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
2. Run /app/supabase/schema.sql in Supabase SQL Editor
3. Update /app/frontend/.env with real credentials
4. Restart frontend: sudo supervisorctl restart frontend
5. Test full auth flow
6. Add Razorpay payment integration
