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
      {/* Content column */}
      <div className="flex-1 min-w-0">
        {/* Summary card — full width */}
        <SummaryCard
          rawText={rawText}
          fileName={fileName}
          pageCount={pageCount}
          chunkCount={chunkCount}
          isFirst={true}
        />
      </div>
    </div>
  );
}
