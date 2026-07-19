"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useSessionStore } from "@/stores/sessionStore";
import TopBar from "@/components/layout/TopBar";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import RightPanel from "../panel/RightPanel";
import type { Message } from "@/types/app";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type PipelineStatus = 
  | "idle"
  | "uploading"
  | "ocr"
  | "chunking"
  | "embedding"
  | "agent_running"
  | "done"
  | "error";

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
  
  // Use pending status if we just redirected from an upload, to prevent UI flash
  const pendingStatus = useSessionStore(state => state.pendingPipelineStatus);
  const clearPendingStatus = useSessionStore(state => state.setPendingPipelineStatus);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>(pendingStatus || "idle");
  
  useEffect(() => {
    if (pendingStatus) {
      clearPendingStatus(null);
    }
  }, [pendingStatus, clearPendingStatus]);

  const selectedProvider = useSessionStore(state => state.selectedProvider);
  const setSelectedProvider = useSessionStore(state => state.setSelectedProvider);

  // Sync upload stages to pipeline status, or recover state after redirect
  useEffect(() => {
    if (pendingUpload) {
      if (pendingUpload.status === "error") setPipelineStatus("error");
      else if (pendingUpload.stage === "uploading") setPipelineStatus("uploading");
      else if (pendingUpload.stage === "ocr") setPipelineStatus("ocr");
      else if (pendingUpload.stage === "chunking") setPipelineStatus("chunking");
      else if (pendingUpload.stage === "embedding") setPipelineStatus("embedding");
      else if (pendingUpload.status === "done") setPipelineStatus("agent_running");
    } else if (session?.status === "done") {
      setPipelineStatus("done");
    } else if (session?.status === "processing") {
      setPipelineStatus("agent_running");
    } else if (ocrResult && !draft && sessionId !== "new" && pipelineStatus === "idle" && session?.status !== "done") {
      setPipelineStatus("agent_running");
    } else if (draft) {
      setPipelineStatus("done");
    }
  }, [pendingUpload, ocrResult, draft, sessionId, pipelineStatus, session?.status]);

  // Silent draft fetch for already completed sessions (avoids animations/toasts)
  useEffect(() => {
    if (session?.status === "done" && sessionId !== "new" && !draft) {
      const fetchDraftSilently = async () => {
        try {
          const supabase = createClient();
          const { data: { session: authSession } } = await supabase.auth.getSession();
          const token = authSession?.access_token;
          
          const draftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/${sessionId}/draft`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (draftRes.ok) {
            const data = await draftRes.json();
            if (data && data.content) {
              const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
              setDraft(content);
              setPipelineStatus("done");
            }
          }
        } catch (err) {}
      };
      fetchDraftSilently();
    }
  }, [session?.status, sessionId, draft]);

  // Auto-trigger agent run when OCR is completely done and we transition to agent_running
  useEffect(() => {
    if (pipelineStatus === "agent_running" && sessionId && sessionId !== "new" && !draft) {
      const checkAndRunAgent = async () => {
        try {
          // If the session was already completed before we got here (should be caught above, but just in case)
          if (session?.status === "done") return;

          const supabase = createClient();
          const { data: { session: authSession } } = await supabase.auth.getSession();
          const token = authSession?.access_token;
          
          // First check if a draft already exists (e.g. page was refreshed while it was processing and it just finished)
          const draftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/${sessionId}/draft`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (draftRes.ok) {
            const data = await draftRes.json();
            if (data && data.content) {
              const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
              setDraft(content);
              setPipelineStatus("done");
              // Only toast if the session was actively processing, not if it was already done long ago
              if (session?.status === "processing") {
                toast.success("Summary ready", { description: "Discharge summary has been generated.", duration: 5000 });
              }
              return;
            }
          }

          // If session is processing on the backend, just poll. Don't trigger another run.
          if (session?.status === "processing") {
            pollDraft();
            return;
          }

          // No draft exists and not processing, run the agent
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/${sessionId}/run`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ llm_provider: selectedProvider || "openai" }),
          });
          
          if (res.ok) {
            pollDraft();
          } else {
            setPipelineStatus("error");
          }
        } catch (err) {
          setPipelineStatus("error");
        }
      };

      const pollDraft = () => {
        let pollCount = 0;
        const interval = setInterval(async () => {
          pollCount++;
          if (pollCount > 30) {
            clearInterval(interval);
            setPipelineStatus("error");
            return;
          }
          
          try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/${sessionId}/draft`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (data && data.content) {
                const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
                setDraft(content);
                setPipelineStatus("done");
                toast.success("Summary ready", { description: "Discharge summary has been generated.", duration: 5000 });
                useSessionStore.getState().setFileViewMode(true);
                clearInterval(interval);
              }
            }
          } catch (e) {
            // keep polling
          }
        }, 2000);
      };

      checkAndRunAgent();
    }
  }, [pipelineStatus, sessionId, draft, selectedProvider]);

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
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
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

  const { isRightPanelOpen, isFileViewMode } = useSessionStore();

  return (
    <div className="flex h-full overflow-hidden bg-white relative">
      <div 
        className={`flex flex-col h-full transition-all duration-300 flex-1 min-w-0 ${
          isRightPanelOpen ? "border-r border-[var(--border-default)]" : ""
        }`}
      >
        <TopBar session={session} loading={sessionLoading && !isNew} />
        
        <div className="flex-1 relative overflow-hidden">
          <MessageList 
            messages={allMessages} 
            loading={messagesLoading && !isNew} 
            pendingUpload={pendingUpload}
            ocrResult={ocrResult}
            draft={draft}
            pipelineStatus={pipelineStatus}
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
      
      {isRightPanelOpen && (
        <div className={`h-full shrink-0 transition-all duration-300 ${isFileViewMode ? "w-1/2" : "w-[300px]"}`}>
          <RightPanel draft={draft} ocrResult={ocrResult} />
        </div>
      )}
    </div>
  );
}
