import type { UserProfile } from '../types';

const MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard({ leaders, currentUid }: { leaders: UserProfile[]; currentUid?: string }) {
  return (
    <div className="rounded-2xl border border-amber-900/40 bg-[#1c1712] p-5 shadow-lg">
      <h2 className="mb-3 font-[var(--font-display)] text-lg font-bold text-amber-400">Leaderboard</h2>
      {leaders.length === 0 ? (
        <p className="text-sm text-amber-100/50">No submissions yet — be the first!</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {leaders.map((leader, i) => (
            <li
              key={leader.uid}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                leader.uid === currentUid ? 'bg-amber-500/15 ring-1 ring-amber-500/40' : 'bg-black/20'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-6 text-center">{MEDALS[i] ?? i + 1}</span>
                <span className="font-medium">{leader.displayName}</span>
              </span>
              <span className="font-mono font-semibold text-amber-300">{leader.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
