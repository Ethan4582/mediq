"use client";

import { FileText, Eye, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentThumbnailCardProps {
  id?: string;
  name?: string;
  pageCount?: number;
  status?: string;
  createdAt?: string;
  rawText?: string;
  index?: number;
  onSelect?: () => void;
}

export default function DocumentThumbnailCard({
  name = "Document",
  pageCount,
  status = "ready",
  createdAt,
  rawText,
  index = 0,
  onSelect,
}: DocumentThumbnailCardProps) {
  const safeName = typeof name === "string" && name.trim() ? name : "Document";
  const isDone = status === "ready" || status === "completed" || Boolean(rawText);
  const formattedDate = createdAt ? (() => {
    try {
      const d = new Date(createdAt);
      return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
    } catch {
      return "";
    }
  })() : "";

  const fileExtension = safeName.includes(".")
    ? safeName.split(".").pop()?.toUpperCase() || "DOC"
    : "DOC";

  const renderThumbnailVisual = () => {
    const variant = Math.abs(index) % 4;

    if (variant === 0) {
      return (
        <div className="w-full h-full bg-white dark:bg-zinc-900/90 rounded-md p-2.5 flex flex-col justify-between shadow-inner select-none overflow-hidden relative border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-1">
            <div className="h-1.5 w-12 bg-blue-500/60 rounded" />
            <div className="h-1 w-6 bg-zinc-300 dark:bg-zinc-700 rounded" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="h-1 w-full bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-1 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-1 w-5/6 bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-1 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="grid grid-cols-2 gap-1 pt-1">
              <div className="h-3 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200/40 dark:border-blue-800/40" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-800/40 rounded border border-zinc-200/40 dark:border-zinc-700/40" />
            </div>
            <div className="h-1 w-2/3 bg-zinc-300 dark:bg-zinc-700 rounded" />
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-zinc-200 dark:border-zinc-800">
            <div className="h-1 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
            <div className="h-1 w-10 bg-blue-400/50 rounded" />
          </div>
        </div>
      );
    }

    if (variant === 1) {
      return (
        <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 rounded-md p-2 flex flex-col justify-between shadow-inner select-none overflow-hidden relative border border-black/5 dark:border-white/10">
          <div className="grid grid-cols-4 gap-0.5 border border-zinc-300 dark:border-zinc-700 p-0.5 rounded bg-white dark:bg-zinc-950 mb-1">
            <div className="h-1.5 bg-blue-500/40 rounded-xs col-span-2" />
            <div className="h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-xs col-span-2" />
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
          </div>
          <div className="space-y-1">
            <div className="h-1 w-full bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-1 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-1 w-5/6 bg-zinc-300 dark:bg-zinc-700 rounded" />
          </div>
          <div className="h-2 w-full bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-300/40 dark:border-emerald-800/40 flex items-center px-1">
            <div className="h-0.5 w-12 bg-emerald-500/70 rounded" />
          </div>
        </div>
      );
    }

    if (variant === 2) {
      return (
        <div className="w-full h-full bg-[#fdfbf7] dark:bg-[#1a1917] rounded-md p-2 flex flex-col justify-between shadow-inner select-none overflow-hidden relative border border-amber-900/10 dark:border-amber-100/10">
          <div className="flex items-center gap-1 mb-1">
            <div className="size-2 rounded-full bg-blue-500/60" />
            <div className="h-1.5 w-14 bg-zinc-400/50 rounded" />
          </div>
          <div className="space-y-1.5 my-auto">
            <div className="h-1 w-full bg-blue-900/20 dark:bg-blue-300/20 rounded font-serif italic" />
            <div className="h-1 w-11/12 bg-blue-900/20 dark:bg-blue-300/20 rounded font-serif italic" />
            <div className="h-1 w-4/5 bg-blue-900/20 dark:bg-blue-300/20 rounded font-serif italic" />
            <div className="h-1 w-full bg-blue-900/20 dark:bg-blue-300/20 rounded font-serif italic" />
          </div>
          <div className="flex justify-end pt-1">
            <div className="h-2 w-8 border-b-2 border-blue-600/40 rotate-[-5deg]" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-md p-2 flex flex-col justify-between shadow-inner select-none overflow-hidden relative border border-black/5 dark:border-white/10">
        <div className="flex justify-between items-center">
          <div className="h-1.5 w-10 bg-indigo-500/60 rounded" />
          <div className="size-2 rounded-full bg-emerald-500/60" />
        </div>
        <div className="space-y-1 py-1">
          <div className="h-1 w-full bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="h-1 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-1 w-full bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="h-1 w-3/5 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-6 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="h-1.5 w-10 bg-indigo-400/40 rounded" />
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onSelect}
      className="group relative flex flex-col bg-card hover:bg-muted/40 border border-border/80 hover:border-primary/40 rounded-xl p-2.5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative w-full aspect-[3/4] bg-muted/60 dark:bg-zinc-950/60 rounded-lg p-1.5 mb-2 overflow-hidden border border-border/40 group-hover:border-primary/30 transition-colors">
        {renderThumbnailVisual()}

        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-center">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Eye className="size-4" />
          </div>
          <span className="text-[11px] font-medium text-foreground">View OCR Text</span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-1.5 min-w-0">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors" title={safeName}>
            {safeName}
          </h4>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
            <FileText className="size-2.5" />
            <span>{pageCount ? `${pageCount} page${pageCount > 1 ? "s" : ""}` : "Document"}</span>
            {formattedDate && (
              <>
                <span>•</span>
                <span>{formattedDate}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1">
          {isDone ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3" />
              <span>Parsed</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <Clock className="size-3 animate-spin" />
              <span>Processing</span>
            </span>
          )}
        </div>
        <Badge variant="outline" className="text-[9px] px-1 py-0 font-normal">
          {fileExtension}
        </Badge>
      </div>
    </div>
  );
}
