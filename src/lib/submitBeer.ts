import { doc, increment, runTransaction, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from './cloudinary';
import { db, SUBMISSION_MILESTONE } from './firebase';

export class VideoRequiredError extends Error {
  sequenceNumber: number;
  constructor(sequenceNumber: number) {
    super(`Submission #${sequenceNumber} is a milestone — a video is required.`);
    this.name = 'VideoRequiredError';
    this.sequenceNumber = sequenceNumber;
  }
}

interface SubmitBeerArgs {
  uid: string;
  displayName: string;
  photoFile: File;
  videoFile: File | null;
  comment: string | null;
}

export async function uploadSubmissionMedia(photoFile: File, videoFile: File | null) {
  const photoURL = await uploadToCloudinary(photoFile, 'image');
  const videoURL = videoFile ? await uploadToCloudinary(videoFile, 'video') : null;
  return { photoURL, videoURL };
}

/**
 * Atomically claims the next global sequence number and records the submission.
 * If the claimed number is a milestone (every 100th) and no video was attached,
 * the transaction aborts with VideoRequiredError so the caller can prompt for
 * a video without losing the already-uploaded photo.
 *
 * The counter document tracks two numbers: `total` is a monotonic sequence
 * counter (never decreases, even on delete) that milestone detection is based
 * on, and `liveTotal` is the displayed group total (decremented when a
 * submission is deleted). They start equal; `liveTotal` falls back to `total`
 * if it hasn't been written yet, so this works against a counter doc that
 * predates the split.
 */
export async function submitBeer({ uid, displayName, photoFile, videoFile, comment }: SubmitBeerArgs) {
  const { photoURL, videoURL } = await uploadSubmissionMedia(photoFile, videoFile);

  const counterRef = doc(db, 'meta', 'counter');
  const userRef = doc(db, 'users', uid);
  const submissionRef = doc(db, 'submissions', crypto.randomUUID());

  await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const counterData = counterSnap.data();
    const currentSequence = (counterData?.total as number) ?? 0;
    const currentLive = (counterData?.liveTotal as number) ?? currentSequence;
    const sequenceNumber = currentSequence + 1;
    const isMilestone = sequenceNumber % SUBMISSION_MILESTONE === 0;

    if (isMilestone && !videoURL) {
      throw new VideoRequiredError(sequenceNumber);
    }

    tx.set(counterRef, { total: sequenceNumber, liveTotal: currentLive + 1 }, { merge: true });
    tx.set(userRef, { count: increment(1) }, { merge: true });
    tx.set(submissionRef, {
      uid,
      displayName,
      photoURL,
      videoURL,
      comment: comment || null,
      sequenceNumber,
      createdAt: Date.now(),
      createdAtServer: serverTimestamp(),
    });
  });

  return { photoURL, videoURL };
}

/**
 * Deletes a submission the caller owns. Only decrements the displayed
 * `liveTotal` and the submitter's own count — the sequence counter used for
 * milestone detection is left untouched so deleting an old beer doesn't
 * reshuffle which future submission counts as the next milestone.
 */
export async function deleteSubmission(submissionId: string, uid: string) {
  const counterRef = doc(db, 'meta', 'counter');
  const userRef = doc(db, 'users', uid);
  const submissionRef = doc(db, 'submissions', submissionId);

  await runTransaction(db, async (tx) => {
    const [submissionSnap, counterSnap] = await Promise.all([tx.get(submissionRef), tx.get(counterRef)]);
    if (!submissionSnap.exists()) return;

    const submissionData = submissionSnap.data();
    if (submissionData.uid !== uid) {
      throw new Error('You can only delete your own submissions.');
    }

    const counterData = counterSnap.data();
    const currentSequence = (counterData?.total as number) ?? 0;
    const currentLive = (counterData?.liveTotal as number) ?? currentSequence;

    tx.delete(submissionRef);
    tx.set(userRef, { count: increment(-1) }, { merge: true });
    tx.set(counterRef, { liveTotal: Math.max(0, currentLive - 1) }, { merge: true });
  });
}
