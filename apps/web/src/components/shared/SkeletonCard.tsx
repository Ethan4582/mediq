import SkeletonLine from "./SkeletonLine";

export default function SkeletonCard() {
  return (
    <div
      className="rounded-xl border p-5 space-y-3"
      style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
    >
      <SkeletonLine />
      <SkeletonLine className="w-3/4" />
      <SkeletonLine className="w-2/3" />
      <SkeletonLine className="w-1/2" />
      <SkeletonLine className="w-1/3" />
    </div>
  );
}
