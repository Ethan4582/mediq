import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppSession } from "@/types/app";

export function useSession(sessionId: string) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const supabase = createClient();

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

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (!error && data) {
        setSession(data as AppSession);
      }
      setLoading(false);
    };

    fetchSession();
  }, [sessionId]);

  return { session: currentSession, loading: currentLoading };
}
