import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppSession } from "@/types/app";

export function useSession(sessionId: string) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      setLoading(true);
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

  return { session, loading };
}
