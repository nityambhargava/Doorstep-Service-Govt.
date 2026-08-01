import { useState, useEffect } from 'react';
import { LogOut, Sun, Moon } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import Login from './components/Login';
import FieldAgentView from './components/FieldAgentView';
import AdminView from './components/AdminView';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('saral-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Theme — independent of auth, so it applies on the login screen too.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('saral-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Profile (full name + role) for whoever just logged in
  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load profile', error);
          setProfileError(
            'No profile found for this login. Make sure a matching row exists in the ' +
            'profiles table (see supabase/auth-setup.sql).'
          );
        } else {
          setProfile(data);
          setProfileError(null);
        }
      });
  }, [session]);

  // Bookings — fetched once we know who's logged in (RLS scopes the result)
  useEffect(() => {
    if (!profile) return;
    async function loadBookings() {
      setBookingsLoading(true);
      const { data, error } = await supabase.from('bookings').select('*').order('slot');
      if (error) {
        console.error('Failed to load bookings', error);
        setLoadError(error.message);
      } else {
        setBookings(data);
        setLoadError(null);
      }
      setBookingsLoading(false);
    }
    loadBookings();
  }, [profile]);

  const updateBooking = async (id, changes) => {
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, ...changes } : b)));
    const { error } = await supabase.from('bookings').update(changes).eq('id', id);
    if (error) console.error(`Failed to save change for ${id}`, error);
  };

  const startVisit = (id) => updateBooking(id, { status: 'in_progress' });

  const toggleChecklist = (id, key) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    updateBooking(id, { checklist: { ...booking.checklist, [key]: !booking.checklist[key] } });
  };

  const saveSignature = (id, data) => updateBooking(id, { signature: data });
  const completeVisit = (id) => updateBooking(id, { status: 'completed' });
  const verifyVisit = (id) => updateBooking(id, { status: 'verified' });
  const submitVisit = (id) => updateBooking(id, { status: 'submitted' });
  const assignAgent = (id, agent) => updateBooking(id, { agent });

  const handleLogout = () => {
    supabase.auth.signOut();
    setBookings([]);
  };

  if (authLoading) {
    return (
      <div className="app-shell">
        <p className="agent-eyebrow">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Login theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (profileError) {
    return (
      <div className="app-shell">
        <div className="panel" style={{ maxWidth: 420 }}>
          <p className="section-label">Account not set up</p>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{profileError}</p>
          <button onClick={handleLogout} className="btn-ghost mt-3">Sign out</button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app-shell">
        <p className="agent-eyebrow">Setting up your account…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="wordmark">SARAL <span>@ Home</span></p>
          <p className="wordmark-sub">
            {profile.role === 'admin' ? 'Admin dashboard' : `Field agent · ${profile.full_name}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle dark mode">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={handleLogout} className="btn-ghost flex items-center gap-1">
            <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main>
        {bookingsLoading && <p className="agent-eyebrow">Loading bookings…</p>}

        {!bookingsLoading && loadError && (
          <div className="panel">
            <p className="section-label">Couldn't load bookings</p>
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{loadError}</p>
          </div>
        )}

        {!bookingsLoading && !loadError && (
          profile.role === 'admin' ? (
            <AdminView
              bookings={bookings}
              onAssignAgent={assignAgent}
              onVerify={verifyVisit}
              onSubmit={submitVisit}
            />
          ) : (
            <FieldAgentView
              agentName={profile.full_name}
              bookings={bookings}
              onStartVisit={startVisit}
              onToggleChecklist={toggleChecklist}
              onSaveSignature={saveSignature}
              onCompleteVisit={completeVisit}
            />
          )
        )}
      </main>
    </div>
  );
}