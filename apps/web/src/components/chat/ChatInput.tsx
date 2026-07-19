"use client";

import { useRef, useEffect, useState } from "react";
import { Paperclip, Send, ChevronDown, Zap, Search, ChevronUp } from "lucide-react";
import Spinner from "@/components/shared/Spinner";
import Image from "next/image";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { keys } = useKeyStatus();
  const llmKeys = keys.filter(k => k.key_type === "llm" && k.is_active);

  const getProviderDefaultModel = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "groq": return "Llama 3.3 70B";
      case "anthropic": return "Claude 3.5 Sonnet";
      case "mistral": return "Mistral Large";
      case "gemini": return "Gemini 2.0 Flash";
      case "openai": return "GPT-4o-mini";
      default: return "";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      className="px-8 pb-0 shrink-0 flex flex-col items-center bg-transparent relative z-10"
    >
      <div className="w-full max-w-[860px]">
        {/* Chat Input Pill */}
        <div
          className={`flex flex-col rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-md transition-all focus-within:ring-1 focus-within:ring-[#2563eb]/30 focus-within:border-[#2563eb]/40 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
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
                <div className="relative group" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={disabled || isUploading}
                    className="flex items-center gap-1.5 cursor-pointer text-xs font-medium bg-transparent border-none py-1.5 pl-2 pr-2 hover:text-[#2563eb] transition-colors disabled:opacity-50"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {selectedProvider && (
                      <img 
                        src={`/${selectedProvider.toLowerCase()}.svg`} 
                        alt={selectedProvider} 
                        className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                        onError={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
                      />
                    )}
                    <span>
                      {selectedProvider ? PROVIDERS[selectedProvider as LLMProvider]?.name || selectedProvider : "Select Model"}
                    </span>
                    {isDropdownOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-[#2563eb] transition-colors" />}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
                      {llmKeys.map(k => (
                        <div
                          key={k.id}
                          onClick={() => {
                            onProviderChange?.(k.provider);
                            setIsDropdownOpen(false);
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                            selectedProvider === k.provider ? "bg-blue-50/50" : "hover:bg-gray-50"
                          }`}
                        >
                          <img 
                            src={`/${k.provider.toLowerCase()}.svg`} 
                            alt={k.provider} 
                            className="w-4 h-4 object-contain shrink-0"
                            onError={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-900 leading-tight">
                              {PROVIDERS[k.provider as LLMProvider]?.name || k.provider}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                              {getProviderDefaultModel(k.provider)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="h-4 w-px bg-gray-300 mx-1 shrink-0 hidden sm:block"></div>

              {/* Toolbar Buttons */}
             
              


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
      </div>
    </div>
  );
}
