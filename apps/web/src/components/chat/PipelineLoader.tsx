"use client";

import { Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import type { PipelineStatus } from "./ChatPanel";

const PIPELINE_LABELS: Record<PipelineStatus, string> = {
  idle: "",
  uploading: "Uploading document...",
  ocr: "Extracting clinical text...",
  chunking: "Indexing document sections...",
  embedding: "Generating semantic embeddings...",
  agent_running: "Analyzing clinical content...",
  done: "",
  error: "Processing failed",
};

export default function PipelineLoader({ status }: { status: PipelineStatus }) {
  if (status === "idle" || status === "done") return null;

  const isError = status === "error";

  return (
    <div className="flex flex-col border border-[#e5e7eb] rounded-2xl p-4 bg-white shadow-sm w-80">
      <div className="flex items-start gap-4">
        <div className="shrink-0 rounded-lg p-2 bg-[#f9fafb] border border-[#f3f4f6]">
          <Image 
            src="/compress-pdf-flat.svg" 
            alt="PDF Document" 
            width={32} 
            height={32} 
            className="opacity-80"
          />
        </div>
        
        <div className="flex flex-col flex-1 min-w-0 justify-center min-h-[48px]">
          <div className="flex items-center gap-2">
            {!isError ? (
              <Loader2 className="w-4 h-4 text-[#2563eb] animate-spin shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span className={`text-sm font-medium leading-tight ${isError ? 'text-red-600' : 'text-[#111827]'}`}>
              {PIPELINE_LABELS[status]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
