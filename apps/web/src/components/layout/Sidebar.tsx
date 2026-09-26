"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Search, PanelLeftClose, PanelLeft } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useSessionStore } from "@/stores/sessionStore";
import type { AppSession } from "@/types/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SidebarSessionList from "./SidebarSessionList";
import SidebarFolderItem from "./SidebarFolderItem";
import SidebarUserMenu from "./SidebarUserMenu";
import SidebarDialogs from "./SidebarDialogs";

export default function Sidebar({
  user,
}: {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSessionId = pathname?.startsWith("/chat/") ? pathname.split("/")[2] : undefined;

  const {
    sessions,
    folders,
    renameSession,
    deleteSession,
    togglePin,
    moveSessionToFolder,
    createFolder,
  } = useSessions();

  const { isSidebarOpen, toggleSidebar } = useSessionStore();
  const [search, setSearch] = useState("");
  const [renameTarget, setRenameTarget] = useState<AppSession | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AppSession | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [createFolderValue, setCreateFolderValue] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const handleRenameConfirm = async () => {
    if (renameTarget && renameValue.trim()) {
      await renameSession(renameTarget.id, renameValue.trim());
      setRenameTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteSession(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleCreateFolderConfirm = async () => {
    if (createFolderValue.trim()) {
      await createFolder(createFolderValue.trim());
      setCreateFolderValue("");
      setIsCreateFolderOpen(false);
    }
  };

  const filteredSessions = (sessions || []).filter((s) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return s.title?.toLowerCase().includes(query) || s.patient_name?.toLowerCase().includes(query);
  });

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-2.5 border-b border-sidebar-border/60 shrink-0">
        {isSidebarOpen ? (
          <>
            <Link href="/" className="flex items-center gap-2 px-1 font-semibold text-sm">
              <Image src="/logo.png" alt="MediQ" width={20} height={20} className="w-5 h-5 object-contain shrink-0" priority />
              <span className="font-semibold text-sm tracking-tight text-foreground">MediQ</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="size-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
              title="Collapse sidebar (Ctrl+B)"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="size-8 mx-auto text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
            title="Expand sidebar (Ctrl+B)"
          >
            <PanelLeft className="size-4" />
          </Button>
        )}
      </div>

      {isSidebarOpen ? (
        <div className="flex flex-col flex-1 min-h-0 px-2.5 py-3 gap-2.5 overflow-hidden">
          {/* Compact New Session Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/chat/new")}
            className="w-full justify-start gap-2 h-8 text-xs font-medium bg-sidebar-accent/40 hover:bg-sidebar-accent border-sidebar-border text-sidebar-foreground shadow-xs rounded-lg transition-all cursor-pointer"
          >
            <Plus className="size-3.5 text-primary shrink-0" />
            <span>New Patient Session</span>
          </Button>

          {/* Full-width Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="h-8 pl-8 text-xs bg-sidebar-accent/30 border-sidebar-border rounded-lg placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-1">
            {(folders || []).length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground px-2 uppercase tracking-wider">
                  Folders
                </span>
                {(folders || []).map((folder) => (
                  <SidebarFolderItem
                    key={folder.id}
                    folder={folder}
                    sessions={filteredSessions}
                    activeSessionId={activeSessionId}
                    onRenameSession={(s) => {
                      setRenameTarget(s);
                      setRenameValue(s.title || "");
                    }}
                    onDeleteSession={(s) => setDeleteTarget(s)}
                  />
                ))}
              </div>
            )}

            <div className="space-y-1">
              {folders.length > 0 && (
                <span className="text-[10px] font-semibold text-muted-foreground px-2 uppercase tracking-wider">
                  Recent Consultations
                </span>
              )}
              <SidebarSessionList
                sessions={filteredSessions}
                activeSessionId={activeSessionId}
                folders={folders}
                onRename={(session: AppSession) => {
                  setRenameTarget(session);
                  setRenameValue(session.title || "");
                }}
                onDelete={(session: AppSession) => setDeleteTarget(session)}
                onTogglePin={togglePin}
                onMoveToFolder={moveSessionToFolder}
                onCreateFolder={() => setIsCreateFolderOpen(true)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center py-3 gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/chat/new")}
            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
            title="New Patient Session"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      )}

      {/* User Footer */}
      <SidebarUserMenu user={user} isCollapsed={!isSidebarOpen} />

      {/* Dialogs */}
      <SidebarDialogs
        renameTarget={renameTarget}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        onCloseRename={() => setRenameTarget(null)}
        onConfirmRename={handleRenameConfirm}
        deleteTarget={deleteTarget}
        onCloseDelete={() => setDeleteTarget(null)}
        onConfirmDelete={handleDeleteConfirm}
        isCreateFolderOpen={isCreateFolderOpen}
        createFolderValue={createFolderValue}
        setCreateFolderValue={setCreateFolderValue}
        onCloseCreateFolder={() => {
          setIsCreateFolderOpen(false);
          setCreateFolderValue("");
        }}
        onConfirmCreateFolder={handleCreateFolderConfirm}
      />
    </aside>
  );
}
