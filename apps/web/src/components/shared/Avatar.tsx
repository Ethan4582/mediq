export default function Avatar({
  name,
  src,
  size = "md",
}: {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-10 h-10 text-sm",
  };

  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "avatar"}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ background: "var(--brand-primary)" }}
    >
      {initials}
    </div>
  );
}
