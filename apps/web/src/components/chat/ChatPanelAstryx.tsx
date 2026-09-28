"use client";

import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ChatLayout, ChatMessageList, ChatMessage, ChatToolCalls, ChatSystemMessage } from "@astryxdesign/core/Chat";
import { useSessionStore } from "@/stores/sessionStore";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { useClinicalAgent } from "@/hooks/useClinicalAgent";
import { createSessionAction } from "@/actions/sessions";
import { DEFAULT_MODEL, type ModelInfo } from "@/lib/modelsRegistry";
import type { Message, ClinicalDraft, AppSession } from "@/types/app";
import ChatComposerAstryx from "./ChatComposerAstryx";
import ChatMessageItemAstryx from "./ChatMessageItemAstryx";
import ChatArtifactDrawer from "./ChatArtifactDrawer";
import ChatEmptyState from "./ChatEmptyState";
import ShareSessionDialog from "./ShareSessionDialog";
import ChatHeaderAstryx from "./ChatHeaderAstryx";

const MOBILE_MAX_WIDTH = 768;

interface ChatPanelAstryxProps {
  sessionId: string;
  session?: AppSession | null;
  messages?: Message[];
  sessionLoading?: boolean;
  messagesLoading?: boolean;
  refetchMessages?: () => Promise<void>;
}

export default function ChatPanelAstryx({
  sessionId,
  session: sessionProp,
  messages: messagesProp,
  sessionLoading: sessionLoadingProp,
  messagesLoading: messagesLoadingProp,
  refetchMessages: refetchMessagesProp,
}: ChatPanelAstryxProps) {
  const router = useRouter();
  const isNew = sessionId === "new";

  const { session: fetchedSession, loading: fetchedSessionLoading } = useSession(isNew ? "" : sessionId);
  const { messages: fetchedMessages, loading: fetchedMessagesLoading, refetch: fetchedRefetch } = useMessages(isNew ? "" : sessionId);

  const session = sessionProp !== undefined ? sessionProp : fetchedSession;
  const sessionLoading = sessionLoadingProp !== undefined ? sessionLoadingProp : fetchedSessionLoading;
  const messages = messagesProp !== undefined ? messagesProp : fetchedMessages;
  const messagesLoading = messagesLoadingProp !== undefined ? messagesLoadingProp : fetchedMessagesLoading;
  const refetchMessages = refetchMessagesProp || fetchedRefetch;

  const [optimisticMessages, setAllOptimistic] = useState<Message[]>([]);
  const toggleSidebar = useSessionStore((state) => state.toggleSidebar);
  const isRightPanelOpen = useSessionStore((state) => state.isRightPanelOpen);
  const setRightPanelOpen = useSessionStore((state) => state.setRightPanelOpen);

  const [artifactTab, setArtifactTab] = useState<string>("content");
  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(DEFAULT_MODEL);
  const [panelSize, setPanelSize] = useState(520);
  const isDraggingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const handleArtifactOpen = useCallback((targetTab = "summary") => {
    setArtifactTab(targetTab);
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
    selectedProvider: selectedModel.provider,
    refetchMessages,
    onDraftReady: () => handleArtifactOpen("summary"),
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
    handleArtifactOpen("files");
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
      sendMessage(pendingPrompt, sessionId, selectedModel.id, selectedModel.provider);
    }
  }, [sessionId, sendMessage, selectedModel]);

  const allMessages = [...messages, ...optimisticMessages];
  const isUploadingOrProcessing =
    pendingUpload?.status === "uploading" || pendingUpload?.status === "processing" || isAgentRunning;

  const openArtifact = (draftOrId?: ClinicalDraft | string) => {
    if (typeof draftOrId === "object" && draftOrId !== null) setLatestDraft(draftOrId);
    handleArtifactOpen("summary");
  };

  const handleSend = async (text: string) => {
    if (isUploadingOrProcessing || isSending) return;
    if (text.trim().startsWith("/summarize")) {
      await sendMessage(text, sessionId, selectedModel.id, selectedModel.provider);
      await executeAgentRun(sessionId, activeDocumentId);
    } else {
      await sendMessage(text, sessionId, selectedModel.id, selectedModel.provider);
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

  const rootStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  };

  const chatColStyle: CSSProperties = {
    position: "relative",
    height: "100%",
    minWidth: 0,
    transition: "flex-basis 160ms cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <div ref={rootRef} style={rootStyle} className="flex flex-row w-full h-full">
      <div style={chatColStyle} className="flex-1 min-w-0 h-full flex flex-col w-full">
        <ChatHeaderAstryx
          session={session}
          sessionId={sessionId}
          isNew={isNew}
          sessionLoading={sessionLoading}
          latestDraft={latestDraft}
          isUploadingOrProcessing={isUploadingOrProcessing}
          isRightPanelOpen={isRightPanelOpen}
          artifactTab={artifactTab}
          onToggleSidebar={toggleSidebar}
          onOpenArtifact={handleArtifactOpen}
          onToggleRightPanel={(tab) => {
            if (isRightPanelOpen && artifactTab === tab) {
              setRightPanelOpen(false);
            } else {
              setArtifactTab(tab);
              setRightPanelOpen(true);
            }
          }}
          onOpenShareDialog={() => setIsShareDialogOpen(true)}
          documentCount={ocrResult ? 1 : latestDraft ? 1 : 0}
        />

        <ChatLayout
          density="spacious"
          style={{ height: "calc(100% - 45px)", width: "100%" }}
          composer={
            <ChatComposerAstryx
              onSend={isNew ? handleInitialSend : handleSend}
              onUpload={upload}
              disabled={isUploadingOrProcessing || isSending}
              isSending={isSending}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              attachedFiles={attachedNames}
            />
          }
        >
          <ChatMessageList className="w-full max-w-[800px] mx-auto py-4">
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
      </div>

      <ChatArtifactDrawer
        isOpen={isRightPanelOpen}
        onClose={() => setRightPanelOpen(false)}
        panelSize={panelSize}
        onResizeStart={handleResizeStart}
        sessionId={sessionId}
        draft={latestDraft}
        ocrResult={ocrResult}
        onSelectDraft={setLatestDraft}
        isDialogOpen={isArtifactDialogOpen}
        onDialogChange={setIsArtifactDialogOpen}
        onUpload={upload}
        isUploading={isUploadingOrProcessing}
        activeTab={artifactTab}
        onTabChange={setArtifactTab}
      />

      <ShareSessionDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        session={session}
        draft={latestDraft}
        documentCount={ocrResult ? 1 : 0}
      />
    </div>
  );
}
