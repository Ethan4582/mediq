"use client";

import { useRef, useState, useCallback, useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Layout, LayoutContent, VStack, HStack } from "@astryxdesign/core/Layout";
import { ChatLayout, ChatMessageList, ChatMessage, ChatSystemMessage, ChatToolCalls } from "@astryxdesign/core/Chat";
import ChatComposerAstryx from "./ChatComposerAstryx";
import ChatMessageItemAstryx from "./ChatMessageItemAstryx";
import ChatEmptyState from "./ChatEmptyState";
import ChatArtifactDrawer from "./ChatArtifactDrawer";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { useClinicalAgent } from "@/hooks/useClinicalAgent";
import { useSessionStore } from "@/stores/sessionStore";
import { createSessionAction } from "@/actions/sessions";
import type { Message, ClinicalDraft } from "@/types/app";

const rootStyle: CSSProperties = { flex: 1, width: "100%", height: "100%", position: "relative", overflow: "hidden" };
const chatColStyle: CSSProperties = { flex: 1, minWidth: 0, height: "100%" };
const MOBILE_MAX_WIDTH = 768;
const AI_CHAT_CSS = `@media (max-width: 768px) { .ai-chat-resize-handle { display: none; } .ai-chat-artifact-panel { display: none; width: 100%; flex-shrink: 1; } }`;

export default function ChatPanelAstryx({ sessionId }: { sessionId: string }) {
  const isNew = sessionId === "new";
  useSession(isNew ? "" : sessionId);
  const { messages, loading: messagesLoading, refetch: refetchMessages } = useMessages(isNew ? "" : sessionId);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const router = useRouter();

  const setAllOptimistic = useCallback((updater: (prev: Message[]) => Message[]) => {
    setOptimisticMessages(updater);
  }, []);

  const selectedProvider = useSessionStore((state) => state.selectedProvider);
  const setSelectedProvider = useSessionStore((state) => state.setSelectedProvider);
  const isRightPanelOpen = useSessionStore((state) => state.isRightPanelOpen);
  const setRightPanelOpen = useSessionStore((state) => state.setRightPanelOpen);

  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);
  const [panelSize, setPanelSize] = useState(520);
  const isDraggingRef = useRef(false);
  const rootRef = useRef<HTMLElement>(null);

  const handleArtifactOpen = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth <= MOBILE_MAX_WIDTH) {
      setIsArtifactDialogOpen(true);
    } else {
      setRightPanelOpen(true);
    }
  }, [setRightPanelOpen]);

  const {
    activeDocumentId,
    setActiveDocumentId,
    isAgentRunning,
    latestDraft,
    setLatestDraft,
    executeAgentRun,
  } = useClinicalAgent({
    sessionId,
    selectedProvider,
    refetchMessages,
    onDraftReady: handleArtifactOpen,
  });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !rootRef.current) return;
      const rootRect = rootRef.current.getBoundingClientRect();
      const newWidth = rootRect.right - moveEvent.clientX;
      if (newWidth >= 340 && newWidth <= 800) setPanelSize(newWidth);
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

  const { upload, pendingUpload, ocrResult } = useDocumentUpload(isNew ? "" : sessionId, (sessId, docId) => {
    setActiveDocumentId(docId);
    handleArtifactOpen();
    if (sessId && sessId !== "new") {
      executeAgentRun(sessId, docId);
      if (isNew) router.push(`/chat/${sessId}`);
    }
  });

  const { sendMessage, isSending } = useChat(messages, setAllOptimistic, refetchMessages);

  useEffect(() => {
    if (!sessionId || sessionId === "new") return;
    const pendingPrompt = sessionStorage.getItem(`pending_prompt_${sessionId}`);
    if (pendingPrompt) {
      sessionStorage.removeItem(`pending_prompt_${sessionId}`);
      sendMessage(pendingPrompt, sessionId);
    }
  }, [sessionId, sendMessage]);

  const allMessages = [...messages, ...optimisticMessages];
  const isUploadingOrProcessing =
    pendingUpload?.status === "uploading" || pendingUpload?.status === "processing" || isAgentRunning;

  const openArtifact = (draftOrId?: ClinicalDraft | string) => {
    if (typeof draftOrId === "object" && draftOrId !== null) setLatestDraft(draftOrId);
    handleArtifactOpen();
  };

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
      } catch (e) {
        console.error("Failed to initialize session:", e);
      }
    } else {
      await handleSend(text);
    }
  };

  const attachedNames = [
    ...(ocrResult?.fileName ? [ocrResult.fileName] : []),
    ...(pendingUpload?.fileName ? [pendingUpload.fileName] : []),
  ];

  return (
    <VStack ref={rootRef} style={rootStyle}>
      <style>{AI_CHAT_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <HStack height="100%">
              <VStack style={chatColStyle}>
                <ChatLayout
                  density="spacious"
                  style={{ height: "100%" }}
                  composer={
                    <ChatComposerAstryx
                      onSend={isNew ? handleInitialSend : handleSend}
                      onUpload={upload}
                      disabled={isUploadingOrProcessing || isSending}
                      isSending={isSending}
                      selectedProvider={selectedProvider}
                      onProviderChange={setSelectedProvider}
                      attachedFiles={attachedNames}
                    />
                  }
                >
                  <ChatMessageList>
                    {allMessages.length > 0 && <ChatSystemMessage variant="divider">Patient Session</ChatSystemMessage>}
                    {allMessages.length === 0 && !messagesLoading && !isUploadingOrProcessing && <ChatEmptyState />}
                    {allMessages.map((m, i) => (
                      <ChatMessageItemAstryx key={m.id ?? i} message={m} onOpenArtifact={openArtifact} />
                    ))}
                    {isUploadingOrProcessing && (
                      <ChatMessage sender="assistant">
                        <ChatToolCalls
                          defaultIsExpanded
                          calls={[{
                            name: pendingUpload?.status === "uploading" ? "upload"
                              : pendingUpload?.stage === "embedding" ? "vector-embeddings"
                              : isAgentRunning ? "clinical-agent" : "mistral-ocr",
                            target: pendingUpload?.fileName || ocrResult?.fileName || "Clinical Document",
                            status: "running",
                            duration: "in progress",
                          }]}
                        />
                      </ChatMessage>
                    )}
                  </ChatMessageList>
                </ChatLayout>
              </VStack>

              <ChatArtifactDrawer
                isOpen={isRightPanelOpen}
                panelSize={panelSize}
                onResizeStart={handleResizeStart}
                sessionId={sessionId}
                draft={latestDraft}
                ocrResult={ocrResult}
                onClose={() => setRightPanelOpen(false)}
                onSelectDraft={(draft) => setLatestDraft(draft)}
                isDialogOpen={isArtifactDialogOpen}
                onDialogChange={setIsArtifactDialogOpen}
              />
            </HStack>
          </LayoutContent>
        }
      />
    </VStack>
  );
}
