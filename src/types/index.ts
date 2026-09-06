export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  count: number;
  createdAt: number;
}

export interface Submission {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  videoURL: string | null;
  comment: string | null;
  sequenceNumber: number;
  createdAt: number;
}
