"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";

interface AddRawNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadNote: (file: File) => void;
}

export default function AddRawNoteDialog({
  isOpen,
  onOpenChange,
  onUploadNote,
}: AddRawNoteDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please enter clinician note content");
      return;
    }

    setIsSubmitting(true);
    try {
      const fileName = `${(title.trim() || "Clinician_Note").replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;
      const blob = new Blob([content], { type: "text/plain" });
      const file = new File([blob], fileName, { type: "text/plain" });
      onUploadNote(file);
      toast.success("Note added as clinical asset", {
        description: `Ingested ${fileName} for extraction`,
      });
      setTitle("");
      setContent("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to process note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Add Raw Clinical Note</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Paste EHR consultation notes, dictations, or physical exam snippets.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Note Title / Source</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Admission Exam Note, Cardiology Consult"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Clinical Text Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste doctor notes, history of present illness, vital signs, or medication orders here..."
              rows={8}
              className="text-xs font-mono leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !content.trim()}
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Ingest Note</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
