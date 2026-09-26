"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
    CHAT_MODELS.find((m) => m.id === selectedProvider) ?? CHAT_MODELS[3];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputText.trim() || disabled || isSending) return;
    onSend(inputText.trim());
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
      e.target.value = "";
    }
  };

  return (
    <div className="w-full max-w-[840px] mx-auto px-4 pb-4">
      {/* Attached files indicator badge list */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachedFiles.map((name) => (
            <div
              key={name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/80 border border-blue-200/60 text-blue-900 rounded-lg text-xs font-medium shadow-xs"
            >
              <span className="max-w-[200px] truncate">{name}</span>
              {onRemoveAttachment && (
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(name)}
                  className="hover:text-blue-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-2xl border border-gray-200/90 bg-white shadow-sm focus-within:border-blue-500/80 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
        {/* Hidden file input for native attachment handling */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input area */}
        <div className="px-4 pt-3.5 pb-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask anything about patient records, diagnoses, or type /summarize..."
            className="w-full resize-none bg-transparent text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none max-h-[200px] min-h-[24px] leading-relaxed"
          />
        </div>

        {/* Bottom controls bar */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-gray-100/60 mt-1">
          <div className="flex items-center gap-2">
            {/* Attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Attach clinical document or scan"
            >
              <Paperclip className="w-3.5 h-3.5 text-gray-500" />
              <span>Attach</span>
            </button>

            {/* Model selector dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={disabled}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 transition-all cursor-pointer disabled:opacity-50"
              >
                <Image
                  src={activeModel.icon}
                  alt={activeModel.name}
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 object-contain"
                  unoptimized
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
                          <Image
                            src={m.icon}
                            alt={m.name}
                            width={16}
                            height={16}
                            className="w-4 h-4 object-contain shrink-0"
                            unoptimized
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

          {/* Send / Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputText.trim() || disabled || isSending}
            className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer ${
              inputText.trim() && !disabled && !isSending
                ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700 hover:scale-105 active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            title="Send message"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
