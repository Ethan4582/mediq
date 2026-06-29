"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  ChevronsLeft,
  Search,
  Key,
  User,
  ChevronDown,
  BarChart2,
  MoreHorizontal,
  Pin,
  Trash,
  FolderOpen,
  FolderClosed,
  Share,
  FolderPlus,
  Edit2,
  MessageSquare
} from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useSessionStore } from "@/stores/sessionStore";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/shared/Avatar";
import SkeletonLine from "@/components/shared/SkeletonLine";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AppSession, Folder } from "@/types/app";

export default function Sidebar({
  user,
}: {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };
}) {
  const { 
    sessions, 
    folders,
    loading, 
    renameSession, 
    deleteSession, 
    togglePin, 
    moveToFolder, 
    createFolder 
  } = useSessions();
  const { isSidebarOpen, toggleSidebar } = useSessionStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const [sessionToRename, setSessionToRename] = useState<AppSession | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<AppSession | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [createFolderValue, setCreateFolderValue] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "User";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const filteredSessions = useMemo(() => {
    if (!searchQuery) return sessions;
    const lower = searchQuery.toLowerCase();
    return sessions.filter((s) => {
      const name = s.patient_name ?? s.title ?? "Unnamed case";
      return name.toLowerCase().includes(lower);
    });
  }, [sessions, searchQuery]);

  const pinnedSessions = filteredSessions.filter((s) => s.is_pinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.is_pinned);
  
  // Group by folder
  const folderGroups = useMemo(() => {
    const map = new Map<string, AppSession[]>();
    folders.forEach(f => map.set(f.id, []));
    unpinnedSessions.forEach(s => {
      if (s.folder_id && map.has(s.folder_id)) {
        map.get(s.folder_id)!.push(s);
      }
    });
    return map;
  }, [unpinnedSessions, folders]);

  const recentSessions = unpinnedSessions.filter(s => !s.folder_id);

  const SessionItem = ({ session }: { session: AppSession }) => {
    const isActive = pathname === `/chat/${session.id}`;
    const name = session.patient_name ?? session.title ?? "Unnamed case";

    const handleRename = () => {
      setRenameValue(name);
      setSessionToRename(session);
    };

    const handleDelete = () => {
      setSessionToDelete(session);
    };

    const handleShare = () => {
      toast.info("Share feature coming soon!");
    };

    const handleCreateFolder = () => {
      setCreateFolderValue("");
      setIsCreateFolderOpen(true);
    };

    return (
      <div
        className={`group relative flex items-center gap-2.5 w-full rounded-xl transition-colors text-left hover:bg-[#f4f6f8] ${isActive ? 'bg-[#eff6ff]' : ''}`}
      >
        <Link
          href={`/chat/${session.id}`}
          className="flex-1 min-w-0 py-2.5 px-3 flex items-center gap-2"
        >
          <MessageSquare size={14} className={`shrink-0 ${isActive ? 'text-[#2563eb]' : 'text-muted-foreground'}`} />
          <p
            className={`text-sm font-medium truncate ${isActive ? 'text-[#2563eb]' : 'text-[var(--text-primary)]'}`}
          >
            {name}
          </p>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-all">
              <MoreHorizontal size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleRename}>
              <Edit2 className="mr-2 h-4 w-4" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              togglePin(session.id, !session.is_pinned);
              toast.success(session.is_pinned ? "Unpinned session" : "Pinned session");
            }}>
              <Pin className="mr-2 h-4 w-4" />
              <span>{session.is_pinned ? "Unpin" : "Pin"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              <span>Share</span>
            </DropdownMenuItem>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderOpen className="mr-2 h-4 w-4" />
                <span>Move to Folder</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => {
                  moveToFolder(session.id, null);
                  toast.success("Removed from folder");
                }}>
                  No Folder
                </DropdownMenuItem>
                {folders.map(f => (
                  <DropdownMenuItem key={f.id} onClick={() => {
                    moveToFolder(session.id, f.id);
                    toast.success(`Moved to ${f.name}`);
                  }}>
                    {f.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCreateFolder}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  <span>Create new...</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div
      className="w-[240px] h-full flex flex-col shrink-0 rounded-2xl shadow-panel bg-white px-3 py-4 gap-1"
    >
      {/* Logo Row */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div>
            <img src="/logo.png" alt="MediQ" width={34} height={34} />
          </div>
          <span className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
            MediQ
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronsLeft size={16} />
        </button>
      </div>

      {/* New Session Button */}
      <div className="px-1 pb-2">
        <Link
          href="/chat/new"
          className="flex items-center justify-center gap-2 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors"
          style={{ background: "var(--brand-primary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--brand-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--brand-primary)")
          }
        >
          <Plus size={14} />
          New Session
        </Link>
      </div>

      {/* Search Bar */}
      <div className="px-1 pb-2">
        <div
          className="relative flex items-center gap-2 rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
          style={{ background: "var(--bg-hover)" }}
        >
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions"
            className="flex-1 text-sm bg-transparent outline-none pr-8"
            style={{ color: "var(--text-primary)" }}
          />
          <span
            className="absolute right-2 text-[10px] px-1.5 py-0.5 rounded border font-mono pointer-events-none"
            style={{ color: "var(--text-muted)", borderColor: "var(--border-default)" }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Middle: Nav Links */}
      <div className="px-1 space-y-1">
        <Link
          href="/api-keys"
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <Key size={15} />
          API Keys
        </Link>
        <Link
          href="/analytics"
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <BarChart2 size={15} />
          Analytics
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <User size={15} />
          Profile
        </Link>
      </div>

      <hr className="mx-1 my-1" style={{ borderColor: "var(--border-default)" }} />

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2.5">
              <div
                className="w-4 h-4 rounded animate-pulse shrink-0"
                style={{ background: "var(--bg-hover)" }}
              />
              <div className="flex-1 space-y-1.5">
                <SkeletonLine className="w-3/4 h-3" />
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-4">
            {/* Pinned Sessions */}
            {pinnedSessions.length > 0 && (
              <div className="space-y-0.5">
                <span className="px-3 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Pin size={12} />
                  Pinned
                </span>
                {pinnedSessions.map((s) => (
                  <SessionItem key={s.id} session={s} />
                ))}
              </div>
            )}

            {/* Folders */}
            {folders.map(f => {
              const folderSesh = folderGroups.get(f.id) || [];
              if (folderSesh.length === 0) return null;
              const isCollapsed = collapsedFolders[f.id];
              return (
                <div key={f.id} className="space-y-0.5">
                  <button 
                    onClick={() => toggleFolder(f.id)}
                    className="w-full text-left px-3 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    {isCollapsed ? <FolderClosed size={12} /> : <FolderOpen size={12} />}
                    {f.name}
                  </button>
                  {!isCollapsed && folderSesh.map((s) => (
                    <SessionItem key={s.id} session={s} />
                  ))}
                </div>
              );
            })}

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <div className="space-y-0.5">
                <span className="px-3 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Recent
                </span>
                {recentSessions.map((s) => (
                  <SessionItem key={s.id} session={s} />
                ))}
              </div>
            )}

            {filteredSessions.length === 0 && (
              <p className="text-center text-sm text-muted-foreground pt-4">
                No sessions found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom User Row */}
      <div
        className="mt-auto px-3 py-3 border-t relative"
        style={{ borderColor: "var(--border-default)" }}
      >
        <button
          className="flex items-center gap-2.5 w-full rounded-lg px-2 py-2 hover:bg-[var(--bg-hover)] transition-colors"
          onClick={() => setShowUserMenu((v) => !v)}
        >
          <Avatar
            name={displayName}
            src={user?.user_metadata?.avatar_url}
            size="md"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {user?.email}
            </p>
          </div>
          <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        </button>

        {showUserMenu && (
          <div
            className="absolute bottom-full left-2 right-2 mb-1 rounded-lg border shadow-md overflow-hidden"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border-default)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-hover)] transition-colors text-red-600"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!sessionToRename} onOpenChange={(o) => !o && setSessionToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={renameValue} 
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Session name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionToRename(null)}>Cancel</Button>
            <Button onClick={() => {
              if (sessionToRename && renameValue && renameValue !== (sessionToRename.patient_name ?? sessionToRename.title)) {
                renameSession(sessionToRename.id, renameValue);
                toast.success("Session renamed");
              }
              setSessionToRename(null);
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={(o) => !o && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your session and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (sessionToDelete) {
                  const isActive = pathname === `/chat/${sessionToDelete.id}`;
                  deleteSession(sessionToDelete.id);
                  toast.success("Session deleted");
                  if (isActive) router.push("/chat/new");
                }
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="Folder name" 
              value={createFolderValue} 
              onChange={(e) => setCreateFolderValue(e.target.value)} 
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (createFolderValue.trim()) {
                createFolder(createFolderValue.trim());
                toast.success("Folder created");
                setIsCreateFolderOpen(false);
              }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
