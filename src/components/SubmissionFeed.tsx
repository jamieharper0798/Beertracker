import type { Submission } from '../types';
import { SUBMISSION_MILESTONE } from '../lib/firebase';

export function SubmissionFeed({ submissions }: { submissions: Submission[] }) {
  return (
    <div className="rounded-2xl border border-amber-900/40 bg-[#1c1712] p-5 shadow-lg">
      <h2 className="mb-3 font-[var(--font-display)] text-lg font-bold text-amber-400">Recent activity</h2>
      {submissions.length === 0 ? (
        <p className="text-sm text-amber-100/50">Nothing logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {submissions.map((s) => {
            const isMilestone = s.sequenceNumber % SUBMISSION_MILESTONE === 0;
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-lg bg-black/20 p-2">
                <img src={s.photoURL} alt="" className="h-14 w-14 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {s.displayName}{' '}
                    <span className="font-mono text-xs text-amber-100/50">#{s.sequenceNumber}</span>
                    {isMilestone && <span className="ml-1">🎥</span>}
                  </p>
                  <p className="text-xs text-amber-100/40">{new Date(s.createdAt).toLocaleString()}</p>
                </div>
                {s.videoURL && (
                  <a
                    href={s.videoURL}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-md bg-amber-500/20 px-2 py-1 text-xs text-amber-300"
                  >
                    Video
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
