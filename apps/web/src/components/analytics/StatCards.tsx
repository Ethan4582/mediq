"use client";

import { FolderOpen, FileText, ClipboardList, Activity } from "lucide-react";
import type { OverviewStats } from "@/types/app";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const cards = [
  {
    key: "total_sessions",
    label: "Total Sessions",
    icon: FolderOpen,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    sub: (_: OverviewStats) => "All time",
  },
  {
    key: "total_documents",
    label: "Documents Processed",
    icon: FileText,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    sub: (s: OverviewStats) => `${s.total_pages} pages`,
  },
  {
    key: "total_drafts",
    label: "Summaries Generated",
    icon: ClipboardList,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    sub: (_: OverviewStats) => "Discharge drafts",
  },
  {
    key: "runs_this_week",
    label: "Runs This Week",
    icon: Activity,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    sub: (s: OverviewStats) => `${s.runs_today} today`,
  },
] as const;

export default function StatCards({
  data,
  loading,
}: {
  data: OverviewStats | null;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color, bg, sub }) => (
        <Card key={key} className="p-5 shadow-sm">
          <CardContent className="flex items-center gap-4 p-0">
            <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              {loading ? (
                <Skeleton className="h-6 w-14 my-0.5" />
              ) : (
                <p className="text-xl font-bold tracking-tight text-foreground">
                  {data ? data[key] : 0}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                {loading ? "" : data ? sub(data) : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
