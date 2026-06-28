type FlagChipType = "confidence" | "warning" | "missing";

const styles: Record<FlagChipType, { bg: string; color: string; dot: string }> = {
  confidence: {
    bg: "var(--status-active-bg)",
    color: "var(--confidence-high)",
    dot: "bg-green-500",
  },
  warning: {
    bg: "var(--flag-amber-bg)",
    color: "var(--flag-amber)",
    dot: "bg-amber-400",
  },
  missing: {
    bg: "#f3f4f6",
    color: "#6b7280",
    dot: "bg-gray-400",
  },
};

export default function FlagChip({
  type,
  label,
}: {
  type: FlagChipType;
  label: string;
}) {
  const s = styles[type];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}
