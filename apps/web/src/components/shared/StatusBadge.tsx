import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "done" | "pending" | "error" | "processing" | "active" | "inactive";

const statusConfig: Record<
  StatusType,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2; className?: string }
> = {
  done: { label: "Done", variant: "secondary", icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  active: { label: "Active", variant: "secondary", icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  pending: { label: "Pending", variant: "outline", icon: Clock, className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  processing: { label: "Processing", variant: "outline", icon: Clock, className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 animate-pulse" },
  error: { label: "Error", variant: "destructive", icon: AlertCircle, className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20" },
  inactive: { label: "Inactive", variant: "outline", icon: Clock, className: "text-muted-foreground" },
};

export default function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (status?.toLowerCase() as StatusType) || "pending";
  const config = statusConfig[key] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium", config.className, className)}
    >
      <IconComponent className="size-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
