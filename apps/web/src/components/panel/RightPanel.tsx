"use client";

import { useSessionStore } from "@/stores/sessionStore";
import { FileText, FileSearch, Edit3, X } from "lucide-react";
import FilesTab from "./FilesTab";
import SummaryTab from "./SummaryTab";

interface RightPanelProps {
  draft?: any;
  ocrResult?: any;
}

export default function RightPanel({ draft, ocrResult }: RightPanelProps) {
  const { isRightPanelOpen, rightPanelTab, setRightPanelTab, setRightPanelOpen } = useSessionStore();

  return (
    <div
      className={`fixed right-3 top-3 bottom-3 w-[380px] bg-white rounded-2xl border border-[var(--border-default)] shadow-lg transition-transform duration-300 ease-in-out z-40 flex flex-col overflow-hidden ${
        isRightPanelOpen ? "translate-x-0" : "translate-x-[110%]"
      }`}
    >
      <div className="shrink-0 border-b border-[var(--border-default)] p-3 flex items-center justify-between">
        <div className="flex bg-[#f4f6f8] p-1 rounded-lg gap-1">
          <button
            onClick={() => setRightPanelTab("files")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              rightPanelTab === "files"
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FileText size={14} />
            Files
          </button>
          <button
            onClick={() => setRightPanelTab("summary")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              rightPanelTab === "summary"
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FileSearch size={14} />
            Summary
          </button>
          <button
            disabled
            onClick={() => setRightPanelTab("edit")}
            title="Coming in next update"
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors opacity-50 cursor-not-allowed ${
              rightPanelTab === "edit"
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)]"
            }`}
          >
            <Edit3 size={14} />
            Edit
          </button>
        </div>
        
        <button
          onClick={() => setRightPanelOpen(false)}
          className="p-1.5 rounded-md hover:bg-[#f4f6f8] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rightPanelTab === "files" && <FilesTab ocrResult={ocrResult} />}
        {rightPanelTab === "summary" && <SummaryTab draft={draft} ocrResult={ocrResult} />}
        {rightPanelTab === "edit" && (
          <div className="p-6 text-center text-[var(--text-secondary)] mt-10">
            <Edit3 size={32} className="mx-auto mb-3 opacity-30" />
            <p>Editing coming in the next update.</p>
          </div>
        )}
      </div>
    </div>
  );
}
