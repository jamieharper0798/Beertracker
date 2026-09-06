import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from '../types';

export function useLeaderboard() {
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('count', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setLeaders(snap.docs.map((d) => d.data() as UserProfile));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { leaders, loading };
}
