"use client";

import { useRef, useState, useCallback, useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ChatLayout, ChatMessageList, ChatMessage, ChatSystemMessage, ChatToolCalls } from "@astryxdesign/core/Chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, FileText, Share2, Sparkles } from "lucide-react";
import ChatComposerAstryx from "./ChatComposerAstryx";
import ChatMessageItemAstryx from "./ChatMessageItemAstryx";
import ChatEmptyState from "./ChatEmptyState";
import ChatArtifactDrawer from "./ChatArtifactDrawer";
import ShareSessionDialog from "./ShareSessionDialog";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { useClinicalAgent } from "@/hooks/useClinicalAgent";
import { useSessionStore } from "@/stores/sessionStore";
import { createSessionAction } from "@/actions/sessions";
import type { Message, ClinicalDraft } from "@/types/app";

const rootStyle: CSSProperties = { flex: 1, width: "100%", height: "100%", position: "relative", overflow: "hidden" };
const chatColStyle: CSSProperties = { flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column" };
const MOBILE_MAX_WIDTH = 768;
const AI_CHAT_CSS = `
@media (max-width: 768px) {
  .ai-chat-resize-handle { display: none; }
  .ai-chat-artifact-panel { display: none; width: 100%; flex-shrink: 1; }
}
`;

export default function ChatPanelAstryx({ sessionId }: { sessionId: string }) {
  const isNew = sessionId === "new";
  const { session, loading: sessionLoading } = useSession(isNew ? "" : sessionId);
  const { messages, loading: messagesLoading, refetch: refetchMessages } = useMessages(isNew ? "" : sessionId);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const router = useRouter();

  const setAllOptimistic = useCallback((updater: (prev: Message[]) => Message[]) => {
    setOptimisticMessages(updater);
  }, []);

  const isSidebarOpen = useSessionStore((state) => state.isSidebarOpen);
  const toggleSidebar = useSessionStore((state) => state.toggleSidebar);
  const selectedProvider = useSessionStore((state) => state.selectedProvider);
  const setSelectedProvider = useSessionStore((state) => state.setSelectedProvider);
  const isRightPanelOpen = useSessionStore((state) => state.isRightPanelOpen);
  const setRightPanelOpen = useSessionStore((state) => state.setRightPanelOpen);

  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [panelSize, setPanelSize] = useState(520);
  const isDraggingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const sessionTitle =
    session?.title ||
    session?.patient_name ||
    (isNew ? "New Consultation" : sessionLoading ? "Loading session..." : "Clinical Session");

  return (
    <div ref={rootRef} style={rootStyle} className="flex flex-row">
      <style>{AI_CHAT_CSS}</style>
      <div style={chatColStyle} className="flex-1 min-w-0 h-full flex flex-col items-center">
        <header className="w-full flex items-center justify-between px-4 py-2 border-b border-border/80 bg-background/95 backdrop-blur-xs shrink-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="size-8 text-muted-foreground hover:text-foreground shrink-0"
              >
                <Menu className="size-4" />
              </Button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {sessionTitle}
              </h2>
              {latestDraft ? (
                <Badge variant="secondary" className="hidden sm:inline-flex bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
                  <Sparkles className="size-2.5 mr-1" />
                  Draft Ready
                </Badge>
              ) : isUploadingOrProcessing ? (
                <Badge variant="secondary" className="hidden sm:inline-flex bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] px-1.5 py-0 animate-pulse">
                  Processing
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
              className="gap-1.5 text-xs h-8 px-2.5 rounded-lg border-border hover:bg-muted/80"
            >
              <Share2 className="size-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
              variant={isRightPanelOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setRightPanelOpen(!isRightPanelOpen)}
              className="gap-1.5 text-xs h-8 px-2.5 rounded-lg font-medium shadow-xs"
            >
              <FileText className={`size-3.5 ${isRightPanelOpen ? "text-primary-foreground" : "text-blue-500"}`} />
              <span className="hidden sm:inline">Project content</span>
              <Badge
                variant={isRightPanelOpen ? "outline" : "secondary"}
                className="text-[9px] px-1 py-0 h-4 min-w-4 flex items-center justify-center font-normal ml-0.5"
              >
                {ocrResult ? 1 : latestDraft ? 1 : 0}
              </Badge>
            </Button>
          </div>
        </header>

        <ChatLayout
          density="spacious"
          style={{ height: "calc(100% - 45px)", width: "100%" }}
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
          <ChatMessageList className="w-full max-w-[840px] mx-auto px-4 py-4">
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
        panelSize={panelSize}
        onResizeStart={handleResizeStart}
        sessionId={sessionId}
        draft={latestDraft}
        ocrResult={ocrResult}
        onClose={() => setRightPanelOpen(false)}
        onSelectDraft={(draft) => setLatestDraft(draft)}
        isDialogOpen={isArtifactDialogOpen}
        onDialogChange={setIsArtifactDialogOpen}
        onUpload={upload}
        isUploading={isUploadingOrProcessing}
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
