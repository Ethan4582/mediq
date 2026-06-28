"use client";

import { useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import TopBar from "@/components/layout/TopBar";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { Message } from "@/types/app";
import Link from "next/link";

export default function ChatPanel({ sessionId }: { sessionId: string }) {
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { messages, loading: messagesLoading } = useMessages(sessionId);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  const allMessages = [...messages, ...optimisticMessages];

  const handleSend = async (text: string) => {
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      session_id: sessionId,
      role: "user",
      content: text,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setOptimisticMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, message: text }),
        }
      );
      if (!res.ok) {
        console.warn("Chat API not yet implemented");
      }
    } catch {
      console.warn("Chat coming soon");
    }
  };

  if (!sessionLoading && !session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Session not found
        </p>
        <Link href="/chat" className="text-sm" style={{ color: "var(--brand-primary)" }}>
          ← Back to chat
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar session={session} loading={sessionLoading} />
      <MessageList messages={allMessages} loading={messagesLoading} />
      <ChatInput
        onSend={handleSend}
        disabled={session?.status === "processing"}
      />
    </div>
  );
}
