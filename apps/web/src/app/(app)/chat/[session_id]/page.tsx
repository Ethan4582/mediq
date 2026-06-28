"use client"
import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useMessages } from "@/hooks/useMessages";
import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";

export default function ChatPage() {
  const { session_id } = useParams();
  const { messages, loading } = useMessages(session_id as string);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    // Stub for now, returning 501 via api eventually
    console.log("Sending:", text);
    // Optimistic UI updates can be added here
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-auto p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto w-full">
          {loading && messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground min-h-[50vh]">
              Documents are being processed…
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground min-h-[50vh]">
              No messages yet.
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))
          )}
        </div>
      </div>
      <ChatInput onSend={handleSend} disabled={loading && messages.length === 0} />
    </div>
  )
}
