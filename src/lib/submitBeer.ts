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
 */
export async function submitBeer({ uid, displayName, photoFile, videoFile }: SubmitBeerArgs) {
  const { photoURL, videoURL } = await uploadSubmissionMedia(photoFile, videoFile);

  const counterRef = doc(db, 'meta', 'counter');
  const userRef = doc(db, 'users', uid);
  const submissionRef = doc(db, 'submissions', crypto.randomUUID());

  await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const currentTotal = counterSnap.exists() ? (counterSnap.data().total as number) : 0;
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
      sequenceNumber,
      createdAt: Date.now(),
      createdAtServer: serverTimestamp(),
    });
  });

  return { photoURL, videoURL };
}
