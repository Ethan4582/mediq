"use client";

import { Menu, FileText, Sparkles } from "lucide-react";
import { useSessionStore } from "@/stores/sessionStore";
import type { AppSession } from "@/types/app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TopBar({
  session,
  loading,
}: {
  session: AppSession | null;
  loading: boolean;
}) {
  const { isSidebarOpen, toggleSidebar, isRightPanelOpen, setRightPanelOpen, setFileViewMode } =
    useSessionStore();

  const title = session?.title || session?.patient_name || (loading ? "Loading session..." : "New Session");

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-4" />
          </Button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate max-w-md">
            {title}
          </h1>
          {session?.status === "done" && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
              Processed
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant={isRightPanelOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            if (isRightPanelOpen) {
              setRightPanelOpen(false);
            } else {
              setFileViewMode(false);
              setRightPanelOpen(true);
            }
          }}
          className="gap-1.5 text-xs h-8"
        >
          <FileText className="size-3.5" />
          <span className="hidden sm:inline">Records & Summary</span>
        </Button>
      </div>
    </header>
  );
}
