"use client";

import type { CSSProperties, MouseEvent } from "react";
import { Card } from "@astryxdesign/core/Card";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import ArtifactPanelAstryx from "./ArtifactPanelAstryx";
import type { ClinicalDraft, OcrResultData } from "@/types/app";

interface ChatArtifactDrawerProps {
  isOpen: boolean;
  panelSize: number;
  onResizeStart: (e: MouseEvent) => void;
  sessionId: string;
  draft: ClinicalDraft | null;
  ocrResult?: OcrResultData | null;
  onClose: () => void;
  onSelectDraft: (draft: ClinicalDraft) => void;
  isDialogOpen: boolean;
  onDialogChange: (open: boolean) => void;
}

function panelStyle(size: number): CSSProperties {
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

export default function ChatArtifactDrawer({
  isOpen,
  panelSize,
  onResizeStart,
  sessionId,
  draft,
  ocrResult,
  onClose,
  onSelectDraft,
  isDialogOpen,
  onDialogChange,
}: ChatArtifactDrawerProps) {
  return (
    <>
      {isOpen && (
        <div
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          onMouseDown={onResizeStart}
          className="ai-chat-resize-handle w-1.5 hover:w-2 hover:bg-primary/40 active:bg-primary transition-all cursor-col-resize shrink-0 bg-border/60 relative flex items-center justify-center group select-none"
          title="Drag to resize panel"
        >
          <div className="w-0.5 h-6 rounded bg-muted-foreground/30 group-hover:bg-primary" />
        </div>
      )}

      {isOpen && (
        <Card
          variant="transparent"
          height="100%"
          className="ai-chat-artifact-panel"
          style={panelStyle(panelSize)}
        >
          <ArtifactPanelAstryx
            sessionId={sessionId}
            draft={draft}
            ocrResult={ocrResult}
            onClose={onClose}
            onSelectDraft={onSelectDraft}
          />
        </Card>
      )}

      <Dialog
        isOpen={isDialogOpen}
        onOpenChange={onDialogChange}
        purpose="info"
        variant="fullscreen"
      >
        <Layout
          header={
            <DialogHeader
              title={
                draft?.diagnoses?.principal_diagnosis ||
                ocrResult?.fileName ||
                "Discharge Summary"
              }
              hasDivider
              onOpenChange={onDialogChange}
            />
          }
          content={
            <LayoutContent padding={0}>
              <ArtifactPanelAstryx
                sessionId={sessionId}
                draft={draft}
                ocrResult={ocrResult}
                onClose={() => onDialogChange(false)}
                onSelectDraft={onSelectDraft}
              />
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}
