import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// getAuth() throws synchronously on an invalid/missing API key, so only initialize the SDK
// when a real config is present. App.tsx never mounts anything that touches these exports
// unless firebaseConfigured is true, so the `as` casts below are safe.
let auth: Auth = undefined as unknown as Auth;
let db: Firestore = undefined as unknown as Firestore;

if (firebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };

export const SUBMISSION_MILESTONE = 100;
