"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Search, PanelLeftClose, PanelLeft, Pin } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useSessionStore } from "@/stores/sessionStore";
import type { AppSession, Folder } from "@/types/app";
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
    renameFolder,
    deleteFolder,
  } = useSessions();

  const { isSidebarOpen, toggleSidebar } = useSessionStore();
  const [search, setSearch] = useState("");
  const [renameTarget, setRenameTarget] = useState<AppSession | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AppSession | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [createFolderValue, setCreateFolderValue] = useState("");

  const [folderRenameTarget, setFolderRenameTarget] = useState<Folder | null>(null);
  const [folderRenameValue, setFolderRenameValue] = useState("");
  const [folderDeleteTarget, setFolderDeleteTarget] = useState<Folder | null>(null);

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

  const handleFolderRenameConfirm = async () => {
    if (folderRenameTarget && folderRenameValue.trim()) {
      await renameFolder(folderRenameTarget.id, folderRenameValue.trim());
      setFolderRenameTarget(null);
    }
  };

  const handleFolderDeleteConfirm = async () => {
    if (folderDeleteTarget) {
      await deleteFolder(folderDeleteTarget.id);
      setFolderDeleteTarget(null);
    }
  };

  const filteredSessions = (sessions || []).filter((s) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return s.title?.toLowerCase().includes(query) || s.patient_name?.toLowerCase().includes(query);
  });

  const pinnedSessions = filteredSessions.filter((s) => s.is_pinned);
  const recentSessions = filteredSessions.filter((s) => !s.is_pinned);

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground select-none overflow-hidden">
      <div className="flex items-center justify-between p-2.5 border-b border-sidebar-border/60 shrink-0">
        {isSidebarOpen ? (
          <>
            <Link href="/" className="flex items-center gap-2 px-1 font-semibold text-sm">
              <Image src="/logo.png" alt="MediQ" width={20} height={20} style={{ width: "20px", height: "auto" }} className="object-contain shrink-0" priority />
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
          <Link
            href="/"
            className="size-8 mx-auto flex items-center justify-center hover:opacity-85 transition-opacity rounded-lg"
            title="MediQ Home"
          >
            <Image
              src="/logo.png"
              alt="MediQ"
              width={22}
              height={22}
              style={{ width: "22px", height: "auto" }}
              className="object-contain shrink-0"
              priority
            />
          </Link>
        )}
      </div>

      {isSidebarOpen ? (
        <div className="flex flex-col flex-1 min-h-0 px-2.5 py-3 gap-2.5 overflow-hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/chat/new")}
            className="w-full justify-start gap-2 h-8 text-xs font-medium bg-sidebar-accent/40 hover:bg-sidebar-accent border-sidebar-border text-sidebar-foreground shadow-xs rounded-lg transition-all cursor-pointer"
          >
            <Plus className="size-3.5 text-primary shrink-0" />
            <span>New Patient Session</span>
          </Button>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="h-8 pl-8 text-xs bg-sidebar-accent/30 border-sidebar-border rounded-lg placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-1">
            {pinnedSessions.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <Pin className="size-3 text-primary rotate-45" />
                  <span>Pinned</span>
                </div>
                <SidebarSessionList
                  sessions={pinnedSessions}
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
            )}

            {(folders || []).length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <Image src="/folder.svg" alt="" width={12} height={12} className="size-3 opacity-70" />
                    <span>Folders</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateFolderOpen(true)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                    title="New folder"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
                {(folders || []).map((folder) => (
                  <SidebarFolderItem
                    key={folder.id}
                    folder={folder}
                    sessions={filteredSessions}
                    activeSessionId={activeSessionId}
                    onRenameFolder={(f) => {
                      setFolderRenameTarget(f);
                      setFolderRenameValue(f.name);
                    }}
                    onDeleteFolder={(f) => setFolderDeleteTarget(f)}
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
              {(folders.length > 0 || pinnedSessions.length > 0) && (
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <Image src="/clock.svg" alt="" width={12} height={12} className="size-3 opacity-70" />
                  <span>Recent Consultations</span>
                </div>
              )}
              <SidebarSessionList
                sessions={recentSessions}
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
        <div className="flex-1 flex flex-col items-center py-2.5 gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
            title="Expand sidebar (Ctrl+B)"
          >
            <PanelLeft className="size-4" />
          </Button>
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

      <SidebarUserMenu user={user} isCollapsed={!isSidebarOpen} />

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
        folderRenameTarget={folderRenameTarget}
        folderRenameValue={folderRenameValue}
        setFolderRenameValue={setFolderRenameValue}
        onCloseFolderRename={() => setFolderRenameTarget(null)}
        onConfirmFolderRename={handleFolderRenameConfirm}
        folderDeleteTarget={folderDeleteTarget}
        onCloseFolderDelete={() => setFolderDeleteTarget(null)}
        onConfirmFolderDelete={handleFolderDeleteConfirm}
      />
    </aside>
  );
}
