"use client";

import SummaryCard from "../chat/SummaryCard";
import { FileSearch } from "lucide-react";

interface SummaryTabProps {
  draft?: any;
  ocrResult?: any;
}

export default function SummaryTab({ draft, ocrResult }: SummaryTabProps) {
  if (!ocrResult && !draft) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--text-secondary)] mt-10">
        <FileSearch size={32} className="mx-auto mb-3 opacity-30 text-[#2563eb]" />
        <p className="text-sm">No summary available.</p>
        <p className="text-xs mt-1">Upload a document to generate a summary.</p>
      </div>
    );
  }

  return (
    <div className="p-5 overflow-x-hidden">
      <SummaryCard 
        draft={draft}
        rawText={ocrResult?.rawText || ""}
        fileName={ocrResult?.fileName || "Document"}
        pageCount={ocrResult?.pageCount || 1}
        chunkCount={ocrResult?.chunkCount || 0}
        isFirst={true}
        hideMetadata={true}
      />
      
      {/* Edit button placeholder at the bottom */}
      <div className="mt-8 pt-6 border-t border-[var(--border-default)]">
        <button 
          disabled
          title="Coming in next update"
          className="w-full py-2.5 rounded-lg border border-[var(--border-default)] bg-[#f9fafb] text-[var(--text-secondary)] font-medium text-sm flex items-center justify-center gap-2 transition-colors opacity-60 cursor-not-allowed hover:bg-gray-100"
        >
          Edit Summary
        </button>
      </div>
    </div>
  );
}
