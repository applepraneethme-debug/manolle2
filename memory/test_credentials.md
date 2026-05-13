# Manolle AI — Test Credentials

## Demo Mode
The app runs in demo mode when Supabase credentials are not configured.
In demo mode, all routes are accessible without authentication.

## Auth Configuration
To enable real authentication:
1. Create a Supabase project at https://supabase.com
2. Add credentials to /app/frontend/.env:
   - NEXT_PUBLIC_SUPABASE_URL=your-project-url
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
3. Run the SQL schema from /app/supabase/schema.sql in Supabase SQL Editor
4. Restart the frontend: sudo supervisorctl restart frontend

## Test Users (once Supabase is configured)
Create test users via the signup page at /auth/signup
- Email: testuser@manolleai.com
- Password: TestPass123!

## Dashboard Access
- In demo mode: Visit https://ba97c98c-acb3-4891-ab97-d6f7ba44dd57.preview.emergentagent.com/dashboard directly
- In production mode: Must login via /auth/login
