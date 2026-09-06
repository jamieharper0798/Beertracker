import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { profile, logOut } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-4">
      <h1 className="font-[var(--font-display)] text-xl font-bold text-amber-400">🍺 Beer Tracker</h1>
      <div className="flex items-center gap-3 text-sm">
        {profile && (
          <span className="text-amber-100/70">
            {profile.displayName} · <span className="font-mono text-amber-300">{profile.count}</span>
          </span>
        )}
        <button
          onClick={() => logOut()}
          className="rounded-md border border-amber-900/40 px-2 py-1 text-xs text-amber-100/60 hover:text-amber-100"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
