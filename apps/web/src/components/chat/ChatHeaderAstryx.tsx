"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PanelLeft } from "lucide-react";
import type { AppSession, ClinicalDraft } from "@/types/app";

interface ChatHeaderAstryxProps {
  session?: AppSession | null;
  sessionId: string;
  isNew: boolean;
  sessionLoading?: boolean;
  latestDraft?: ClinicalDraft | null;
  isUploadingOrProcessing?: boolean;
  isRightPanelOpen: boolean;
  artifactTab: string;
  onToggleSidebar: () => void;
  onOpenArtifact: (tab: string) => void;
  onToggleRightPanel: (tab: string) => void;
  onOpenShareDialog: () => void;
  documentCount: number;
}

export default function ChatHeaderAstryx({
  session,
  isNew,
  sessionLoading,
  latestDraft,
  isUploadingOrProcessing,
  isRightPanelOpen,
  artifactTab,
  onToggleSidebar,
  onOpenArtifact,
  onToggleRightPanel,
  onOpenShareDialog,
  documentCount,
}: ChatHeaderAstryxProps) {
  const sessionTitle =
    session?.title ||
    session?.patient_name ||
    (isNew ? "New Consultation" : sessionLoading ? "Loading session..." : "Clinical Session");

  return (
    <header className="w-full flex items-center justify-between px-4 py-2 border-b border-border/80 bg-background/95 backdrop-blur-xs shrink-0 z-10">
      <div className="flex items-center gap-2.5 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="size-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-lg md:hidden"
          title="Toggle sidebar (Ctrl+B)"
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {sessionTitle}
          </h2>
          {latestDraft ? (
            <Badge
              variant="secondary"
              onClick={() => onOpenArtifact("summary")}
              className="hidden sm:inline-flex bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0 cursor-pointer hover:bg-emerald-500/20"
            >
              <Sparkles className="size-2.5 mr-1" />
              Draft Ready
            </Badge>
          ) : isUploadingOrProcessing ? (
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] px-1.5 py-0 animate-pulse"
            >
              Processing
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenShareDialog}
          className="gap-1.5 text-xs h-8 px-2.5 rounded-lg border-border hover:bg-muted/80 cursor-pointer"
        >
          <Image src="/share.svg" alt="Share" width={14} height={14} className="size-3.5 opacity-80" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        <Button
          variant={isRightPanelOpen && artifactTab === "content" ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleRightPanel("content")}
          className="gap-1.5 text-xs h-8 px-2.5 rounded-lg font-medium shadow-xs cursor-pointer"
        >
          <Image src="/file_1.svg" alt="" width={14} height={14} className="size-3.5 opacity-80" />
          <span className="hidden sm:inline">Project content</span>
          <Badge
            variant={isRightPanelOpen && artifactTab === "content" ? "outline" : "secondary"}
            className="text-[9px] px-1 py-0 h-4 min-w-4 flex items-center justify-center font-normal ml-0.5"
          >
            {documentCount}
          </Badge>
        </Button>
      </div>
    </header>
  );
}
