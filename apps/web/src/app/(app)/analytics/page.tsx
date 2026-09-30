"use client";

import SettingsShell from "@/components/layout/SettingsShell";
import { useAnalytics } from "@/hooks/useAnalytics";
import StatCards from "@/components/analytics/StatCards";
import ActivityChart from "@/components/analytics/ActivityChart";
import RecentSessionsTable from "@/components/analytics/RecentSessionsTable";

export default function AnalyticsPage() {
  const { overview, activity, recentSessions, loadingOverview, loadingActivity, loadingRecent, days, setDays } = useAnalytics();

  return (
    <SettingsShell
      title="Analytics"
      description="Usage overview, clinical throughput, and recent consultation records."
    >
      <StatCards data={overview} loading={loadingOverview} />
      <ActivityChart data={activity} loading={loadingActivity} days={days} onDaysChange={setDays} />
      <RecentSessionsTable data={recentSessions} loading={loadingRecent} />
    </SettingsShell>
  );
}
