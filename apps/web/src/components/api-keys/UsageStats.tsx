import SkeletonLine from "@/components/shared/SkeletonLine";

const stats = [
  { label: "Runs today", value: "0", limit: "/ 1 limit" },
  { label: "Pages processed", value: "0", limit: "/ 300 today" },
  { label: "Active tier", value: "Free", limit: "" },
];

export default function UsageStats({ loading }: { loading?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border p-5"
          style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
        >
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            {s.label}
          </p>
          {loading ? (
            <SkeletonLine className="w-1/2 h-7" />
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {s.value}
              </span>
              {s.limit && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {s.limit}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
