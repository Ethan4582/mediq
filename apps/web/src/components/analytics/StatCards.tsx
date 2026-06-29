"use client";

import { FolderOpen, FileText, ClipboardList, Activity } from "lucide-react";
import { OverviewStats } from "@/types/app";
import SkeletonLine from "@/components/shared/SkeletonLine";

const cards = [
  { key: "total_sessions", label: "Total Sessions", icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50", sub: (s: OverviewStats) => "All time" },
  { key: "total_documents", label: "Documents Processed", icon: FileText, color: "text-green-600", bg: "bg-green-50", sub: (s: OverviewStats) => `${s.total_pages} pages` },
  { key: "total_drafts", label: "Summaries Generated", icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50", sub: (_: OverviewStats) => "Discharge drafts" },
  { key: "runs_this_week", label: "Runs This Week", icon: Activity, color: "text-orange-600", bg: "bg-orange-50", sub: (s: OverviewStats) => `${s.runs_today} today` },
] as const;

export default function StatCards({
  data,
  loading,
}: {
  data: OverviewStats | null;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-5">
      {cards.map(({ key, label, icon: Icon, color, bg, sub }) => (
        <div
          key={key}
          className="rounded-2xl border p-5 flex items-start gap-4 shadow-sm bg-white"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
            <Icon size={22} className={color} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            {loading ? (
              <SkeletonLine className="w-14 h-7" />
            ) : (
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {data ? data[key] : 0}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? "" : data ? sub(data) : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
