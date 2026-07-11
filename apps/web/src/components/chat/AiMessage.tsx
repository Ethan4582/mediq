"use client";

import { FileText } from "lucide-react";
import type { Message } from "@/types/app";
import MessageActions from "./MessageActions";
import { format } from "date-fns";

// A simple utility to parse basic markdown to React elements for the UI
function parseMarkdown(text: string) {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, i) => {
    // Check if it's a heading
    if (block.startsWith("### ")) {
      return <h3 key={i} className="text-lg font-bold mt-6 mb-2 text-[#111827]">{parseInline(block.replace("### ", ""))}</h3>;
    } else if (block.startsWith("## ")) {
      return <h2 key={i} className="text-xl font-bold mt-8 mb-4 text-[#111827]">{parseInline(block.replace("## ", ""))}</h2>;
    } else if (block.startsWith("# ")) {
      return <h1 key={i} className="text-2xl font-bold mt-8 mb-4 text-[#111827]">{parseInline(block.replace("# ", ""))}</h1>;
    }

    // Check if it's a list
    const lines = block.split("\n");
    if (lines.every(l => l.trim().startsWith("- ") || l.trim().startsWith("• ") || l.trim().startsWith("* "))) {
      return (
        <ul key={i} className="list-disc pl-5 space-y-2 mt-4 mb-4 text-[#111827]">
          {lines.map((l, j) => (
            <li key={j} className="pl-1">
              {parseInline(l.replace(/^[-•*]\s/, ""))}
            </li>
          ))}
        </ul>
      );
    }

    // Otherwise, treat as a paragraph
    return (
      <p key={i} className="text-[15px] leading-relaxed mb-4 text-[#374151]">
        {parseInline(block)}
      </p>
    );
  });
}

// Parses **bold** and *italic* within blocks
function parseInline(text: string) {
  // Simple hacky way to split and render bold. Using regex.
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
  const time = message.created_at
    ? format(new Date(message.created_at), "hh:mm a")
    : "";

  return (
    <div className="flex flex-col w-full max-w-[780px] mx-auto mb-8 mt-2">
      <div className="flex items-center gap-3 mb-4">
        {/* MediQ AI avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[#e5e7eb] bg-white overflow-hidden shadow-sm">
          <img src="/logo.png" alt="MediQ" className="w-5 h-5 object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#111827]">
            MediQ AI
          </span>
          <span className="text-[11px] font-medium text-gray-400">{time}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0 pl-11">
        {children ? (
          children
        ) : (
          <div className="ai-content-wrapper">
            {parseMarkdown(message.content)}
          </div>
        )}

        {!children && (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[11px] font-medium mt-4 hover:bg-gray-50 transition-colors"
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
