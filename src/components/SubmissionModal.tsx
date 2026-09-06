import { useEffect } from 'react';
import type { Submission } from '../types';
import { SUBMISSION_MILESTONE } from '../lib/firebase';

export function SubmissionModal({ submission, onClose }: { submission: Submission; onClose: () => void }) {
  const isMilestone = submission.sequenceNumber % SUBMISSION_MILESTONE === 0;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-amber-900/40 bg-[#1c1712] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-amber-900/40 px-4 py-3">
          <p className="text-sm font-medium">
            {submission.displayName}{' '}
            <span className="font-mono text-xs text-amber-100/50">#{submission.sequenceNumber}</span>
            {isMilestone && <span className="ml-1">🎥</span>}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-lg leading-none text-amber-100/60 hover:bg-white/10 hover:text-amber-100"
          >
            ×
          </button>
        </div>

        <img src={submission.photoURL} alt="" className="max-h-[60vh] w-full object-contain bg-black" />

        {submission.videoURL && (
          <video src={submission.videoURL} controls playsInline className="w-full bg-black" />
        )}

        <div className="flex flex-col gap-1 p-4">
          <p className="text-xs text-amber-100/40">{new Date(submission.createdAt).toLocaleString()}</p>
          {submission.comment && <p className="text-sm text-amber-100/90">{submission.comment}</p>}
        </div>
      </div>
    </div>
  );
}
