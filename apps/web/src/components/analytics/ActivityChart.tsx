"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { ActivityEntry } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const DAY_OPTIONS = [7, 30, 90];

const chartConfig = {
  runs: {
    label: "Agent Runs",
    color: "#2563eb",
  },
  documents: {
    label: "Docs Processed",
    color: "#10b981",
  },
} satisfies ChartConfig;

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
  const formatted = useMemo(() => {
    return data.map((d) => ({
      ...d,
      label: format(parseISO(d.date), "MMM d"),
    }));
  }, [data]);

  const totalRuns = useMemo(() => data.reduce((acc, d) => acc + (d.runs || 0), 0), [data]);
  const totalDocs = useMemo(() => data.reduce((acc, d) => acc + (d.documents || 0), 0), [data]);

  return (
    <Card className="border border-border/80 bg-card shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            Activity Progression
            <span className="text-[11px] font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted/70">
              {totalRuns} runs • {totalDocs} docs
            </span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Clinical assistant workload and processing trends
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40 self-start sm:self-auto">
          {DAY_OPTIONS.map((d) => (
            <Button
              key={d}
              variant={days === d ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onDaysChange(d)}
              className={`h-7 px-3 text-xs rounded-lg font-medium transition-all ${
                days === d
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}d
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-4 px-2 sm:px-6">
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : formatted.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs gap-1">
            <span>No activity recorded in the past {days} days</span>
            <span className="text-[11px] text-muted-foreground/70">Upload documents or chat with MediQ to see stats</span>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <AreaChart data={formatted} margin={{ top: 12, right: 12, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="fillRuns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-runs)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-runs)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillDocs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-documents)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-documents)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="runs"
                stroke="var(--color-runs)"
                strokeWidth={2.2}
                fill="url(#fillRuns)"
                dot={formatted.length <= 1}
              />
              <Area
                type="monotone"
                dataKey="documents"
                stroke="var(--color-documents)"
                strokeWidth={2.2}
                fill="url(#fillDocs)"
                dot={formatted.length <= 1}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
