"use client";

import { FileText } from "lucide-react";
import type { Message } from "@/types/app";
import MessageActions from "./MessageActions";
import { format } from "date-fns";

function parseMarkdown(text: string) {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith("### ")) {
      return <h3 key={i} className="text-[17px] font-bold mt-6 mb-2 text-[#111827]">{parseInline(block.replace("### ", ""))}</h3>;
    } else if (block.startsWith("## ")) {
      return <h2 key={i} className="text-[19px] font-bold mt-8 mb-3 text-[#111827]">{parseInline(block.replace("## ", ""))}</h2>;
    } else if (block.startsWith("# ")) {
      return <h1 key={i} className="text-[22px] font-bold mt-8 mb-4 text-[#111827]">{parseInline(block.replace("# ", ""))}</h1>;
    }

    const lines = block.split("\n");
    if (lines.every(l => l.trim().startsWith("- ") || l.trim().startsWith("• ") || l.trim().startsWith("* "))) {
      return (
        <ul key={i} className="space-y-2 mt-3 mb-4 text-[#111827]" style={{ paddingLeft: "1.2rem", listStyleType: "disc" }}>
          {lines.map((l, j) => (
            <li key={j} className="pl-1 text-[15px] leading-relaxed">
              {parseInline(l.replace(/^[-•*]\s/, ""))}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="text-[15px] leading-relaxed mb-4 text-[#374151]">
        {parseInline(block)}
      </p>
    );
  });
}

function parseInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-[#111827]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function AiMessage({
  message,
  children,
}: {
  message: Message;
  children?: React.ReactNode;
}) {
  return (
    <div className="w-full mb-2">
      {children ? (
        <div className="w-full">{children}</div>
      ) : (
        <div className="ai-content-wrapper">
          {parseMarkdown(message.content)}
        </div>
      )}

      {!children && (
        <div className="flex items-center gap-2 mt-4">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 text-[11px] font-medium hover:bg-gray-50 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <FileText size={11} />
            Sources
          </button>
          <MessageActions content={message.content} />
        </div>
      )}
    </div>
  );
}
