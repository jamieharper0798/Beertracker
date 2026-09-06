import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useGroupTotal() {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'meta', 'counter'), (snap) => {
      setTotal(snap.exists() ? (snap.data().total as number) : 0);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { total, loading };
}
