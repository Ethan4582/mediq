"use client";

import ChatPanelAstryx from "./ChatPanelAstryx";

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
  return <ChatPanelAstryx sessionId={sessionId} />;
}
