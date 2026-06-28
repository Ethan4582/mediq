import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppSession } from "@/types/app";

export function useSessions() {
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("id, title, patient_name, status, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSessions(data as AppSession[]);
      }
      setLoading(false);
    };

    fetchSessions();
  }, []);

  return { sessions, loading };
}
