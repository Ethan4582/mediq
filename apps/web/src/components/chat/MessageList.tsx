"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { Message } from "@/types/app";
import MessageBubble from "./MessageBubble";
import AiMessage from "./AiMessage";
import SummaryCard from "./SummaryCard";
import EmptyChat from "./EmptyChat";
import SkeletonCard from "@/components/shared/SkeletonCard";
import SkeletonLine from "@/components/shared/SkeletonLine";
import type { DraftContent } from "@/types/app";

import type { PendingUpload, OcrResult } from "@/hooks/useDocumentUpload";
import DocumentCard from "./DocumentCard";
import OcrResultMessage from "./OcrResultMessage";

export default function MessageList({
  messages,
  loading,
  pendingUpload,
  ocrResult,
  draft,
  agentStatus,
}: {
  messages: Message[];
  loading: boolean;
  pendingUpload?: PendingUpload | null;
  ocrResult?: OcrResult | null;
  draft?: any;
  agentStatus?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingUpload, ocrResult]);

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
    <div className="absolute inset-0 overflow-y-auto flex flex-col pt-6 pb-28 px-6 items-center" ref={scrollRef}>
      <div className="w-full max-w-[780px] flex flex-col gap-6">
        {messages.map((m, i) => {
          if (m.role === "user") {
            return <MessageBubble key={m.id ?? i} message={m} />;
          }

          const isSummary =
            (m.metadata as Record<string, unknown>)?.type === "summary";

          return (
            <AiMessage key={m.id ?? i} message={m}>
              {isSummary && m.metadata?.content ? (
                <SummaryCard
                  rawText={typeof m.metadata.content === 'string' ? m.metadata.content : JSON.stringify(m.metadata.content)}
                  fileName={String((m.metadata as Record<string, unknown>).file_name ?? "Unknown")}
                  pageCount={Number((m.metadata as Record<string, unknown>).page_count ?? 1)}
                  chunkCount={Number((m.metadata as Record<string, unknown>).source_count ?? 0)}
                />
              ) : null}
            </AiMessage>
          );
        })}

        {pendingUpload && (
          <div className="flex justify-center w-full my-6">
            <DocumentCard
              fileName={pendingUpload.fileName}
              fileSize={pendingUpload.fileSize}
              pageCount={pendingUpload.pageCount}
              status={pendingUpload.status}
              progress={pendingUpload.progress}
              stage={pendingUpload.stage}
              errorMessage={pendingUpload.errorMessage}
            />
          </div>
        )}

        {ocrResult && !draft && (
          <div className="w-full">
            <OcrResultMessage
              rawText={ocrResult.rawText}
              fileName={ocrResult.fileName}
              pageCount={ocrResult.pageCount}
              chunkCount={ocrResult.chunkCount}
            />
            {agentStatus === "running" && (
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Agent is analyzing the document...</span>
              </div>
            )}
            {agentStatus === "error" && (
              <div className="mt-4 text-sm text-red-500">
                Error running agent analysis.
              </div>
            )}
          </div>
        )}

        {draft && (
          <AiMessage message={{ role: "assistant", content: "", id: "draft-msg", created_at: "", session_id: "", metadata: {} }}>
             <SummaryCard
               rawText={typeof draft === 'string' ? draft : JSON.stringify(draft)}
               fileName={ocrResult?.fileName || "Unknown"}
               pageCount={ocrResult?.pageCount || 1}
               chunkCount={ocrResult?.chunkCount || 0}
             />
          </AiMessage>
        )}
      </div>
    </div>
  );
}
