"use client";

import { useSessionStore } from "@/stores/sessionStore";
import { FileText, FileSearch, Edit3, X, MoreHorizontal, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import FilesTab from "./FilesTab";
import SummaryTab from "./SummaryTab";

interface RightPanelProps {
  draft?: any;
  ocrResult?: any;
}

export default function RightPanel({ draft, ocrResult }: RightPanelProps) {
  const { isRightPanelOpen, rightPanelTab, setRightPanelTab, setRightPanelOpen, isFileViewMode, setFileViewMode } = useSessionStore();

  const handleClose = () => {
    setRightPanelOpen(false);
    setFileViewMode(false);
  };

  const handleCopy = () => {
    const textToCopy = draft ? JSON.stringify(draft, null, 2) : ocrResult?.rawText || "";
    navigator.clipboard.writeText(textToCopy);
    toast.success("Copied to clipboard", { description: "Summary has been copied to your clipboard." });
  };

  const handleDownloadPdf = () => {
    const rawText = ocrResult?.rawText || JSON.stringify(draft, null, 2) || "";
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast.error("Popup blocked", { description: "Please allow popups to download PDF." });
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Discharge Summary</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #111827; max-width: 800px; margin: 0 auto; }
            pre { white-space: pre-wrap; font-family: inherit; margin-top: 20px; }
            h2 { color: #2563eb; }
          </style>
        </head>
        <body>
          <h2>Discharge Summary</h2>
          <hr />
          <pre>${rawText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    toast.success("Preparing PDF", { description: "Print dialog has been opened." });
  };

  return (
    <div
      className={`w-full h-full bg-white flex flex-col overflow-hidden transition-transform duration-300 ease-in-out`}
    >
      <div className="shrink-0 border-b border-[var(--border-default)] p-3 flex items-center justify-between bg-white z-10">
        {!isFileViewMode ? (
          <div className="flex items-center gap-2 px-2 text-[var(--text-primary)]">
            <FileText size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-semibold">Files</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2 text-[var(--text-primary)]">
            <FileText size={16} className="text-[#2563eb]" />
            <span className="text-sm font-semibold truncate max-w-[200px]">
              {ocrResult?.fileName || "summary_1"}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          {rightPanelTab === "summary" && (
            <div className="relative group">
              <button className="p-1.5 rounded-md hover:bg-[#f4f6f8] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <MoreHorizontal size={16} />
              </button>
              
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-[var(--border-default)] shadow-md bg-white p-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button 
                  onClick={handleCopy}
                  className="w-full text-left flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#f4f6f8] px-3 py-2 rounded-md transition-colors"
                >
                  <Copy size={14} />
                  <span>Copy</span>
                </button>
                <button 
                  onClick={() => setRightPanelTab("edit")}
                  className="w-full text-left flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#f4f6f8] px-3 py-2 rounded-md transition-colors"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <div className="h-px bg-[var(--border-default)] my-1"></div>
                <button 
                  onClick={handleDownloadPdf}
                  className="w-full text-left flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#f4f6f8] px-3 py-2 rounded-md transition-colors"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-[#f4f6f8] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!isFileViewMode ? (
          <FilesTab ocrResult={ocrResult} />
        ) : (
          <>
            {rightPanelTab === "files" && <FilesTab ocrResult={ocrResult} />}
            {rightPanelTab === "summary" && <SummaryTab draft={draft} ocrResult={ocrResult} />}
            {rightPanelTab === "edit" && (
              <div className="p-6 text-center text-[var(--text-secondary)] mt-10">
                <Edit3 size={32} className="mx-auto mb-3 opacity-30" />
                <p>Editing coming in the next update.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
