"use client";

import { useEffect, useRef } from "react";
import { Loader2, FileCheck } from "lucide-react";
import type { Message } from "@/types/app";
import { useSessionStore } from "@/stores/sessionStore";
import MessageBubble from "./MessageBubble";
import AiMessage from "./AiMessage";
import SummaryCard from "./SummaryCard";
import EmptyChat from "./EmptyChat";
import SkeletonCard from "@/components/shared/SkeletonCard";
import SkeletonLine from "@/components/shared/SkeletonLine";
import type { DraftContent } from "@/types/app";

import type { PendingUpload, OcrResult } from "@/hooks/useDocumentUpload";
import type { PipelineStatus } from "./ChatPanel";
import PipelineLoader from "./PipelineLoader";

export default function MessageList({
  messages,
  loading,
  pendingUpload,
  ocrResult,
  draft,
  pipelineStatus,
}: {
  messages: Message[];
  loading: boolean;
  pendingUpload?: PendingUpload | null;
  ocrResult?: OcrResult | null;
  draft?: any;
  pipelineStatus?: PipelineStatus;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 30;
    }
  };

  useEffect(() => {
    if (scrollRef.current && isAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingUpload, ocrResult, draft]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4" ref={scrollRef}>
        <SkeletonCard />
        <SkeletonLine className="w-3/4 mx-auto" />
        <SkeletonLine className="w-1/2 mx-auto" />
      </div>
    );
  }

  if (messages.length === 0 && !pendingUpload && !ocrResult) {
    return (
      <div className="flex-1 flex overflow-y-auto" ref={scrollRef}>
        <EmptyChat />
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 overflow-y-auto flex flex-col pt-10 pb-28 px-8 items-center" 
      ref={scrollRef}
      onScroll={handleScroll}
    >
      <div className="w-full max-w-[860px] flex flex-col gap-8">
        {messages.map((m, i) => {
          if (m.role === "user") {
            return <MessageBubble key={m.id ?? i} message={m} />;
          }

          const isSummary =
            (m.metadata as Record<string, unknown>)?.type === "summary";

          const isFirstSummary = isSummary && messages.findIndex(msg => (msg.metadata as Record<string, unknown>)?.type === "summary") === i;

          return (
            <AiMessage key={m.id ?? i} message={m}>
              {isSummary && m.metadata?.content ? (
                <SummaryCard
                  rawText={typeof m.metadata.content === 'string' ? m.metadata.content : JSON.stringify(m.metadata.content)}
                  fileName={String((m.metadata as Record<string, unknown>).file_name ?? "Unknown")}
                  pageCount={Number((m.metadata as Record<string, unknown>).page_count ?? 1)}
                  chunkCount={Number((m.metadata as Record<string, unknown>).source_count ?? 0)}
                  isFirst={isFirstSummary}
                />
              ) : null}
            </AiMessage>
          );
        })}

        {pipelineStatus && pipelineStatus !== "idle" && pipelineStatus !== "done" && (
          <AiMessage message={{ role: "assistant", content: "", id: "pipeline-msg", created_at: "", session_id: "", metadata: {} }}>
            <PipelineLoader status={pipelineStatus} />
          </AiMessage>
        )}

        {draft && (
          <AiMessage message={{ role: "assistant", content: "", id: "draft-msg", created_at: "", session_id: "", metadata: {} }}>
            <div 
              className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-hover)] cursor-pointer bg-white transition-colors max-w-sm" 
              onClick={() => { 
                const { setRightPanelTab, setRightPanelOpen } = useSessionStore.getState();
                setRightPanelTab("summary"); 
                setRightPanelOpen(true); 
              }}
            >
              <FileCheck className="w-5 h-5 text-[#2563eb]" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Discharge summary generated</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Click to view full summary &rarr;</p>
              </div>
            </div>
          </AiMessage>
        )}
      </div>
    </div>
  );
}
