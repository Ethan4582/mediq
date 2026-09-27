"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderClosed, FolderOpen, MessageSquare, MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import type { AppSession, Folder } from "@/types/app";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarFolderItemProps {
  folder: Folder;
  sessions?: AppSession[];
  activeSessionId?: string;
  onRenameFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folder: Folder) => void;
  onRenameSession?: (session: AppSession) => void;
  onDeleteSession?: (session: AppSession) => void;
}

export default function SidebarFolderItem({
  folder,
  sessions = [],
  activeSessionId,
  onRenameFolder,
  onDeleteFolder,
}: SidebarFolderItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const folderSessions = (sessions || []).filter((s) => s.folder_id === folder.id);

  return (
    <div className="group/folder flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-1 w-full rounded-lg hover:bg-muted/60 px-1 py-0.5 transition-colors">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 flex-1 min-w-0 h-7 px-1 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer text-left"
        >
          {isOpen ? <FolderOpen className="size-3.5 text-primary shrink-0" /> : <FolderClosed className="size-3.5 shrink-0 text-muted-foreground" />}
          <span className="truncate flex-1">{folder.name}</span>
          <span className="text-[10px] text-muted-foreground/70 shrink-0">{folderSessions.length}</span>
        </button>

        {(onRenameFolder || onDeleteFolder) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 opacity-0 group-hover/folder:opacity-100 p-0 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 p-1">
              {onRenameFolder && (
                <DropdownMenuItem
                  onClick={() => onRenameFolder(folder)}
                  className="text-xs cursor-pointer"
                >
                  <Edit3 className="size-3.5 mr-2" />
                  <span>Rename folder</span>
                </DropdownMenuItem>
              )}
              {onDeleteFolder && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteFolder(folder)}
                    className="text-xs text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-3.5 mr-2" />
                    <span>Delete folder</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isOpen && (
        <div className="flex flex-col gap-0.5 pl-3 ml-2 border-l border-border/50">
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
