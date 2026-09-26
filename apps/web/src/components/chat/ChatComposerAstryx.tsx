"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, ArrowUp, ChevronDown, Check, X, Loader2 } from "lucide-react";

export const CHAT_MODELS = [
  { id: "gemini", name: "Gemini 1.5 Pro", icon: "/gemini.svg", provider: "Google" },
  { id: "openai", name: "GPT-4o", icon: "/openai.svg", provider: "OpenAI" },
  { id: "anthropic", name: "Claude 3.5 Sonnet", icon: "/anthropic.svg", provider: "Anthropic" },
  { id: "mistral", name: "Mistral Large", icon: "/mistral.svg", provider: "Mistral" },
  { id: "groq", name: "Llama 3.3 70B", icon: "/groq.svg", provider: "Groq" },
] as const;

export type ChatModelId = (typeof CHAT_MODELS)[number]["id"];

interface ChatComposerAstryxProps {
  onSend: (text: string) => void;
  onUpload?: (file: File) => void;
  disabled?: boolean;
  isSending?: boolean;
  selectedProvider?: string | null;
  onProviderChange?: (provider: string) => void;
  attachedFiles?: string[];
  onRemoveAttachment?: (filename: string) => void;
}

export default function ChatComposerAstryx({
  onSend,
  onUpload,
  disabled = false,
  isSending = false,
  selectedProvider,
  onProviderChange,
  attachedFiles = [],
  onRemoveAttachment,
}: ChatComposerAstryxProps) {
  const [inputText, setInputText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel =
    CHAT_MODELS.find((m) => m.id === selectedProvider) || CHAT_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (disabled || isSending) return;
    const trimmed = inputText.trim();
    if (trimmed) {
      onSend(trimmed);
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-[860px] mx-auto px-4 pb-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col rounded-2xl border border-gray-200/90 bg-white/95 backdrop-blur-xl p-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50">
        {/* Attached files drawer */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2 mb-2 border-b border-gray-100">
            {attachedFiles.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
              >
                <span className="truncate max-w-[200px]">{name}</span>
                {onRemoveAttachment && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(name)}
                    className="hover:text-blue-900 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Text input area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            disabled
              ? "Processing clinical document..."
              : "Ask questions about this patient's medical records or type clinical requests..."
          }
          className="w-full resize-none outline-none text-[14.5px] bg-transparent min-h-[44px] max-h-[160px] py-1 px-1 text-gray-900 placeholder-gray-400 font-normal leading-relaxed disabled:opacity-60"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
              title="Attach clinical document"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Attach</span>
            </button>

            {/* Model selector dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={disabled}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 transition-all cursor-pointer disabled:opacity-50"
              >
                <img
                  src={activeModel.icon}
                  alt={activeModel.name}
                  className="w-3.5 h-3.5 object-contain"
                />
                <span className="font-medium text-gray-800">{activeModel.name}</span>
                <ChevronDown
                  className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50 overflow-hidden">
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Select AI Model
                  </div>
                  {CHAT_MODELS.map((m) => {
                    const isSelected = activeModel.id === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onProviderChange?.(m.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          isSelected ? "bg-blue-50/70 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.icon}
                            alt={m.name}
                            className="w-4 h-4 object-contain shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium leading-tight">{m.name}</span>
                            <span className="text-[10px] text-gray-400">{m.provider}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !inputText.trim() || isSending}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              inputText.trim() && !disabled && !isSending
                ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm hover:scale-105 active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            title="Send message"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
