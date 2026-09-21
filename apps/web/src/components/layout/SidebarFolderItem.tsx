"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderClosed, FolderOpen, MessageSquare, ChevronRight } from "lucide-react";
import type { AppSession, Folder } from "@/types/app";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarFolderItemProps {
  folder: Folder;
  sessions: AppSession[];
  activeSessionId?: string;
  onRenameSession: (session: AppSession) => void;
  onDeleteSession: (session: AppSession) => void;
}

export default function SidebarFolderItem({
  folder,
  sessions,
  activeSessionId,
}: SidebarFolderItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const folderSessions = sessions.filter((s) => s.folder_id === folder.id);

  return (
    <div className="flex flex-col gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start gap-2 h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronRight
          className={cn("size-3 transition-transform duration-200", isOpen && "rotate-90")}
        />
        {isOpen ? <FolderOpen className="size-3.5 text-primary" /> : <FolderClosed className="size-3.5" />}
        <span className="truncate flex-1 text-left">{folder.name}</span>
        <span className="text-[10px] text-muted-foreground/70">{folderSessions.length}</span>
      </Button>

      {isOpen && (
        <div className="flex flex-col gap-0.5 pl-4 ml-2 border-l border-border/50">
          {folderSessions.map((session) => (
            <Link
              key={session.id}
              href={`/chat/${session.id}`}
              className={cn(
                "group flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors",
                activeSessionId === session.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MessageSquare className="size-3.5 shrink-0 opacity-70" />
                <span className="truncate">{session.title || "Untitled case"}</span>
              </div>
            </Link>
          ))}
          {folderSessions.length === 0 && (
            <span className="text-[11px] text-muted-foreground/60 px-2 py-1 italic">
              Empty folder
            </span>
          )}
        </div>
      )}
    </div>
  );
}
