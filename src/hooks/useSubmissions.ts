import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Submission } from '../types';

export function useSubmissions(max = 25) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'submissions'), orderBy('sequenceNumber', 'desc'), limit(max));
    const unsubscribe = onSnapshot(q, (snap) => {
      setSubmissions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Submission));
      setLoading(false);
    });
    return unsubscribe;
  }, [max]);

  return { submissions, loading };
}
