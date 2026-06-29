"use client";

import { Plus } from "lucide-react";
import { FileText } from "lucide-react";
import type { Message } from "@/types/app";
import MessageActions from "./MessageActions";
import { format } from "date-fns";

export default function AiMessage({
  message,
  children,
}: {
  message: Message;
  children?: React.ReactNode;
}) {
  const time = message.created_at
    ? format(new Date(message.created_at), "hh:mm a")
    : "";

  const lines = message.content.split("\n").filter(Boolean);
  const hasBullets = lines.some((l) => l.startsWith("- ") || l.startsWith("• "));

  return (
    <div className="flex flex-col w-full max-w-[780px]">
      <div className="flex items-center gap-3 mb-3">
        {/* MediQ AI avatar */}
        <div className="w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center shrink-0">
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
        </div>
        <div className="flex items-center">
          <span className="text-sm font-semibold text-[#111827]">
            MediQ AI
          </span>
          <span className="text-xs text-[#9ca3af] ml-2">
            {time}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0 pl-1">
        {children ? (
          children
        ) : hasBullets ? (
          <ul className="list-disc pl-5 space-y-1 text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
            {lines
              .filter((l) => l.startsWith("- ") || l.startsWith("• "))
              .map((l, i) => (
                <li key={i}>{l.replace(/^[-•]\s/, "")}</li>
              ))}
          </ul>
        ) : (
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            {message.content}
          </p>
        )}

        {!children && (
          <button
            className="flex items-center gap-1.5 text-xs mt-3 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <FileText size={12} />
            Sources (4)
          </button>
        )}

        <MessageActions content={message.content} />
      </div>
    </div>
  );
}
