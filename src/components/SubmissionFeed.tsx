import { useState } from 'react';
import type { Submission } from '../types';
import { SUBMISSION_MILESTONE } from '../lib/firebase';

interface SubmissionFeedProps {
  submissions: Submission[];
  currentUid?: string;
  onDelete: (submissionId: string) => Promise<void>;
}

export function SubmissionFeed({ submissions, currentUid, onDelete }: SubmissionFeedProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this beer? This can’t be undone.')) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  }

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
              <li key={s.id} className="flex items-start gap-3 rounded-lg bg-black/20 p-2">
                <img src={s.photoURL} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {s.displayName}{' '}
                    <span className="font-mono text-xs text-amber-100/50">#{s.sequenceNumber}</span>
                    {isMilestone && <span className="ml-1">🎥</span>}
                  </p>
                  <p className="text-xs text-amber-100/40">{new Date(s.createdAt).toLocaleString()}</p>
                  {s.comment && <p className="mt-1 text-sm text-amber-100/80">{s.comment}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {s.videoURL && (
                    <a
                      href={s.videoURL}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-amber-500/20 px-2 py-1 text-xs text-amber-300"
                    >
                      Video
                    </a>
                  )}
                  {s.uid === currentUid && (
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deletingId === s.id ? 'Deleting…' : 'Delete'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
