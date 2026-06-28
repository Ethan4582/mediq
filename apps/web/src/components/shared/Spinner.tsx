export default function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${className ?? ""}`}
      style={{ borderColor: "var(--brand-primary)", borderTopColor: "transparent" }}
    />
  );
}
