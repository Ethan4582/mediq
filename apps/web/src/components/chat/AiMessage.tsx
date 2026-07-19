"use client";

import { useState } from "react";
import { FileText, ChevronDown } from "lucide-react";
import type { Message } from "@/types/app";
import MessageActions from "./MessageActions";

function parseMarkdown(text: string) {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith("### ")) {
      return <h3 key={i} className="text-[17px] font-bold mt-6 mb-2 text-[#111827]">{parseInline(block.replace("### ", ""))}</h3>;
    } else if (block.startsWith("## ")) {
      return <h2 key={i} className="text-[20px] font-bold mt-8 mb-3 text-[#111827]">{parseInline(block.replace("## ", ""))}</h2>;
    } else if (block.startsWith("# ")) {
      return <h1 key={i} className="text-[24px] font-bold mt-8 mb-4 text-[#111827]">{parseInline(block.replace("# ", ""))}</h1>;
    }

    const lines = block.split("\n");
    const isList = lines.some(l => /^\s*[-•*]\s/.test(l));
    if (isList) {
      return (
        <ul key={i} className="my-4 space-y-3 text-[#111827] pl-5 list-disc marker:text-[#2563eb]">
          {lines.map((line, j) => {
            const match = line.match(/^(\s*)([-•*]\s)(.*)/);
            if (match) {
              const indent = match[1].length;
              const content = match[3];
              const plClass = indent > 0 ? "pl-6 list-[circle] mt-1 text-[#374151]" : "pl-1";
              return (
                <li key={j} className={`${plClass} text-[15px] leading-relaxed`}>
                  {parseInline(content)}
                </li>
              );
            }
            return (
              <p key={j} className="text-[15px] leading-relaxed text-[#374151] mt-1">
                {parseInline(line)}
              </p>
            );
          })}
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
  const [showSources, setShowSources] = useState(false);
  const sources = (message.metadata?.sources || []) as any[];
  const sourceCount = message.metadata?.source_count || sources.length;

  return (
    <div className="w-full mb-2 relative group">
      
      {!children && (
        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <MessageActions content={message.content} />
        </div>
      )}

      {children ? (
        <div className="w-full">{children}</div>
      ) : (
        <div className="ai-content-wrapper pr-10">
          {parseMarkdown(message.content)}
        </div>
      )}

      {!children && (
        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <FileText className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Sources</span>
            </div>
            {sources.length > 0 ? (
              <>
                {sources.slice(0, 2).map((src, idx) => (
                  <div key={idx} className="rounded-full px-2 py-0.5 text-xs bg-gray-50 text-gray-600 border border-gray-200">
                    {src.source_file} · Page {src.page_num}
                  </div>
                ))}
                {sources.length > 2 && (
                  <button 
                    onClick={() => setShowSources(!showSources)}
                    className="rounded-full px-2 py-0.5 text-xs bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    +{sources.length - 2} more
                    <ChevronDown className={`w-3 h-3 transition-transform ${showSources ? "rotate-180" : ""}`} />
                  </button>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400">0</span>
            )}
          </div>
          
          {showSources && sources.length > 0 && (
            <div className="mt-3 space-y-2">
              {sources.map((src, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      {src.source_file} · Page {src.page_num}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {src.excerpt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
