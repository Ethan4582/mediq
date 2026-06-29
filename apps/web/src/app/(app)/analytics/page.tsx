
"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import StatCards from "@/components/analytics/StatCards";
import ActivityChart from "@/components/analytics/ActivityChart";
import RecentSessionsTable from "@/components/analytics/RecentSessionsTable";

export default function AnalyticsPage() {
  const { overview, activity, recentSessions, loadingOverview, loadingActivity, loadingRecent, days, setDays } = useAnalytics();

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-[1100px] mx-auto w-full py-10 px-6 space-y-6 flex-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Your usage overview and session history
          </p>
        </div>

        <StatCards data={overview} loading={loadingOverview} />
        <ActivityChart data={activity} loading={loadingActivity} days={days} onDaysChange={setDays} />
        <RecentSessionsTable data={recentSessions} loading={loadingRecent} />
      </div>
    </div>
  );
}
