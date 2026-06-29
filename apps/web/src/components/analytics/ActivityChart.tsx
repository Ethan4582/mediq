"use client";

import { format, parseISO } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ActivityEntry } from "@/types/app";
import SkeletonLine from "@/components/shared/SkeletonLine";

const DAY_OPTIONS = [7, 30, 90];

export default function ActivityChart({
  data,
  loading,
  days,
  onDaysChange,
}: {
  data: ActivityEntry[];
  loading: boolean;
  days: number;
  onDaysChange: (d: number) => void;
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="rounded-2xl border p-6 bg-white shadow-sm" style={{ borderColor: "var(--card-border)" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Activity</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange(d)}
              className="px-3 py-1 text-xs font-semibold rounded-md transition-all"
              style={{
                background: days === d ? "white" : "transparent",
                color: days === d ? "var(--brand-primary)" : "var(--text-muted)",
                boxShadow: days === d ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonLine className="h-64 w-full rounded-xl" />
      ) : formatted.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No activity data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pagesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
              formatter={(val: number, name: string) => [val, name === "runs" ? "Runs" : "Pages"]}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Area type="monotone" dataKey="runs" stroke="#3b82f6" strokeWidth={2} fill="url(#runsGrad)" name="Runs" />
            <Area type="monotone" dataKey="pages" stroke="#14b8a6" strokeWidth={2} fill="url(#pagesGrad)" name="Pages" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
