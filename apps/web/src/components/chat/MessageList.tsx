"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types/app";
import MessageBubble from "./MessageBubble";
import AiMessage from "./AiMessage";
import SummaryCard from "./SummaryCard";
import EmptyChat from "./EmptyChat";
import SkeletonCard from "@/components/shared/SkeletonCard";
import SkeletonLine from "@/components/shared/SkeletonLine";
import type { DraftContent } from "@/types/app";

export default function MessageList({
  messages,
  loading,
}: {
  messages: Message[];
  loading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4" ref={scrollRef}>
        <SkeletonCard />
        <SkeletonLine className="w-3/4 mx-auto" />
        <SkeletonLine className="w-1/2 mx-auto" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex overflow-y-auto" ref={scrollRef}>
        <EmptyChat />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4" ref={scrollRef}>
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
                draft={m.metadata.content as DraftContent}
                patientName={String((m.metadata as Record<string, unknown>).patient_name ?? "")}
                sourceCount={Number((m.metadata as Record<string, unknown>).source_count ?? 0)}
              />
            ) : null}
          </AiMessage>
        );
      })}
    </div>
  );
}
