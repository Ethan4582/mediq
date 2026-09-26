"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search, FolderPlus, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useSessionStore } from "@/stores/sessionStore";
import type { AppSession } from "@/types/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import SidebarSessionList from "./SidebarSessionList";
import SidebarFolderItem from "./SidebarFolderItem";
import SidebarUserMenu from "./SidebarUserMenu";

export default function Sidebar({
  user,
}: {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };
}) {
  const pathname = usePathname();
  const activeSessionId = pathname?.startsWith("/chat/") ? pathname.split("/")[2] : undefined;

  const {
    sessions,
    folders,
    renameSession,
    deleteSession,
    togglePin,
    moveToFolder,
    createFolder,
  } = useSessions();
  const { isSidebarOpen, toggleSidebar } = useSessionStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [sessionToRename, setSessionToRename] = useState<AppSession | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<AppSession | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [createFolderValue, setCreateFolderValue] = useState("");

  const filteredSessions = sessions.filter((s) =>
    (s.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinnedSessions = filteredSessions.filter((s) => s.is_pinned);
  const unpinnedRootSessions = filteredSessions.filter((s) => !s.is_pinned && !s.folder_id);

  const handleRenameConfirm = async () => {
    if (sessionToRename && renameValue.trim()) {
      await renameSession(sessionToRename.id, renameValue.trim());
      setSessionToRename(null);
    }
  };

  const handleCreateFolderConfirm = async () => {
    if (createFolderValue.trim()) {
      await createFolder(createFolderValue.trim());
      setCreateFolderValue("");
      setIsCreateFolderOpen(false);
    }
  };

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border/60">
        <Link href="/" className="flex items-center gap-2 px-1 font-semibold text-sm">
          <img src="/logo.png" alt="MediQ" className="w-[22px] h-[22px] object-contain shrink-0" />
          {isSidebarOpen && <span>MediQ</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="size-7 text-muted-foreground hover:text-foreground"
        >
          {isSidebarOpen ? <ChevronsLeft className="size-4" /> : <ChevronsRight className="size-4" />}
        </Button>
      </div>

      {isSidebarOpen && (
        <div className="flex flex-col flex-1 min-h-0 px-2 py-3 gap-3 overflow-hidden">
          {/* Actions */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button asChild className="w-full justify-start gap-2 h-9 font-medium text-xs shadow-sm">
              <Link href="/chat/new">
                <Plus className="size-4" />
                <span>New Session</span>
              </Link>
            </Button>
            <div className="flex items-center gap-1">
              <div className="relative flex-1">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cases..."
                  className="h-8 pl-8 text-xs bg-muted/40"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateFolderOpen(true)}
                title="Create Folder"
                className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <FolderPlus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
            {pinnedSessions.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase px-2 tracking-wider">
                  Pinned
                </span>
                <SidebarSessionList
                  sessions={pinnedSessions}
                  folders={folders}
                  activeSessionId={activeSessionId}
                  onTogglePin={togglePin}
                  onRename={(s) => { setSessionToRename(s); setRenameValue(s.title || ""); }}
                  onDelete={setSessionToDelete}
                  onMoveToFolder={moveToFolder}
                />
              </div>
            )}

            {folders.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase px-2 tracking-wider">
                  Folders
                </span>
                {folders.map((folder) => (
                  <SidebarFolderItem
                    key={folder.id}
                    folder={folder}
                    sessions={filteredSessions}
                    activeSessionId={activeSessionId}
                    onRenameSession={(s) => { setSessionToRename(s); setRenameValue(s.title || ""); }}
                    onDeleteSession={setSessionToDelete}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase px-2 tracking-wider">
                Recents
              </span>
              <SidebarSessionList
                sessions={unpinnedRootSessions}
                folders={folders}
                activeSessionId={activeSessionId}
                onTogglePin={togglePin}
                onRename={(s) => { setSessionToRename(s); setRenameValue(s.title || ""); }}
                onDelete={setSessionToDelete}
                onMoveToFolder={moveToFolder}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Footer */}
      <div className="p-2 border-t border-sidebar-border/60 mt-auto">
        <SidebarUserMenu user={user} isCollapsed={!isSidebarOpen} />
      </div>

      {/* Dialogs */}
      <Dialog open={!!sessionToRename} onOpenChange={(open) => !open && setSessionToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Session title"
            onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionToRename(null)}>Cancel</Button>
            <Button onClick={handleRenameConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <Input
            value={createFolderValue}
            onChange={(e) => setCreateFolderValue(e.target.value)}
            placeholder="Folder name"
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolderConfirm()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolderConfirm}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session and all its data? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (sessionToDelete) deleteSession(sessionToDelete.id);
                setSessionToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
