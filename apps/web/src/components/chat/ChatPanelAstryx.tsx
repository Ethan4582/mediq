"use client";

import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChatLayout, ChatMessageList, ChatMessage, ChatToolCalls, ChatSystemMessage } from "@astryxdesign/core/Chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Share2, Sparkles, PanelLeft } from "lucide-react";
import { useSessionStore } from "@/stores/sessionStore";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { useClinicalAgent } from "@/hooks/useClinicalAgent";
import { createSessionAction } from "@/actions/sessions";
import type { Message, ClinicalDraft, AppSession } from "@/types/app";
import ChatComposerAstryx from "./ChatComposerAstryx";
import ChatMessageItemAstryx from "./ChatMessageItemAstryx";
import ChatArtifactDrawer from "./ChatArtifactDrawer";
import ChatEmptyState from "./ChatEmptyState";
import ShareSessionDialog from "./ShareSessionDialog";

const MOBILE_MAX_WIDTH = 768;

const AI_CHAT_CSS = `
.astryx-chat-layout {
  width: 100% !important;
  flex: 1 1 0% !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}
.astryx-chat-layout .xvueqy4 {
  margin-inline: auto !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.astryx-chat-layout * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
.astryx-chat-layout *::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
`;

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
  const selectedProvider = useSessionStore((state) => state.selectedProvider);
  const setSelectedProvider = useSessionStore((state) => state.setSelectedProvider);
  const isRightPanelOpen = useSessionStore((state) => state.isRightPanelOpen);
  const setRightPanelOpen = useSessionStore((state) => state.setRightPanelOpen);

  const [artifactTab, setArtifactTab] = useState<string>("content");
  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
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
    selectedProvider,
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
      sendMessage(pendingPrompt, sessionId);
    }
  }, [sessionId, sendMessage]);

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
      <style>{AI_CHAT_CSS}</style>
      <div style={chatColStyle} className="flex-1 min-w-0 h-full flex flex-col w-full">
        <header className="w-full flex items-center justify-between px-4 py-2 border-b border-border/80 bg-background/95 backdrop-blur-xs shrink-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="size-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-lg md:hidden"
              title="Toggle sidebar (Ctrl+B)"
            >
              <PanelLeft className="size-4" />
            </Button>
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-85 transition-opacity shrink-0"
              title="MediQ"
            >
              <Image
                src="/logo.png"
                alt="MediQ"
                width={20}
                height={20}
                className="size-5 object-contain shrink-0"
                priority
              />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {sessionTitle}
              </h2>
              {latestDraft ? (
                <Badge
                  variant="secondary"
                  onClick={() => handleArtifactOpen("summary")}
                  className="hidden sm:inline-flex bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0 cursor-pointer hover:bg-emerald-500/20"
                >
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
              className="gap-1.5 text-xs h-8 px-2.5 rounded-lg border-border hover:bg-muted/80 cursor-pointer"
            >
              <Share2 className="size-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
              variant={isRightPanelOpen && artifactTab === "content" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (isRightPanelOpen && artifactTab === "content") {
                  setRightPanelOpen(false);
                } else {
                  setArtifactTab("content");
                  setRightPanelOpen(true);
                }
              }}
              className="gap-1.5 text-xs h-8 px-2.5 rounded-lg font-medium shadow-xs cursor-pointer"
            >
              <FileText className={`size-3.5 ${isRightPanelOpen && artifactTab === "content" ? "text-primary-foreground" : "text-blue-500"}`} />
              <span className="hidden sm:inline">Project content</span>
              <Badge
                variant={isRightPanelOpen && artifactTab === "content" ? "outline" : "secondary"}
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
