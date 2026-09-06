import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function AuthScreen() {
  const { signUp, logIn } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') {
        if (!displayName.trim()) throw new Error('Enter a display name.');
        await signUp(email, password, displayName.trim());
      } else {
        await logIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-amber-900/40 bg-[#1c1712] p-6 shadow-xl">
        <h1 className="mb-1 text-center font-[var(--font-display)] text-2xl font-bold text-amber-400">
          🍺 Beer Tracker
        </h1>
        <p className="mb-6 text-center text-sm text-amber-100/60">
          {mode === 'login' ? 'Log in to log a beer.' : 'Create an account to join the group.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <input
              className="rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          )}
          <input
            className="rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <button
          className="mt-4 w-full text-center text-xs text-amber-100/60 hover:text-amber-100"
          onClick={() => {
            setError(null);
            setMode(mode === 'login' ? 'signup' : 'login');
          }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
