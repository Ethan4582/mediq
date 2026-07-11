"use client";

import { useRef, useEffect, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

import { useKeyStatus } from "@/hooks/useKeyStatus";
import { PROVIDERS } from "@/lib/constants";
import type { LLMProvider } from "@/types/app";

const STAGE_LABELS: Record<string, string> = {
  uploading: "Uploading document to secure storage…",
  ocr:       "Reading and extracting document content…",
  chunking:  "Indexing content for search…",
  embedding: "Generating semantic embeddings…",
  ready:     "Document ready",
};

export default function ChatInput({
  onSend,
  onUpload,
  disabled,
  pendingUpload,
  selectedProvider,
  onProviderChange,
}: {
  onSend: (text: string) => void;
  onUpload?: (file: File) => void;
  disabled?: boolean;
  pendingUpload?: { stage: string; status: string } | null;
  selectedProvider?: string | null;
  onProviderChange?: (provider: string) => void;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { keys } = useKeyStatus();
  const llmKeys = keys.filter(k => k.key_type === "llm" && k.is_active);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  useEffect(() => {
    if (llmKeys.length === 1 && !selectedProvider && onProviderChange) {
      onProviderChange(llmKeys[0].provider);
    }
  }, [llmKeys.length, selectedProvider, onProviderChange]);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isUploading = pendingUpload?.status === "uploading" || pendingUpload?.status === "processing";

  return (
    <div
      className="px-4 pb-8 shrink-0 flex flex-col items-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-[780px]">

        <div
          className={`flex flex-col gap-2 rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 shadow-card transition-all focus-within:ring-2 focus-within:ring-[#2563eb]/20 focus-within:border-[#2563eb] ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files?.[0] && onUpload) {
                  onUpload(e.target.files[0]);
                }
                e.target.value = "";
              }}
            />
            <button
              className="transition-colors shrink-0 mb-0.5 hover:text-blue-500 disabled:opacity-50 disabled:hover:text-inherit"
              style={{ color: "var(--text-muted)" }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                 <Spinner className="w-[18px] h-[18px]" />
              ) : (
                 <Paperclip size={18} />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={disabled ? "Processing document…" : "Ask about this case…"}
              className="flex-1 resize-none outline-none text-sm bg-transparent min-h-[22px] max-h-[120px]"
              style={{ color: "var(--text-primary)" }}
              rows={1}
            />

            <button
              onClick={handleSend}
              disabled={disabled || !text.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 transition-colors disabled:opacity-40"
              style={{ background: "var(--brand-primary)" }}
            >
              <Send size={15} />
            </button>
          </div>
          
          {llmKeys.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedProvider || ""}
                onChange={(e) => onProviderChange?.(e.target.value)}
                className="text-xs bg-transparent font-medium outline-none cursor-pointer transition-colors px-1 py-0.5 rounded"
                style={{ color: "var(--brand-primary)", WebkitAppearance: "none", MozAppearance: "none" }}
                disabled={disabled || isUploading}
              >
                <option value="" disabled>Select AI Model</option>
                {llmKeys.map(k => (
                  <option key={k.id} value={k.provider}>
                    {PROVIDERS[k.provider as LLMProvider]?.name || k.provider}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <p className="text-center text-xs py-2 mt-1" style={{ color: "var(--text-muted)" }}>
          MediQ can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}
