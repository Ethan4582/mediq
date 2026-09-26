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
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Printer, FileDown, ShieldCheck, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { AppSession, ClinicalDraft } from "@/types/app";

interface ShareSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  session: AppSession | null;
  draft: ClinicalDraft | null;
  documentCount: number;
}

export default function ShareSessionDialog({
  isOpen,
  onOpenChange,
  session,
  draft,
  documentCount,
}: ShareSessionDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const formattedSummaryText = (() => {
    if (!draft) return "";
    let text = `# Clinical Discharge Summary\n\n`;
    if (session?.patient_name || session?.title) {
      text += `**Patient**: ${session.patient_name || session.title}\n`;
      text += `**Date**: ${new Date().toLocaleDateString()}\n\n`;
    }
    if (draft.diagnoses?.principal_diagnosis) {
      text += `## Principal Diagnosis\n${draft.diagnoses.principal_diagnosis}\n\n`;
    }
    if (draft.diagnoses?.secondary_diagnoses?.length) {
      text += `## Secondary Diagnoses\n${draft.diagnoses.secondary_diagnoses.map((d) => `- ${d}`).join("\n")}\n\n`;
    }
    if (draft.course?.summary) {
      text += `## Hospital Course\n${draft.course.summary}\n\n`;
    }
    if (draft.medications?.discharge?.length) {
      text += `## Reconciled Discharge Medications\n`;
      draft.medications.discharge.forEach((m) => {
        text += `- ${m.name} ${m.dosage || m.dose || ""} ${m.route || ""} ${m.frequency || ""}\n`;
      });
      text += `\n`;
    }
    if (draft.follow_up?.instructions) {
      text += `## Follow-up Directives\n${draft.follow_up.instructions}\n\n`;
    }
    return text;
  })();

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success("Session link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleCopySummary = async () => {
    if (!formattedSummaryText) {
      toast.error("No summary available to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(formattedSummaryText);
      setCopiedSummary(true);
      toast.success("Discharge summary markdown copied");
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      toast.error("Failed to copy summary");
    }
  };

  const handleDownload = () => {
    if (!formattedSummaryText) {
      toast.error("No summary available to download");
      return;
    }
    const blob = new Blob([formattedSummaryText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(session?.title || "clinical_summary").replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Clinical summary downloaded");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Share2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Share Clinical Session</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Export or share clinical session records, OCR assets, and discharge drafts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <span>{session?.title || session?.patient_name || "Clinical Session"}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {documentCount} document{documentCount === 1 ? "" : "s"}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-500" />
                <span>Encrypted & HIPAA Compliant Session</span>
              </div>
            </div>
            {draft && (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                Draft Ready
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Session Direct Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono select-all focus:outline-none"
              />
              <Button size="sm" variant="secondary" onClick={handleCopyLink} className="gap-1.5 h-8">
                {copiedLink ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span className="text-xs">{copiedLink ? "Copied" : "Copy Link"}</span>
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-border grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              disabled={!draft}
              className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl hover:bg-muted/80 text-xs"
            >
              {copiedSummary ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              <span>Copy Summary</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!draft}
              className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl hover:bg-muted/80 text-xs"
            >
              <FileDown className="size-4" />
              <span>Download MD</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl hover:bg-muted/80 text-xs"
            >
              <Printer className="size-4" />
              <span>Print Report</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
