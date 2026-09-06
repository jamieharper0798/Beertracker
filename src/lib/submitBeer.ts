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
 * Atomically claims the next sequence number and records the submission. If
 * the claimed number is a milestone (every 100th) and no video was attached,
 * the transaction aborts with VideoRequiredError so the caller can prompt for
 * a video without losing the already-uploaded photo.
 *
 * The counter's `total` field is both the displayed group total and the
 * source of the next sequence number, so it stays in sync with the milestone
 * countdown. Deleting a submission decrements it too (see deleteSubmission).
 */
export async function submitBeer({ uid, displayName, photoFile, videoFile, comment }: SubmitBeerArgs) {
  const { photoURL, videoURL } = await uploadSubmissionMedia(photoFile, videoFile);

  const counterRef = doc(db, 'meta', 'counter');
  const userRef = doc(db, 'users', uid);
  const submissionRef = doc(db, 'submissions', crypto.randomUUID());

  await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const currentTotal = (counterSnap.data()?.total as number) ?? 0;
    const sequenceNumber = currentTotal + 1;
    const isMilestone = sequenceNumber % SUBMISSION_MILESTONE === 0;

    if (isMilestone && !videoURL) {
      throw new VideoRequiredError(sequenceNumber);
    }

    tx.set(counterRef, { total: sequenceNumber }, { merge: true });
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
 * Deletes a submission the caller owns, and decrements the shared counter so
 * the group total and milestone countdown both move back down by one. Note:
 * if an older submission is deleted while newer ones still exist, the next
 * new submission could be assigned a sequence number that an existing,
 * still-visible submission already has — an acceptable tradeoff for keeping
 * the total and the countdown in sync for a small, casual group.
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

    const currentTotal = (counterSnap.data()?.total as number) ?? 0;

    tx.delete(submissionRef);
    tx.set(userRef, { count: increment(-1) }, { merge: true });
    tx.set(counterRef, { total: Math.max(0, currentTotal - 1) }, { merge: true });
  });
}
