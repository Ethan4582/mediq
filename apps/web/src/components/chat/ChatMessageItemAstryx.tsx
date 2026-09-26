"use client";

import {
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
  ChatTokenizedText,
} from "@astryxdesign/core/Chat";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
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
    | { type?: string; draft_id?: string; title?: string }
    | null;
  const isSummaryCard = metadata?.type === "summary" || !!metadata?.draft_id;

  if (isUser) {
    return (
      <ChatMessage sender="user">
        <ChatMessageBubble
          metadata={
            message.created_at ? (
              <ChatMessageMetadata
                timestamp={
                  <Timestamp value={message.created_at} format="time" />
                }
              />
            ) : undefined
          }
        >
          <ChatTokenizedText
            tokens={[{ value: "@agent", label: "MediQ", variant: "blue" }]}
          >
            {message.content ?? ""}
          </ChatTokenizedText>
        </ChatMessageBubble>
      </ChatMessage>
    );
  }

  return (
    <ChatMessage
      sender="assistant"
      avatar={<Avatar name="MediQ" size="md" />}
    >
      {message.content && (
        <ChatMessageBubble variant="ghost">
          <Markdown density="compact">{message.content}</Markdown>
        </ChatMessageBubble>
      )}

      {isSummaryCard && (
        <div style={{ maxWidth: 460, marginTop: 8 }}>
          <ClickableCard
            label="Open Discharge Summary"
            variant="muted"
            padding={3}
            onClick={() => onOpenArtifact?.(metadata?.draft_id)}
          >
            <HStack gap={3} vAlign="center">
              <Icon icon={DocumentTextIcon} size="md" color="accent" className="w-5 h-5 shrink-0" style={{ width: 20, height: 20 }} />
              <VStack gap={0}>
                <Text type="label" weight="semibold">
                  {metadata?.title || "Clinical Discharge Summary"}
                </Text>
                <Text type="supporting" color="secondary">
                  Discharge Summary Ready
                </Text>
              </VStack>
            </HStack>
          </ClickableCard>
        </div>
      )}
    </ChatMessage>
  );
}
