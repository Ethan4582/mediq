"use client";

import { useRef, useEffect, useState } from "react";
import { Paperclip, Send, ChevronDown, Zap, Search } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

import { useKeyStatus } from "@/hooks/useKeyStatus";
import { PROVIDERS } from "@/lib/constants";
import type { LLMProvider } from "@/types/app";

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
    // Automatically select the first available LLM provider if none is selected
    if (llmKeys.length > 0 && !selectedProvider && onProviderChange) {
      onProviderChange(llmKeys[0].provider);
    }
  }, [llmKeys, selectedProvider, onProviderChange]);

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
      className="px-4 pb-8 shrink-0 flex flex-col items-center bg-transparent relative z-10"
    >
      <div className="w-full max-w-[780px]">
        {/* Chat Input Pill */}
        <div
          className={`flex flex-col gap-2 rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl px-4 py-3 shadow-lg transition-all focus-within:ring-2 focus-within:ring-[#2563eb]/20 focus-within:border-[#2563eb]/50 focus-within:bg-white/90 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          {/* Top: Text Input */}
          <div className="flex items-start">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={disabled ? "Processing document…" : "Type your message here..."}
              className="flex-1 resize-none outline-none text-[15px] bg-transparent min-h-[44px] max-h-[160px] py-2 placeholder-gray-400 font-medium"
              style={{ color: "var(--text-primary)" }}
              rows={1}
            />
          </div>

          {/* Bottom: Tools & Actions */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {/* Model Selector */}
              {llmKeys.length > 0 && (
                <div className="relative group">
                  <select
                    value={selectedProvider || ""}
                    onChange={(e) => onProviderChange?.(e.target.value)}
                    className="appearance-none outline-none cursor-pointer text-xs font-medium bg-transparent border-none py-1.5 pl-2 pr-6 hover:text-[#2563eb] transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    disabled={disabled || isUploading}
                  >
                    {llmKeys.map(k => (
                      <option key={k.id} value={k.provider} className="text-gray-900 bg-white">
                        {PROVIDERS[k.provider as LLMProvider]?.name || k.provider}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#2563eb] transition-colors" />
                </div>
              )}

              <div className="h-4 w-px bg-gray-300 mx-1 shrink-0 hidden sm:block"></div>

              {/* Toolbar Buttons */}
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-black/5 hover:text-gray-800 transition-colors shrink-0"
              >
                <Zap size={14} />
                <span className="hidden sm:inline">Instant</span>
              </button>
              
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-black/5 hover:text-gray-800 transition-colors shrink-0"
              >
                <Search size={14} />
                <span className="hidden sm:inline">Search</span>
              </button>

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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-black/5 hover:text-gray-800 transition-colors disabled:opacity-50 shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || disabled}
              >
                {isUploading ? <Spinner className="w-3.5 h-3.5" /> : <Paperclip size={14} />}
                <span className="hidden sm:inline">Attach</span>
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={disabled || !text.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ml-2"
              style={{
                background: text.trim() && !disabled ? "var(--brand-primary)" : "#f3f4f6",
                color: text.trim() && !disabled ? "#ffffff" : "#9ca3af"
              }}
            >
              <Send size={15} className={text.trim() && !disabled ? "mr-[1px] mt-[1px]" : ""} />
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] py-3 text-gray-400 font-medium">
          MediQ can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}
