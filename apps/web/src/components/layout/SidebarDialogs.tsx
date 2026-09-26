"use client";

import type { AppSession } from "@/types/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface SidebarDialogsProps {
  renameTarget: AppSession | null;
  renameValue: string;
  setRenameValue: (val: string) => void;
  onCloseRename: () => void;
  onConfirmRename: () => void;

  deleteTarget: AppSession | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;

  isCreateFolderOpen: boolean;
  createFolderValue: string;
  setCreateFolderValue: (val: string) => void;
  onCloseCreateFolder: () => void;
  onConfirmCreateFolder: () => void;
}

export default function SidebarDialogs({
  renameTarget,
  renameValue,
  setRenameValue,
  onCloseRename,
  onConfirmRename,
  deleteTarget,
  onCloseDelete,
  onConfirmDelete,
  isCreateFolderOpen,
  createFolderValue,
  setCreateFolderValue,
  onCloseCreateFolder,
  onConfirmCreateFolder,
}: SidebarDialogsProps) {
  return (
    <>
      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && onCloseRename()}>
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
              onKeyDown={(e) => e.key === "Enter" && onConfirmRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onCloseRename}>Cancel</Button>
            <Button onClick={onConfirmRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && onCloseDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title || "this session"}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={(open) => !open && onCloseCreateFolder()}>
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
              onKeyDown={(e) => e.key === "Enter" && onConfirmCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onCloseCreateFolder}>Cancel</Button>
            <Button onClick={onConfirmCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
