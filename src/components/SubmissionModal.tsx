import { useEffect, useState } from 'react';
import type { Submission } from '../types';
import { SUBMISSION_MILESTONE } from '../lib/firebase';

const COMMENT_MAX_LENGTH = 280;

interface SubmissionModalProps {
  submission: Submission;
  currentUid?: string;
  onClose: () => void;
  onSaveComment: (submissionId: string, comment: string | null) => Promise<void>;
}

export function SubmissionModal({ submission, currentUid, onClose, onSaveComment }: SubmissionModalProps) {
  const isMilestone = submission.sequenceNumber % SUBMISSION_MILESTONE === 0;
  const isOwner = submission.uid === currentUid;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(submission.comment ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function startEditing() {
    setDraft(submission.comment ?? '');
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(submission.comment ?? '');
    setError(null);
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSaveComment(submission.id, draft.trim() || null);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

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

        <div className="flex flex-col gap-2 p-4">
          <p className="text-xs text-amber-100/40">{new Date(submission.createdAt).toLocaleString()}</p>

          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
                maxLength={COMMENT_MAX_LENGTH}
                rows={2}
                placeholder="Say something about this beer…"
                className="resize-none rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2 text-sm text-amber-50 outline-none placeholder:text-amber-100/30 focus:border-amber-500"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-amber-100/70 hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              {submission.comment ? (
                <p className="text-sm text-amber-100/90">{submission.comment}</p>
              ) : (
                <p className="text-sm italic text-amber-100/40">{isOwner ? 'No comment yet' : ''}</p>
              )}
              {isOwner && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="shrink-0 text-xs text-amber-300 hover:underline"
                >
                  {submission.comment ? 'Edit' : 'Add comment'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
