import { FileCheck, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export interface OcrResultMessageProps {
  rawText: string;
  fileName: string;
  pageCount: number;
  chunkCount: number;
}

export default function OcrResultMessage({
  rawText,
  fileName,
  pageCount,
  chunkCount,
}: OcrResultMessageProps) {
  const [expanded, setExpanded] = useState(false);
  
  const isLong = rawText.length > 1500;
  const displayText = expanded ? rawText : rawText.substring(0, 1500);

  return (
    <div className="flex gap-4 w-full">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
        <Image src="/logo.png" alt="MediQ" width={24} height={24} className="object-contain" />
      </div>

      <div className="flex-1 max-w-2xl border border-[#e5e7eb] rounded-2xl bg-white shadow-sm overflow-hidden mt-1">
        <div className="bg-[#f9fafb] border-b border-[#e5e7eb] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="text-[#2563eb]" size={16} />
            <span className="font-medium text-sm text-[--text-primary]">Document Extracted</span>
          </div>
          <span className="text-xs text-[--text-muted]">
            {pageCount} pages · {chunkCount} chunks indexed
          </span>
        </div>

        <div className="px-5 py-4 relative">
          <p className="text-xs font-medium tracking-wide text-[--text-muted] uppercase mb-3">Extracted content</p>
          <pre className={`text-sm text-[--text-primary] leading-relaxed whitespace-pre-wrap font-sans overflow-hidden transition-all duration-300 ${!expanded && isLong ? "max-h-[300px]" : ""}`}>
            {displayText}
          </pre>
          
          {!expanded && isLong && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
          
          {isLong && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-[#2563eb] font-medium flex items-center gap-1 hover:underline relative z-10 bg-white/80 px-2 py-1 rounded"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <div className="px-5 py-3 bg-[#f9fafb] border-t border-[#e5e7eb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs text-[--text-muted]">
            Text indexed and ready for questions. AI summary generation coming soon.
          </span>
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap border border-blue-100 shrink-0">
            Ask a question below ↓
          </span>
        </div>
      </div>
    </div>
  );
}
