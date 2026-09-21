"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !mounted) return;
      const token = session.access_token;

      apiGet<OverviewStats>("/api/analytics/overview", token)
        .then(data => {
          if (mounted) setOverview(data);
        })
        .finally(() => {
          if (mounted) setLoadingOverview(false);
        });

      apiGet<{ activity: ActivityEntry[] }>(`/api/analytics/activity?days=${days}`, token)
        .then((r) => {
          if (mounted) setActivity(r.activity);
        })
        .finally(() => {
          if (mounted) setLoadingActivity(false);
        });

      apiGet<{ recent: RecentSession[] }>("/api/analytics/sessions?limit=5", token)
        .then((r) => {
          if (mounted) setRecentSessions(r.recent);
        })
        .finally(() => {
          if (mounted) setLoadingRecent(false);
        });
    };

    load();

    return () => {
      mounted = false;
    };
  }, [days]);

  return { overview, activity, recentSessions, loadingOverview, loadingActivity, loadingRecent, days, setDays };
}
