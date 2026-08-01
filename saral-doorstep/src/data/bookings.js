// Static reference data — not stored in the database.
// Bookings live in Supabase (see supabase/seed.sql for schema + seed data,
// and supabase/auth-setup.sql for the profiles table + RLS policies).
// Which agent is "logged in" is no longer hardcoded here — it comes from
// the authenticated user's profile (see src/App.jsx).

export const AGENTS = ['Rohit Kumar', 'Priya Sharma', 'Amit Yadav'];

export const STATUS_LABEL = {
  scheduled: 'Scheduled',
  in_progress: 'On visit',
  completed: 'Completed',
  verified: 'Verified',
  submitted: 'Submitted',
};

export const WEEKLY_TREND = [
  { day: 'Mon', visits: 5 },
  { day: 'Tue', visits: 7 },
  { day: 'Wed', visits: 6 },
  { day: 'Thu', visits: 9 },
  { day: 'Fri', visits: 8 },
  { day: 'Sat', visits: 4 },
  { day: 'Today', visits: 9 },
];