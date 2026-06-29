"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { OverviewStats, ActivityEntry, RecentSession } from "@/types/app";
import { API_URL } from "@/lib/constants";

async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export function useAnalytics() {
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const fetchAll = useCallback(async (d: number) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const token = session.access_token;

    setLoadingOverview(true);
    apiGet<OverviewStats>("/api/analytics/overview", token)
      .then(setOverview)
      .finally(() => setLoadingOverview(false));

    setLoadingActivity(true);
    apiGet<{ activity: ActivityEntry[] }>(`/api/analytics/activity?days=${d}`, token)
      .then((r) => setActivity(r.activity))
      .finally(() => setLoadingActivity(false));

    setLoadingRecent(true);
    apiGet<{ recent: RecentSession[] }>("/api/analytics/sessions?limit=5", token)
      .then((r) => setRecentSessions(r.recent))
      .finally(() => setLoadingRecent(false));
  }, []);

  useEffect(() => { fetchAll(days); }, [days, fetchAll]);

  return { overview, activity, recentSessions, loadingOverview, loadingActivity, loadingRecent, days, setDays };
}
