import { useEffect, useState } from 'react';
import { getSessionAction } from '@/actions/sessions';
import type { AppSession } from '@/types/app';

export function useSession(sessionId: string) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);

  let currentSession = session;
  let currentLoading = loading;

  if (sessionId !== currentSessionId) {
    setCurrentSessionId(sessionId);
    setSession(null);
    setLoading(true);
    currentSession = null;
    currentLoading = true;
  }

  useEffect(() => {
    if (!sessionId) return;

    let ignore = false;

    const fetchSession = async () => {
      try {
        const data = await getSessionAction(sessionId);

        if (!ignore) {
          setSession(data);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchSession();

    return () => {
      ignore = true;
    };
  }, [sessionId]);

  return { session: currentSession, loading: currentLoading };
}
