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
    <div className={`w-full max-w-md rounded-2xl border bg-white shadow-sm overflow-hidden p-5 ${isError ? "border-red-200" : "border-[#e5e7eb]"}`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={fileName}>
            {fileName.length > 32 ? fileName.substring(0, 30) + "..." : fileName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {pageCount ? `${pageCount} pages` : "Processing"} {fileSize && `· ${fileSize}`}
          </p>
        </div>
        <div className="shrink-0 flex items-center justify-center">
          {isProcessing && <Loader2 size={20} className="animate-[spin_1.5s_linear_infinite] text-[#2563eb]" />}
          {isDone && <CheckCircle2 size={20} className="text-green-600" />}
          {isError && <XCircle size={20} className="text-red-500" />}
        </div>
      </div>

      {isProcessing && (
        <div className="mt-5">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
             <div className="bg-[#2563eb] h-1.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1">
            <OcrProgressSteps stage={stage} />
          </div>
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
