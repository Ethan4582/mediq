"use client";

import { format, parseISO } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ActivityEntry } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold">Activity Progression</CardTitle>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          {DAY_OPTIONS.map((d) => (
            <Button
              key={d}
              variant={days === d ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onDaysChange(d)}
              className="h-6 px-2.5 text-xs"
            >
              {d}d
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : formatted.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-xs">
            No activity recorded in this time range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="docsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="monotone" dataKey="runs" name="Agent Runs" stroke="#2563eb" fillOpacity={1} fill="url(#runsGrad)" />
              <Area type="monotone" dataKey="documents" name="Docs Processed" stroke="#10b981" fillOpacity={1} fill="url(#docsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
