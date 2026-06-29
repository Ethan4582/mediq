import { Plus, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import SummaryCard from "./SummaryCard";

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
  return (
    <div className="flex gap-3 px-0 py-2 w-full">
      {/* MediQ Avatar */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-gray-100 bg-white overflow-hidden">
        <img src="/logo.png" alt="MediQ" className="w-6 h-6 object-contain" />
      </div>
      
      {/* Content column */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-[#111827]">MediQ AI</span>
        </div>
        
        {/* Summary card — full width */}
        <SummaryCard
          rawText={rawText}
          fileName={fileName}
          pageCount={pageCount}
          chunkCount={chunkCount}
        />
        
        {/* Action row below card */}
        <div className="flex items-center gap-3 mt-2.5 ml-1">
          <button className="w-7 h-7 rounded-md hover:bg-[#f4f6f8] flex items-center justify-center text-[#9ca3af] hover:text-[#374151] transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-md hover:bg-[#f4f6f8] flex items-center justify-center text-[#9ca3af] hover:text-[#374151] transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-md hover:bg-[#f4f6f8] flex items-center justify-center text-[#9ca3af] hover:text-[#374151] transition-colors">
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
