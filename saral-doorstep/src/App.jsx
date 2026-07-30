import { useState, useEffect } from 'react';
import { Smartphone, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import FieldAgentView from './components/FieldAgentView';
import AdminView from './components/AdminView';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('saral-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [view, setView] = useState('agent');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('saral-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    async function loadBookings() {
      const { data, error } = await supabase.from('bookings').select('*').order('slot');
      if (error) {
        console.error('Failed to load bookings', error);
        setLoadError(error.message);
      } else {
        setBookings(data);
      }
      setLoading(false);
    }
    loadBookings();
  }, []);

  // Optimistic update: change local state immediately, then persist to
  // Supabase in the background. If the write fails, we log it — good
  // enough for now, a later pass can add a toast/rollback.
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

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="wordmark">SARAL <span>@ Home</span></p>
          <p className="wordmark-sub">Doorstep document services · Gurugram pilot</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="toggle-group">
            <button className={`toggle-btn ${view === 'agent' ? 'active' : ''}`} onClick={() => setView('agent')}>
              <Smartphone size={14} /> <span className="hidden sm:inline">Field agent</span>
            </button>
            <button className={`toggle-btn ${view === 'admin' ? 'active' : ''}`} onClick={() => setView('admin')}>
              <LayoutDashboard size={14} /> <span className="hidden sm:inline">Admin dashboard</span>
            </button>
          </div>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle dark mode">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main>
        {loading && <p className="agent-eyebrow">Loading bookings…</p>}

        {!loading && loadError && (
          <div className="panel">
            <p className="section-label">Couldn't load bookings</p>
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
              {loadError} — check that <code>.env.local</code> has your Supabase URL and anon key,
              and that <code>supabase/seed.sql</code> has been run in your project.
            </p>
          </div>
        )}

        {!loading && !loadError && (
          view === 'agent' ? (
            <FieldAgentView
              bookings={bookings}
              onStartVisit={startVisit}
              onToggleChecklist={toggleChecklist}
              onSaveSignature={saveSignature}
              onCompleteVisit={completeVisit}
            />
          ) : (
            <AdminView
              bookings={bookings}
              onAssignAgent={assignAgent}
              onVerify={verifyVisit}
              onSubmit={submitVisit}
            />
          )
        )}
      </main>
    </div>
  );
}