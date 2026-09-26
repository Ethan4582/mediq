"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  const filteredSessions = sessions.filter((s) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(query) ||
      s.patient_name?.toLowerCase().includes(query)
    );
  });

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border/60">
        <Link href="/" className="flex items-center gap-2 px-1 font-semibold text-sm">
          <Image
            src="/logo.png"
            alt="MediQ"
            width={22}
            height={22}
            className="w-[22px] h-[22px] object-contain shrink-0"
            unoptimized
          />
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
          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/chat/new")}
              className="flex-1 justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 h-8 text-xs font-medium"
            >
              <Plus className="size-3.5" />
              New Patient Session
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsCreateFolderOpen(true)}
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
              title="New Folder"
            >
              <FolderPlus className="size-3.5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="h-8 pl-8 text-xs bg-sidebar-accent/50 border-sidebar-border"
            />
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Folders */}
            {folders.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground px-2 uppercase tracking-wider">
                  Folders
                </span>
                {folders.map((folder) => (
                  <SidebarFolderItem
                    key={folder.id}
                    folder={folder}
                    sessions={filteredSessions.filter((s) => s.folder_id === folder.id)}
                    activeSessionId={activeSessionId}
                    onRenameSession={(session) => {
                      setRenameTarget(session);
                      setRenameValue(session.title || "");
                    }}
                    onDeleteSession={setDeleteTarget}
                  />
                ))}
              </div>
            )}

            {/* Sessions (unfiled or filtered) */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground px-2 uppercase tracking-wider">
                Recent Consultations
              </span>
              <SidebarSessionList
                sessions={filteredSessions}
                activeSessionId={activeSessionId}
                folders={folders}
                onRename={(session) => {
                  setRenameTarget(session);
                  setRenameValue(session.title || "");
                }}
                onDelete={setDeleteTarget}
                onTogglePin={togglePin}
                onMoveToFolder={moveSessionToFolder}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Footer */}
      <div className="p-2 border-t border-sidebar-border/60">
        <SidebarUserMenu user={user} isCollapsed={!isSidebarOpen} />
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Session title"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title || "this session"}&quot;? This action cannot be undone and will delete all associated medical documents and drafts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={createFolderValue}
              onChange={(e) => setCreateFolderValue(e.target.value)}
              placeholder="Folder name (e.g. Cardiology, Inpatients)"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolderConfirm()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolderConfirm}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
