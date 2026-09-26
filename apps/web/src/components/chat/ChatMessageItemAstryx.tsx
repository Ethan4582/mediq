"use client";

import Image from "next/image";
import {
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from "@astryxdesign/core/Chat";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { ClipboardCheck, ArrowRight, Sparkles } from "lucide-react";
import type { Message } from "@/types/app";

interface ChatMessageItemProps {
  message: Message;
  onOpenArtifact?: (draftId?: string) => void;
}

export default function ChatMessageItemAstryx({
  message,
  onOpenArtifact,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const metadata = message.metadata as
    | {
        type?: string;
        draft_id?: string;
        title?: string;
        diagnoses?: { principal_diagnosis?: string; secondary_diagnoses?: string[] };
      }
    | null;
  const isSummaryCard = metadata?.type === "summary" || !!metadata?.draft_id;

  if (isUser) {
    return (
      <ChatMessage sender="user">
        <ChatMessageBubble
          metadata={
            message.created_at ? (
              <ChatMessageMetadata
                timestamp={<Timestamp value={message.created_at} format="time" />}
              />
            ) : undefined
          }
        >
          <div className="text-[14.5px] leading-relaxed text-foreground font-normal">
            {message.content ?? ""}
          </div>
        </ChatMessageBubble>
      </ChatMessage>
    );
  }

  return (
    <ChatMessage
      sender="assistant"
      avatar={
        <div className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center overflow-hidden shadow-xs shrink-0">
          <Image
            src="/logo.png"
            alt="MediQ"
            width={16}
            height={16}
            className="w-4 h-4 object-contain"
          />
        </div>
      }
    >
      {message.content && (
        <ChatMessageBubble variant="ghost">
          <Markdown density="compact">{message.content}</Markdown>
        </ChatMessageBubble>
      )}

      {isSummaryCard && (
        <div className="mt-2.5 max-w-[460px] w-full">
          <div
            onClick={() => onOpenArtifact?.(metadata?.draft_id)}
            className="group rounded-lg border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-b from-card to-blue-50/20 dark:to-blue-950/20 p-3 shadow-xs hover:shadow-md hover:border-blue-400/80 transition-all cursor-pointer select-none"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shadow-xs shrink-0">
                  <ClipboardCheck className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Discharge Summary
                    </span>
                    <Sparkles className="size-2.5 text-blue-500" />
                  </div>
                  <h4 className="text-xs sm:text-[13px] font-semibold text-foreground leading-tight truncate">
                    {metadata?.diagnoses?.principal_diagnosis ??
                      metadata?.title ??
                      "Clinical Discharge Summary"}
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-medium bg-blue-100/70 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                Ready
              </span>
            </div>

            {metadata?.diagnoses?.secondary_diagnoses &&
              metadata.diagnoses.secondary_diagnoses.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/60 flex flex-wrap gap-1">
                  {metadata.diagnoses.secondary_diagnoses.slice(0, 3).map((diag, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-muted-foreground bg-card px-1.5 py-0.5 rounded border border-border/80"
                    >
                      {diag}
                    </span>
                  ))}
                  {metadata.diagnoses.secondary_diagnoses.length > 3 && (
                    <span className="text-[10px] text-muted-foreground self-center">
                      +{metadata.diagnoses.secondary_diagnoses.length - 3} more
                    </span>
                  )}
                </div>
              )}

            <div className="mt-2 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
              <span>View clinical artifact summary</span>
              <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      )}
    </ChatMessage>
  );
}
