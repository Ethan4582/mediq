"use client";

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
          <img src="/logo.png" alt="MediQ" style={{ width: "auto", height: "auto" }} className="w-4 h-4 object-contain" />
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
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {metadata?.title || "Clinical Discharge Summary"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {metadata?.diagnoses?.principal_diagnosis
                      ? `Principal: ${metadata.diagnoses.principal_diagnosis}`
                      : "Discharge Summary Draft Ready"}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                <Sparkles className="w-3 h-3 text-blue-500" />
                Ready
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-100/90 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-normal">
                Click to inspect & export draft
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                Open Summary <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}
    </ChatMessage>
  );
}
