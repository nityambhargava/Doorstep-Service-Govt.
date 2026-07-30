// Static reference data — not stored in the database for now.
// Bookings themselves now live in Supabase (see supabase/seed.sql
// for the table schema and the same seed rows that used to live here).

export const AGENTS = ['Rohit Kumar', 'Priya Sharma', 'Amit Yadav'];
export const CURRENT_AGENT = 'Rohit Kumar';

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