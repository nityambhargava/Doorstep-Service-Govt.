import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Login({ theme, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <button onClick={onToggleTheme} className="theme-toggle login-theme-toggle" aria-label="Toggle dark mode">
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="login-card">
        <p className="wordmark">SARAL <span>@ Home</span></p>
        <p className="wordmark-sub" style={{ marginBottom: 20 }}>Sign in to continue</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-input"
            autoComplete="username"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-input"
            autoComplete="current-password"
            required
          />
          {error && <p className="text-sm" style={{ color: '#C0563F' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}