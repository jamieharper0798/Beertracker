import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useGroupTotal() {
  const [liveTotal, setLiveTotal] = useState(0);
  const [sequenceTotal, setSequenceTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'meta', 'counter'), (snap) => {
      const data = snap.data();
      const sequence = (data?.total as number) ?? 0;
      setSequenceTotal(sequence);
      setLiveTotal((data?.liveTotal as number) ?? sequence);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { liveTotal, sequenceTotal, loading };
}
