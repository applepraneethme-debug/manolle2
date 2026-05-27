# Direct Vapi Calling

Manolle now starts outbound AI calls directly from the website and receives post-call data directly from Vapi.

## Flow

1. A user clicks `Start AI Call` in `Dashboard -> Leads`.
2. `POST /api/calls/start` validates the logged-in user and lead.
3. The route calls `https://api.vapi.ai/call` with your saved assistant, Vapi phone number, customer number, and Manolle metadata.
4. Vapi places the call using the Twilio/Vapi phone number already connected in Vapi.
5. Vapi sends `end-of-call-report` to `POST /api/vapi/webhook`.
6. Manolle updates `call_logs` with transcript, summary, recording URL, status, duration, Vapi payload, and Vapi call id.
7. If the transcript or structured data contains an appointment date/time, Manolle creates an appointment in `appointments`, marks the lead as `booked`, and the dashboard calendar shows it.

## Environment Variables

Paste these in `manolle2/frontend/.env.local` for local development and in your production hosting provider for deployment:

```env
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

VAPI_PRIVATE_KEY=your_vapi_private_api_key
VAPI_ASSISTANT_ID=your_vapi_assistant_id
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
VAPI_WEBHOOK_SECRET=replace_with_long_random_secret
```

## Vapi Setup

The code sends the callback URL per call and includes `VAPI_WEBHOOK_SECRET` as an `x-vapi-secret` header:

```text
{NEXT_PUBLIC_SITE_URL}/api/vapi/webhook
```

You can also set the same server URL on the assistant in Vapi. Vapi documents server events as `POST` requests with a `message` body, and the end-of-call report includes the call object plus artifacts such as transcript and recording.

## Database Migration

Run this migration in Supabase SQL editor:

```text
supabase/migrations/005_direct_vapi_calling.sql
```

It adds:

- `call_logs.vapi_call_id`
- `call_logs.vapi_payload`
- `in_progress` as a valid call status

## Recommended Vapi Structured Output

For best appointment extraction, configure your Vapi assistant analysis or structured output to return fields like:

```json
{
  "summary": "Short call summary",
  "interestLevel": "Interested",
  "interestedIn": "Dental implant consultation",
  "problem": "Customer has tooth pain and wants pricing information",
  "nextStep": "Confirm clinic visit and send address on WhatsApp",
  "appointmentBooked": true,
  "appointmentDate": "2026-05-30",
  "appointmentTime": "14:30",
  "appointmentType": "site_visit"
}
```

The webhook also has a fallback parser for transcript text, but structured fields are much more reliable in production.
