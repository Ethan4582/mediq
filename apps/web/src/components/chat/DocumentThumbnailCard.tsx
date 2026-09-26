"use client";

import Image from "next/image";
import { Eye, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentThumbnailCardProps {
  id?: string;
  name?: string;
  pageCount?: number;
  status?: string;
  createdAt?: string;
  rawText?: string;
  previewUrl?: string;
  index?: number;
  onSelect?: () => void;
}

export default function DocumentThumbnailCard({
  name = "Document",
  pageCount,
  status = "ready",
  createdAt,
  rawText,
  previewUrl,
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
    if (previewUrl) {
      return (
        <div className="relative w-full h-full">
          <Image
            src={previewUrl}
            alt={safeName}
            fill
            unoptimized
            className="object-cover object-top"
          />
        </div>
      );
    }

    if (rawText && rawText.trim().length > 0) {
      const previewLines = rawText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .slice(0, 10);

      return (
        <div className="w-full h-full bg-white dark:bg-zinc-900 p-2 flex flex-col justify-between select-none overflow-hidden text-left border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-1">
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-blue-500" />
              <span className="text-[7.5px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Clinical Report
              </span>
            </div>
            <span className="text-[6.5px] text-zinc-400 font-mono">OCR</span>
          </div>

          <div className="space-y-0.5 flex-1 overflow-hidden font-mono text-[6.5px] leading-tight text-zinc-600 dark:text-zinc-400">
            {previewLines.map((line, i) => (
              <p key={i} className="truncate">
                {line}
              </p>
            ))}
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-zinc-200 dark:border-zinc-800 text-[6px] text-zinc-400">
            <span>Verified Document</span>
            <div className="h-0.5 w-6 bg-blue-500/40 rounded" />
          </div>
        </div>
      );
    }

    const variant = Math.abs(index) % 3;

    if (variant === 0) {
      return (
        <div className="w-full h-full bg-white dark:bg-zinc-900 p-2.5 flex flex-col justify-between select-none overflow-hidden border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-1">
            <div className="h-1.5 w-10 bg-blue-500/60 rounded" />
            <div className="h-1 w-5 bg-zinc-300 dark:bg-zinc-700 rounded" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="h-1 w-full bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-1 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-1 w-5/6 bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-1 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <div className="h-2.5 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200/40" />
              <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800/40 rounded border border-zinc-200/40" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-zinc-200 dark:border-zinc-800">
            <div className="h-1 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
            <div className="h-1 w-8 bg-blue-400/50 rounded" />
          </div>
        </div>
      );
    }

    if (variant === 1) {
      return (
        <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 p-2 flex flex-col justify-between select-none overflow-hidden border border-black/5 dark:border-white/10">
          <div className="grid grid-cols-3 gap-0.5 border border-zinc-200 dark:border-zinc-700 p-0.5 rounded bg-white dark:bg-zinc-950 mb-1">
            <div className="h-1 bg-blue-500/40 rounded-xs" />
            <div className="h-1 bg-zinc-300 dark:bg-zinc-700 rounded-xs" />
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
          <div className="h-1.5 w-full bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-300/40 flex items-center px-1">
            <div className="h-0.5 w-8 bg-emerald-500/70 rounded" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-[#fdfbf7] dark:bg-[#1a1917] p-2 flex flex-col justify-between select-none overflow-hidden border border-amber-900/10 dark:border-amber-100/10">
        <div className="flex items-center gap-1 mb-1">
          <div className="size-1.5 rounded-full bg-blue-500/60" />
          <div className="h-1 w-10 bg-zinc-400/50 rounded" />
        </div>
        <div className="space-y-1 my-auto">
          <div className="h-1 w-full bg-blue-900/20 dark:bg-blue-300/20 rounded" />
          <div className="h-1 w-11/12 bg-blue-900/20 dark:bg-blue-300/20 rounded" />
          <div className="h-1 w-4/5 bg-blue-900/20 dark:bg-blue-300/20 rounded" />
        </div>
        <div className="flex justify-end pt-0.5">
          <div className="h-1.5 w-6 border-b border-blue-600/40 rotate-[-5deg]" />
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onSelect}
      className="group relative flex flex-col bg-card hover:bg-muted/30 border border-border/80 hover:border-primary/50 rounded-xl overflow-hidden transition-all duration-150 cursor-pointer shadow-xs hover:shadow-sm"
    >
      <div className="relative w-full h-32 sm:h-36 bg-muted/40 overflow-hidden border-b border-border/50">
        {renderThumbnailVisual()}

        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2 text-center">
          <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Eye className="size-3.5" />
          </div>
          <span className="text-[10px] font-medium text-foreground">View OCR Text</span>
        </div>
      </div>

      <div className="p-2 flex items-center justify-between gap-1.5 min-w-0 bg-card">
        <div className="min-w-0 flex-1">
          <h4
            className="text-[11px] font-medium text-foreground truncate group-hover:text-primary transition-colors leading-tight"
            title={safeName}
          >
            {safeName}
          </h4>
          <div className="flex items-center gap-1 text-[9.5px] text-muted-foreground mt-0.5">
            {isDone ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-2.5" />
                <span>Ready</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="size-2.5 animate-spin" />
                <span>Parsing</span>
              </span>
            )}
            {pageCount ? (
              <>
                <span>•</span>
                <span>{pageCount}p</span>
              </>
            ) : null}
            {formattedDate ? (
              <>
                <span>•</span>
                <span>{formattedDate}</span>
              </>
            ) : null}
          </div>
        </div>

        <Badge variant="outline" className="text-[8.5px] px-1 py-0 font-mono shrink-0">
          {fileExtension}
        </Badge>
      </div>
    </div>
  );
}
