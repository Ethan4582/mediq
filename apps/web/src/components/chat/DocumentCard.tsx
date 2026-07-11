import { FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import OcrProgressSteps from "./OcrProgressSteps";

export interface DocumentCardProps {
  fileName: string;
  pageCount?: number;
  fileSize?: string;
  status: "uploading" | "processing" | "done" | "error";
  progress: number;
  stage: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export default function DocumentCard({
  fileName,
  pageCount,
  fileSize,
  status,
  progress,
  stage,
  errorMessage,
  onRetry,
}: DocumentCardProps) {
  const isError = status === "error";
  const isDone = status === "done";
  const isProcessing = status === "uploading" || status === "processing";

  return (
    <div className={`w-full max-w-sm rounded-2xl border ${isError ? "border-red-200 bg-red-50/30" : "border-gray-200/60 bg-white"} shadow-sm overflow-hidden p-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isError ? "bg-red-100 text-red-500" : "bg-[#f3f4f6] text-[#4b5563]"}`}>
          <FileText size={18} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[14px] font-semibold text-gray-900 leading-tight truncate" title={fileName}>
            {fileName}
          </p>
          <p className="text-[11px] font-medium text-gray-400 mt-1">
            {pageCount ? `${pageCount} pages` : "Processing"} {fileSize && `· ${fileSize}`}
          </p>
        </div>
        <div className="shrink-0 flex items-center justify-center pt-1">
          {isProcessing && <Loader2 size={16} className="animate-[spin_1.5s_linear_infinite] text-[#2563eb]" />}
          {isDone && <CheckCircle2 size={16} className="text-green-500" />}
          {isError && <XCircle size={16} className="text-red-500" />}
        </div>
      </div>

      {isProcessing && (
        <div className="mt-4">
          <OcrProgressSteps stage={stage} />
        </div>
      )}

      {isDone && (
        <div className="mt-3 text-xs text-green-600 font-medium flex items-center gap-1.5">
          <CheckCircle2 size={14} /> Document processed successfully
        </div>
      )}

      {isError && (
        <div className="mt-3 text-xs text-red-600">
          <p>{errorMessage || "Failed to process document"}</p>
          {onRetry && (
            <button onClick={onRetry} className="text-[#2563eb] underline cursor-pointer mt-1 font-medium">
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
