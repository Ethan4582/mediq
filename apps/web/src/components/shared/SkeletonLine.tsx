export default function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded h-4 w-full ${className ?? ""}`}
      style={{ background: "var(--bg-hover)" }}
    />
  );
}
