"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import TopBar from "@/components/layout/TopBar";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { Message } from "@/types/app";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";

export default function ChatPanel({ sessionId }: { sessionId: string }) {
  const isNew = sessionId === "new";
  const { session, loading: sessionLoading } = useSession(isNew ? "" : sessionId);
  const { messages, loading: messagesLoading } = useMessages(isNew ? "" : sessionId);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const router = useRouter();
  
  const { upload, pendingUpload, ocrResult } = useDocumentUpload(sessionId, (newSessionId) => {
    if (isNew) {
      router.replace(`/chat/${newSessionId}`);
    }
  });

  const [draft, setDraft] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState<string>("idle");

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  
  // Auto-trigger agent run after OCR
  useEffect(() => {
    if (ocrResult && sessionId && sessionId !== "new" && agentStatus === "idle") {
      const runAgent = async () => {
        setAgentStatus("running");
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/${sessionId}/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ llm_provider: selectedProvider || "openai" }),
          });
          if (res.ok) {
            pollDraft();
          } else {
            setAgentStatus("error");
          }
        } catch (err) {
          setAgentStatus("error");
        }
      };

      const pollDraft = () => {
        const interval = setInterval(async () => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/${sessionId}/draft`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.content) {
                setDraft(data.content);
                setAgentStatus("done");
                clearInterval(interval);
              }
            } else if (res.status !== 404) {
              // Wait for completion unless it's a hard error
            }
          } catch (e) {
            // keep polling
          }
        }, 2000);
      };

      runAgent();
    }
  }, [ocrResult, sessionId, agentStatus, selectedProvider]);

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

  const handleUpload = async (file: File) => {
    await upload(file);
  };

  if (!isNew && !sessionLoading && !session) {
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
    <div className="flex flex-col h-full overflow-hidden bg-white relative">
      <TopBar session={session} loading={sessionLoading && !isNew} />
      
      <div className="flex-1 relative h-full">
        <MessageList 
          messages={allMessages} 
          loading={messagesLoading && !isNew} 
          pendingUpload={pendingUpload}
          ocrResult={ocrResult}
          draft={draft}
          agentStatus={agentStatus}
        />
        
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white via-white/85 to-transparent pt-8 pointer-events-none">
          <div className="pointer-events-auto">
            <ChatInput
              onSend={handleSend}
              onUpload={handleUpload}
              disabled={session?.status === "processing"}
              pendingUpload={pendingUpload}
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
