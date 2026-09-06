import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SUBMISSION_MILESTONE } from '../lib/firebase';
import { submitBeer, VideoRequiredError } from '../lib/submitBeer';

const COMMENT_MAX_LENGTH = 280;

interface SubmissionFormProps {
  groupTotal: number;
  onSuccess?: () => void;
}

export function SubmissionForm({ groupTotal, onSuccess }: SubmissionFormProps) {
  const { user, profile } = useAuth();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [videoRequired, setVideoRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const nextNumber = groupTotal + 1;
  const willBeMilestone = nextNumber % SUBMISSION_MILESTONE === 0;

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleVideoChange(e: ChangeEvent<HTMLInputElement>) {
    setVideoFile(e.target.files?.[0] ?? null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !profile || !photoFile) return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const { photoURL } = await submitBeer({
        uid: user.uid,
        displayName: profile.displayName,
        photoFile,
        videoFile,
        comment: comment.trim() || null,
      });
      setSuccess(`Beer logged! 🍻 (${photoURL ? 'photo saved' : ''})`);
      setPhotoFile(null);
      setPhotoPreview(null);
      setVideoFile(null);
      setComment('');
      setVideoRequired(false);
      onSuccess?.();
    } catch (err) {
      if (err instanceof VideoRequiredError) {
        setVideoRequired(true);
        setError(`This will be beer #${err.sequenceNumber} — a milestone! Attach a video to submit.`);
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    } finally {
      setBusy(false);
    }
  }

  const needsVideo = videoRequired || willBeMilestone;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      {willBeMilestone && !success && (
        <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-300 ring-1 ring-amber-500/30">
          This will be beer #{nextNumber} — every {SUBMISSION_MILESTONE}th beer needs a video!
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm text-amber-100/70">
        Photo (required)
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          required
          className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-black file:font-semibold"
        />
      </label>

      {photoPreview && (
        <img src={photoPreview} alt="Preview" className="max-h-48 w-full rounded-lg object-cover" />
      )}

      <label className="flex flex-col gap-1 text-sm text-amber-100/70">
        Video {needsVideo ? '(required for this milestone beer)' : '(optional)'}
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          required={needsVideo}
          className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-amber-500/80 file:px-3 file:py-1.5 file:text-black file:font-semibold"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-amber-100/70">
        Comment (optional)
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
          maxLength={COMMENT_MAX_LENGTH}
          rows={2}
          placeholder="Say something about this beer…"
          className="resize-none rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2 text-sm text-amber-50 outline-none placeholder:text-amber-100/30 focus:border-amber-500"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-400">{success}</p>}

      <button
        type="submit"
        disabled={busy || !photoFile}
        className="rounded-lg bg-amber-500 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
      >
        {busy ? 'Uploading…' : 'Submit beer'}
      </button>
    </form>
  );
}
