"use client";

import { useRef, useState, useCallback, useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Layout, LayoutContent, VStack, HStack } from "@astryxdesign/core/Layout";
import {
  ChatLayout,
  ChatMessageList,
  ChatMessage,
  ChatSystemMessage,
  ChatToolCalls,
} from "@astryxdesign/core/Chat";
import { Card } from "@astryxdesign/core/Card";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { toast } from "sonner";
import ChatComposerAstryx from "./ChatComposerAstryx";
import ChatMessageItemAstryx from "./ChatMessageItemAstryx";
import ArtifactPanelAstryx from "./ArtifactPanelAstryx";
import ChatLandingAstryx from "./ChatLandingAstryx";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { useSessionStore } from "@/stores/sessionStore";
import { createClient } from "@/lib/supabase/client";
import { createSessionAction } from "@/actions/sessions";
import type { Message, ClinicalDraft } from "@/types/app";

const rootStyle: CSSProperties = {
  flex: 1,
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
};

const chatColumnStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: "100%",
};

const chatLayoutStyle: CSSProperties = {
  height: "100%",
};

const MOBILE_MAX_WIDTH = 768;

function artifactPanelWidthVar(size: number): CSSProperties {
  return {
    width: `${size}px`,
    minWidth: 340,
    maxWidth: 800,
    height: "100%",
    flexShrink: 0,
    borderLeft: "1px solid var(--border-subtle, rgba(0,0,0,0.08))",
    backgroundColor: "var(--bg-surface, #ffffff)",
  };
}

const AI_CHAT_CSS = `
@media (max-width: 768px) {
  .ai-chat-resize-handle {
    display: none;
  }
  .ai-chat-artifact-panel {
    display: none;
    width: 100%;
    flex-shrink: 1;
  }
}
`;

export default function ChatPanelAstryx({ sessionId }: { sessionId: string }) {
  const isNew = sessionId === "new";
  useSession(isNew ? "" : sessionId);
  const { messages, loading: messagesLoading, refetch: refetchMessages } = useMessages(isNew ? "" : sessionId);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const router = useRouter();

  const setAllOptimistic = useCallback((updater: (prev: Message[]) => Message[]) => {
    setOptimisticMessages(updater);
  }, []);

  const [activeDocumentId, setActiveDocumentId] = useState<string | undefined>(undefined);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [latestDraft, setLatestDraft] = useState<ClinicalDraft | null>(null);

  const selectedProvider = useSessionStore((state) => state.selectedProvider);
  const setSelectedProvider = useSessionStore((state) => state.setSelectedProvider);
  const isRightPanelOpen = useSessionStore((state) => state.isRightPanelOpen);
  const setRightPanelOpen = useSessionStore((state) => state.setRightPanelOpen);

  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);
  const [panelSize, setPanelSize] = useState(520);
  const isDraggingRef = useRef(false);
  const rootRef = useRef<HTMLElement>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !rootRef.current) return;
      const rootRect = rootRef.current.getBoundingClientRect();
      const newWidth = rootRect.right - moveEvent.clientX;
      if (newWidth >= 340 && newWidth <= 800) {
        setPanelSize(newWidth);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  const executeAgentRun = useCallback(
    async (sessId: string, docId?: string) => {
      if (!sessId || sessId === "new") return;
      setIsAgentRunning(true);
      try {
        const supabase = createClient();
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        const token = authSession?.access_token;
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/agent/run`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              session_id: sessId,
              document_id: docId,
              provider: selectedProvider,
            }),
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail?.error || "Agent run failed");
        }

        const data = await res.json();
        if (data.draft) {
          setLatestDraft(data.draft);
          if (typeof window !== "undefined" && window.innerWidth <= MOBILE_MAX_WIDTH) {
            setIsArtifactDialogOpen(true);
          } else {
            setRightPanelOpen(true);
          }
          toast.success("Discharge Summary generated", {
            description: "Clinical summary created.",
          });
        }
        await refetchMessages();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Clinical agent workflow encountered an error";
        toast.error("Agent error", { description: message });
      } finally {
        setIsAgentRunning(false);
      }
    },
    [selectedProvider, refetchMessages, setRightPanelOpen]
  );

  const {
    upload,
    pendingUpload,
    ocrResult,
  } = useDocumentUpload(isNew ? "" : sessionId, (sessId, docId) => {
    setActiveDocumentId(docId);
    if (typeof window !== "undefined" && window.innerWidth <= MOBILE_MAX_WIDTH) {
      setIsArtifactDialogOpen(true);
    } else {
      setRightPanelOpen(true);
    }
    if (sessId && sessId !== "new") {
      executeAgentRun(sessId, docId);
    }
  });

  const { sendMessage, isSending } = useChat(
    messages,
    setAllOptimistic,
    refetchMessages
  );

  useEffect(() => {
    if (!sessionId || sessionId === "new") return;

    const pendingPrompt = sessionStorage.getItem(`pending_prompt_${sessionId}`);
    if (pendingPrompt) {
      sessionStorage.removeItem(`pending_prompt_${sessionId}`);
      sendMessage(pendingPrompt, sessionId);
    }
  }, [sessionId, sendMessage]);

  useEffect(() => {
    if (!sessionId || sessionId === "new") return;

    let mounted = true;
    const fetchLatestDraft = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        const token = authSession?.access_token;
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/patient/${sessionId}/drafts`,
          { headers }
        );
        if (res.ok && mounted) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const d = data[0];
            const parsed: ClinicalDraft =
              typeof d.content === "string" ? JSON.parse(d.content) : d.content;
            setLatestDraft(parsed);
          }
        }
      } catch (err: unknown) {
        console.error("Failed to fetch draft:", err);
      }
    };
    fetchLatestDraft();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  const allMessages = [...messages, ...optimisticMessages];

  const openArtifact = (draftOrId?: ClinicalDraft | string) => {
    if (typeof draftOrId === "object" && draftOrId !== null) {
      setLatestDraft(draftOrId);
    }
    if (typeof window !== "undefined" && window.innerWidth <= MOBILE_MAX_WIDTH) {
      setIsArtifactDialogOpen(true);
    } else {
      setRightPanelOpen(true);
    }
  };

  const isUploadingOrProcessing =
    pendingUpload?.status === "uploading" ||
    pendingUpload?.status === "processing" ||
    isAgentRunning;

  const handleSend = async (text: string) => {
    if (isUploadingOrProcessing || isSending) return;
    if (text.trim().startsWith("/summarize")) {
      await sendMessage(text, sessionId);
      await executeAgentRun(sessionId, activeDocumentId);
    } else {
      await sendMessage(text, sessionId);
    }
  };

  const handleInitialSend = async (text: string) => {
    if (isNew) {
      try {
        const newSess = await createSessionAction({
          title: text.slice(0, 40),
          patientName: "Patient " + new Date().toLocaleDateString(),
        });

        if (newSess?.id) {
          sessionStorage.setItem(`pending_prompt_${newSess.id}`, text);
          router.push(`/chat/${newSess.id}`);
        }
      } catch (e: unknown) {
        console.error("Failed to initialize session:", e);
      }
    } else {
      await handleSend(text);
    }
  };

  const handleUpload = async (file: File) => {
    await upload(file);
  };

  const attachedNames = [
    ...(ocrResult?.fileName ? [ocrResult.fileName] : []),
    ...(pendingUpload?.fileName ? [pendingUpload.fileName] : []),
  ];

  if (
    (isNew || (allMessages.length === 0 && !messagesLoading)) &&
    !isUploadingOrProcessing &&
    !ocrResult
  ) {
    return (
      <VStack ref={rootRef} style={rootStyle}>
        <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center p-4">
          <ChatLandingAstryx
            onSend={handleInitialSend}
            onUpload={handleUpload}
            disabled={isSending || isUploadingOrProcessing}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
        </div>
      </VStack>
    );
  }

  return (
    <VStack ref={rootRef} style={rootStyle}>
      <style>{AI_CHAT_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <HStack height="100%">
              <VStack style={chatColumnStyle}>
                <ChatLayout
                  density="spacious"
                  style={chatLayoutStyle}
                  composer={
                    <ChatComposerAstryx
                      onSend={handleSend}
                      onUpload={handleUpload}
                      disabled={isUploadingOrProcessing || isSending}
                      isSending={isSending}
                      selectedProvider={selectedProvider}
                      onProviderChange={setSelectedProvider}
                      attachedFiles={attachedNames}
                    />
                  }
                >
                  <ChatMessageList>
                    <ChatSystemMessage variant="divider">
                      Patient Session
                    </ChatSystemMessage>

                    {allMessages.map((m, i) => (
                      <ChatMessageItemAstryx
                        key={m.id ?? i}
                        message={m}
                        onOpenArtifact={openArtifact}
                      />
                    ))}

                    {isUploadingOrProcessing && (
                      <ChatMessage sender="assistant">
                        <ChatToolCalls
                          defaultIsExpanded
                          calls={[
                            {
                              name:
                                pendingUpload?.status === "uploading"
                                  ? "upload"
                                  : pendingUpload?.stage === "embedding"
                                  ? "vector-embeddings"
                                  : isAgentRunning
                                  ? "clinical-agent"
                                  : "mistral-ocr",
                              target: pendingUpload?.fileName || ocrResult?.fileName || "Clinical Document",
                              status: "running",
                              duration: "in progress",
                            },
                          ]}
                        />
                      </ChatMessage>
                    )}
                  </ChatMessageList>
                </ChatLayout>
              </VStack>

              {isRightPanelOpen && (
                <div
                  role="separator"
                  tabIndex={0}
                  aria-orientation="vertical"
                  onMouseDown={handleResizeStart}
                  className="ai-chat-resize-handle w-1.5 hover:w-2 hover:bg-primary/40 active:bg-primary transition-all cursor-col-resize shrink-0 bg-border/60 relative flex items-center justify-center group select-none"
                  title="Drag to resize panel"
                >
                  <div className="w-0.5 h-6 rounded bg-muted-foreground/30 group-hover:bg-primary" />
                </div>
              )}

              {isRightPanelOpen && (
                <Card
                  variant="transparent"
                  height="100%"
                  className="ai-chat-artifact-panel"
                  style={artifactPanelWidthVar(panelSize)}
                >
                  <ArtifactPanelAstryx
                    sessionId={sessionId}
                    draft={latestDraft}
                    ocrResult={ocrResult}
                    onClose={() => setRightPanelOpen(false)}
                    onSelectDraft={(draft) => setLatestDraft(draft)}
                  />
                </Card>
              )}
            </HStack>
          </LayoutContent>
        }
      />

      <Dialog
        isOpen={isArtifactDialogOpen}
        onOpenChange={setIsArtifactDialogOpen}
        purpose="info"
        variant="fullscreen"
      >
        <Layout
          header={
            <DialogHeader
              title={latestDraft?.diagnoses?.principal_diagnosis || ocrResult?.fileName || "Discharge Summary"}
              hasDivider
              onOpenChange={setIsArtifactDialogOpen}
            />
          }
          content={
            <LayoutContent padding={0}>
              <ArtifactPanelAstryx
                sessionId={sessionId}
                draft={latestDraft}
                ocrResult={ocrResult}
                onClose={() => setIsArtifactDialogOpen(false)}
                onSelectDraft={(draft) => setLatestDraft(draft)}
              />
            </LayoutContent>
          }
        />
      </Dialog>
    </VStack>
  );
}
