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
  const [contextVisible, setContextVisible] = useState(false);
  const sources = (message.metadata?.sources || []) as any[];
  const sourceCount = message.metadata?.source_count || sources.length;

  return (
    <div className="w-full mb-2 relative group">
      
      {!children && (
        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <MessageActions 
            content={message.content} 
            onToggleContext={sources.length > 0 ? () => setContextVisible(!contextVisible) : undefined}
            isContextVisible={contextVisible}
          />
        </div>
      )}

      <div className="w-full">
        {message.content && (
          <div className="ai-content-wrapper pr-10 mb-3">
            {parseMarkdown(message.content)}
          </div>
        )}
        {children && <div>{children}</div>}
      </div>

      {!children && contextVisible && (
        <div className="mt-4 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-1.5 text-gray-400 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Retrieved Context</span>
          </div>
          
          {sources.length > 0 ? (
            <div className="text-[13.5px] text-gray-600">
               <p className={`leading-relaxed ${!showSources ? 'line-clamp-3' : ''}`}>
                 {sources.map(s => s.excerpt).join(" ... ")}
               </p>
               {sources.map(s => s.excerpt).join(" ... ").length > 200 && (
                 <button 
                   onClick={() => setShowSources(!showSources)}
                   className="text-[#2563eb] hover:text-blue-700 font-medium mt-1.5 text-xs transition-colors"
                 >
                   {showSources ? "Show less" : "Show more"}
                 </button>
               )}
            </div>
          ) : (
             <span className="text-[13px] text-gray-400">This information was not found in the uploaded documents.</span>
          )}
        </div>
      )}
    </div>
  );
}
