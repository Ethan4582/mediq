"use client";

import Image from "next/image";
import {
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from "@astryxdesign/core/Chat";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { FileText, ArrowRight, Sparkles } from "lucide-react";
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
          <div className="text-[14.5px] leading-relaxed text-gray-900 font-normal">
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
        <div className="w-7 h-7 rounded-lg border border-gray-200/80 bg-white flex items-center justify-center overflow-hidden shadow-xs shrink-0">
          <Image
            src="/logo.png"
            alt="MediQ"
            width={16}
            height={16}
            className="w-4 h-4 object-contain"
            unoptimized
          />
        </div>
      }
    >
      {message.content && (
        <ChatMessageBubble variant="ghost">
          <Markdown density="compact">{message.content}</Markdown>
        </ChatMessageBubble>
      )}

      {/* Adapted Medical Summary Conversation Card */}
      {isSummaryCard && (
        <div className="mt-3 w-full max-w-[460px]">
          <div
            onClick={() => onOpenArtifact?.(metadata?.draft_id)}
            className="group rounded-xl border border-blue-200/80 bg-gradient-to-b from-white to-blue-50/20 p-4 shadow-xs hover:shadow-md hover:border-blue-400/80 transition-all cursor-pointer select-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                      Discharge Summary
                    </span>
                    <Sparkles className="w-3 h-3 text-blue-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                    {metadata?.diagnoses?.principal_diagnosis ??
                      metadata?.title ??
                      "Clinical Discharge Summary"}
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-medium bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200/60">
                Ready
              </span>
            </div>

            {metadata?.diagnoses?.secondary_diagnoses &&
              metadata.diagnoses.secondary_diagnoses.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5">
                  {metadata.diagnoses.secondary_diagnoses.slice(0, 3).map((diag, i) => (
                    <span
                      key={i}
                      className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-200/80"
                    >
                      {diag}
                    </span>
                  ))}
                  {metadata.diagnoses.secondary_diagnoses.length > 3 && (
                    <span className="text-[11px] text-gray-400 self-center">
                      +{metadata.diagnoses.secondary_diagnoses.length - 3} more
                    </span>
                  )}
                </div>
              )}

            <div className="mt-3 flex items-center justify-between text-xs text-blue-600 font-medium group-hover:text-blue-700">
              <span>View full clinical artifact</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      )}
    </ChatMessage>
  );
}
