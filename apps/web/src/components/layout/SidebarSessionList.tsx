"use client";

import Link from "next/link";
import { MessageSquare, MoreHorizontal, Pin, Trash2, Edit3, FolderPlus } from "lucide-react";
import type { AppSession, Folder } from "@/types/app";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SidebarSessionListProps {
  sessions: AppSession[];
  folders: Folder[];
  activeSessionId?: string;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onRename: (session: AppSession) => void;
  onDelete: (session: AppSession) => void;
  onMoveToFolder: (sessionId: string, folderId: string | null) => void;
}

export default function SidebarSessionList({
  sessions,
  folders,
  activeSessionId,
  onTogglePin,
  onRename,
  onDelete,
  onMoveToFolder,
}: SidebarSessionListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {sessions.map((session) => {
        const isActive = activeSessionId === session.id;
        return (
          <div
            key={session.id}
            className={cn(
              "group relative flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Link
              href={`/chat/${session.id}`}
              className="flex items-center gap-2 min-w-0 flex-1 py-0.5"
            >
              <MessageSquare className="size-3.5 shrink-0 opacity-70" />
              <span className="truncate">{session.title || "Untitled case"}</span>
            </Link>

            {session.is_pinned && (
              <Pin className="size-3 text-primary shrink-0 rotate-45 group-hover:hidden" />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1">
                <DropdownMenuItem
                  onClick={() => onTogglePin(session.id, !session.is_pinned)}
                  className="text-xs cursor-pointer"
                >
                  <Pin className="size-3.5 mr-2" />
                  <span>{session.is_pinned ? "Unpin session" : "Pin session"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRename(session)}
                  className="text-xs cursor-pointer"
                >
                  <Edit3 className="size-3.5 mr-2" />
                  <span>Rename</span>
                </DropdownMenuItem>
                {folders.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-xs">
                      <FolderPlus className="size-3.5 mr-2" />
                      <span>Move to folder</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-40 p-1">
                      {folders.map((f) => (
                        <DropdownMenuItem
                          key={f.id}
                          onClick={() => onMoveToFolder(session.id, f.id)}
                          className="text-xs cursor-pointer"
                        >
                          <span>{f.name}</span>
                        </DropdownMenuItem>
                      ))}
                      {session.folder_id && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onMoveToFolder(session.id, null)}
                            className="text-xs text-muted-foreground cursor-pointer"
                          >
                            <span>Remove from folder</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(session)}
                  className="text-xs text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-3.5 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}
