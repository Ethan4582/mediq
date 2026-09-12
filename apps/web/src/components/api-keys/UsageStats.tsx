import { BarChart2, FileText, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const stats = [
  {
    label: "Runs today",
    value: "0",
    limit: "/ 1 limit",
    icon: BarChart2,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    label: "Pages processed",
    value: "0",
    limit: "/ 300 today",
    icon: FileText,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Active tier",
    value: "Free Tier",
    limit: "",
    icon: Crown,
    iconColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
  },
];

export default function UsageStats({ loading }: { loading?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="p-5 shadow-sm">
            <CardContent className="flex items-center gap-4 p-0">
              <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${s.bgColor} ${s.iconColor}`}>
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                {loading ? (
                  <Skeleton className="h-6 w-16 my-0.5" />
                ) : (
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-bold tracking-tight text-foreground">{s.value}</span>
                    {s.limit && <span className="text-xs text-muted-foreground">{s.limit}</span>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
