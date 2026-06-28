import type { SessionStatus } from "@/types/app";

const config: Record<
  SessionStatus,
  { dot: string; text: string; bg: string; color: string; label: string }
> = {
  done: {
    dot: "bg-green-500",
    text: "",
    bg: "var(--status-active-bg)",
    color: "var(--status-active-text)",
    label: "Active",
  },
  processing: {
    dot: "bg-amber-400",
    text: "",
    bg: "var(--status-pending-bg)",
    color: "var(--status-pending-text)",
    label: "Processing",
  },
  pending: {
    dot: "bg-gray-400",
    text: "",
    bg: "#f3f4f6",
    color: "#6b7280",
    label: "Pending",
  },
  error: {
    dot: "bg-red-500",
    text: "",
    bg: "var(--status-error-bg)",
    color: "var(--status-error-text)",
    label: "Error",
  },
};

export default function StatusBadge({ status }: { status: SessionStatus }) {
  const c = config[status] ?? config.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: c.bg, color: c.color }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
