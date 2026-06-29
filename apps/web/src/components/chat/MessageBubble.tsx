import type { Message } from "@/types/app";
import { format } from "date-fns";

export default function MessageBubble({ message }: { message: Message }) {
  const time = message.created_at
    ? format(new Date(message.created_at), "hh:mm a")
    : "";

  return (
    <div className="flex justify-end px-6 py-3">
      <div className="max-w-[65%]">
        <div
          className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm"
          style={{
            background: "var(--bubble-user-bg)",
            color: "var(--bubble-user-text)",
          }}
        >
          {message.content}
        </div>
        <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
          {time}
        </p>
      </div>
    </div>
  );
}
