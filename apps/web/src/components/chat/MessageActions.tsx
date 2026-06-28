import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";

export default function MessageActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex gap-2 mt-2">
      {[
        { icon: <Copy size={13} />, label: "Copy", action: handleCopy },
        { icon: <ThumbsUp size={13} />, label: "Good", action: () => {} },
        { icon: <ThumbsDown size={13} />, label: "Bad", action: () => {} },
      ].map(({ icon, label, action }) => (
        <button
          key={label}
          onClick={action}
          title={label}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-muted)" }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
