"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useSessionStore } from "@/stores/sessionStore";
import { useChat } from "@/hooks/useChat";
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
  const { messages, loading: messagesLoading, refetch: refetchMessages } = useMessages(isNew ? "" : sessionId);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const router = useRouter();
  
  const setAllOptimistic = useCallback((updater: (prev: Message[]) => Message[]) => {
    setOptimisticMessages(updater);
  }, []);
  
  const [activeDocumentId, setActiveDocumentId] = useState<string | undefined>(undefined);
  // Track doc IDs already processed to prevent re-triggering the agent
  const processedDocIds = useRef<Set<string>>(new Set());
  // Track which docId the active run is for — prevents concurrent duplicate runs
  const activeRunDocId = useRef<string | null | undefined>(undefined);

  const { upload, pendingUpload, setPendingUpload, ocrResult } = useDocumentUpload(sessionId, (newSessionId, docId) => {
    if (isNew) {
      router.replace(`/chat/${newSessionId}`);
    } else if (docId) {
      setActiveDocumentId(docId);
    }
  });

  // Latest draft — for the right panel viewer only, NOT used for chat timeline cards
  const [latestDraft, setLatestDraft] = useState<any>(null);
  
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

  // Sync upload stages to pipeline status
  useEffect(() => {
    if (pendingUpload) {
      if (pendingUpload.status === "error") setPipelineStatus("error");
      else if (pendingUpload.status === "done" && !["agent_running", "done", "error"].includes(pipelineStatus)) {
        setPipelineStatus("agent_running");
      }
      else if (pendingUpload.stage === "uploading" && pipelineStatus !== "uploading") setPipelineStatus("uploading");
      else if (pendingUpload.stage === "ocr" && pipelineStatus !== "ocr") setPipelineStatus("ocr");
      else if (pendingUpload.stage === "chunking" && pipelineStatus !== "chunking") setPipelineStatus("chunking");
      else if (pendingUpload.stage === "embedding" && pipelineStatus !== "embedding") setPipelineStatus("embedding");
    } else if (latestDraft && pipelineStatus === "idle") {
      setPipelineStatus("done");
    }
  }, [pendingUpload, latestDraft, pipelineStatus]);

  // Trigger agent when ocrResult is ready but no draft exists yet.
  // This handles the new-session navigation case where the component remounts
  // after router.replace() and the SSE stream is already dead.
  useEffect(() => {
    if (!ocrResult || latestDraft || !sessionId || sessionId === "new") return;
    if (pipelineStatus === "idle") {
      console.log("[AGENT UI] ocrResult ready, no draft → transitioning to agent_running");
      setPipelineStatus("agent_running");
    }
  }, [ocrResult, latestDraft, sessionId, pipelineStatus]);

  // Debug: log every pipelineStatus change
  useEffect(() => {
    console.log("[AGENT UI] pipelineStatus changed →", pipelineStatus);
  }, [pipelineStatus]);

  // Silent draft fetch for already completed sessions (avoids animations/toasts)
  useEffect(() => {
    const isDone = session?.status === "done";
    if (!isDone || sessionId === "new" || latestDraft || pipelineStatus !== "idle") return;
    const fetchDraftSilently = async () => {
      try {
        const supabase = createClient();
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const token = authSession?.access_token;
        const draftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/patient/${sessionId}/draft`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (draftRes.ok) {
          const data = await draftRes.json();
          if (data?.content) {
            const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
            setLatestDraft(content);
            setPipelineStatus("done");
          } else {
            setPipelineStatus("agent_running");
          }
        } else {
          setPipelineStatus("agent_running");
        }
      } catch (err) {}
    };
    fetchDraftSilently();
  }, [session?.status, sessionId, latestDraft, pipelineStatus]);

  // Auto-trigger agent run when pipeline enters agent_running.
  // Guards: only run once per unique document ID.
  useEffect(() => {
    console.log("[AGENT UI] Effect evaluated", { pipelineStatus, sessionId, activeDocumentId });
    if (pipelineStatus !== "agent_running" || !sessionId || sessionId === "new") return;

    const docIdForThisRun = activeDocumentId;
    // Skip if we already ran this exact doc
    if (docIdForThisRun && processedDocIds.current.has(docIdForThisRun)) {
      console.log("[AGENT UI] Skipping run — doc already processed:", docIdForThisRun);
      return;
    }
    // Skip if a run is already in progress for this doc
    if (docIdForThisRun && activeRunDocId.current === docIdForThisRun) {
      console.log("[AGENT UI] Skipping run — run already active for doc:", docIdForThisRun);
      return;
    }
    // Skip if a run with no doc ID is already in progress
    if (!docIdForThisRun && activeRunDocId.current === "") {
      console.log("[AGENT UI] Skipping run — generic run already active");
      return;
    }

    console.log("[AGENT UI] Launching agent run for doc:", docIdForThisRun);
    activeRunDocId.current = docIdForThisRun || "";

    const checkAndRunAgent = async () => {
      try {
        const supabase = createClient();
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const token = authSession?.access_token;

        console.log("[AGENT UI] Sending POST /api/patient/" + sessionId + "/run with provider:", selectedProvider || "openai");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/patient/${sessionId}/run`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            llm_provider: selectedProvider || "openai",
            document_id: docIdForThisRun || undefined
          }),
        });
        
        if (res.ok) {
          const runData = await res.json();
          console.log("[AGENT UI] POST /run response received:", runData);
          if (runData.status === "done" && runData.draft_id) {
            console.log("[AGENT UI] Run finished instantly (cached). Fetching draft:", runData.draft_id);
            const draftRes2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/patient/${sessionId}/draft`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (draftRes2.ok) {
              const d = await draftRes2.json();
              if (d?.content) {
                const content = typeof d.content === "string" ? JSON.parse(d.content) : d.content;
                setLatestDraft(content);
              }
            }
            if (docIdForThisRun) processedDocIds.current.add(docIdForThisRun);
            activeRunDocId.current = null;
            setPendingUpload(null);
            console.log("[AGENT UI] ✅ Setting pipelineStatus to 'done' (run completed)");
            setPipelineStatus("done");
            refetchMessages();
            return;
          }
          console.log("[AGENT UI] Run started. Starting draft polling for run_id:", runData.run_id);
          pollDraft(runData.run_id, docIdForThisRun);
        } else {
          console.error("[AGENT UI] POST /run failed with status:", res.status);
          activeRunDocId.current = null;
          setPipelineStatus("error");
        }
      } catch (err) {
        console.error("[AGENT UI] Error triggering agent:", err);
        activeRunDocId.current = null;
        setPipelineStatus("error");
      }
    };

    const pollDraft = (runId: string, docId: string | undefined) => {
      let pollCount = 0;
      const interval = setInterval(async () => {
        pollCount++;
        console.log(`[AGENT UI] Polling for draft (attempt ${pollCount}/30)...`);
        if (pollCount > 30) {
          console.error("[AGENT UI] Polling timed out after 30 attempts.");
          clearInterval(interval);
          activeRunDocId.current = null;
          setPipelineStatus("error");
          return;
        }
        
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/patient/${sessionId}/draft`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.content && data.run_id === runId) {
              console.log("[AGENT UI] Draft generated successfully!", data);
              const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
              setLatestDraft(content);
              if (docId) processedDocIds.current.add(docId);
              activeRunDocId.current = null;
              setPendingUpload(null);
              setPipelineStatus("done");
              refetchMessages();
              toast.success("Summary ready", { description: "Discharge summary has been generated.", duration: 5000 });
              useSessionStore.getState().setFileViewMode(true);
              clearInterval(interval);
            }
          }
        } catch (e) {
          console.warn("[AGENT UI] Draft poll failed attempt:", e);
        }
      }, 2000);
    };

    checkAndRunAgent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineStatus, activeDocumentId]);

  const allMessages = [...messages, ...optimisticMessages];

  const { sendMessage, isSending } = useChat(allMessages, setAllOptimistic, refetchMessages);

  const handleSend = async (text: string) => {
    if (pipelineStatus !== "done" && pipelineStatus !== "idle") return;
    await sendMessage(text, sessionId);
  };

  const handleUpload = async (file: File) => {
    // Reset pipeline state so new doc goes through the full flow independently
    setPipelineStatus("idle");
    activeRunDocId.current = null;
    await upload(file);
  };

  const { isRightPanelOpen, isFileViewMode } = useSessionStore();

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

  const handleSelectDraft = useCallback(async (draftId: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/patient/${sessionId}/draft/${draftId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.content) {
          const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
          setLatestDraft(content);
          useSessionStore.getState().setRightPanelTab("summary");
          useSessionStore.getState().setFileViewMode(true);
          useSessionStore.getState().setRightPanelOpen(true);
        }
      }
    } catch (e) {
      console.error("Failed to load specific draft:", e);
    }
  }, [sessionId]);

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
            isNew={isNew}
            pendingUpload={pendingUpload}
            ocrResult={ocrResult}
            pipelineStatus={pipelineStatus}
            onSelectDraft={handleSelectDraft}
          />
          
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white via-white/85 to-transparent pt-8 pointer-events-none">
            <div className="pointer-events-auto">
              <ChatInput
                onSend={handleSend}
                onUpload={handleUpload}
                disabled={(pipelineStatus !== "done" && pipelineStatus !== "idle") || isSending}
                isSending={isSending}
                pipelineStatus={pipelineStatus}
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
          <RightPanel draft={latestDraft} ocrResult={ocrResult} />
        </div>
      )}
    </div>
  );
}
