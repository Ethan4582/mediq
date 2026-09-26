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
    <div className="w-full max-w-[800px] mx-auto pb-4">
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
      <div className="relative rounded-2xl border border-border bg-card shadow-sm focus-within:border-blue-500/80 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
        {/* Hidden file input for native attachment handling */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask anything about patient records, diagnoses, or type /summarize..."
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed max-h-[200px] min-h-[48px]"
        />

        {/* Composer Controls Footer */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-2">
            {/* Attach Document Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach</span>
            </button>

            {/* Model Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 rounded-lg transition-colors cursor-pointer border border-border/80 shadow-2xs disabled:opacity-50"
              >
                <Image
                  src={activeModel.icon}
                  alt={activeModel.name}
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 object-contain"
                  unoptimized
                />
                <span>{activeModel.name}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>

              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-1.5 w-52 rounded-xl border border-border bg-popover p-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Clinical LLM
                  </div>
                  {CHAT_MODELS.map((model) => {
                    const isSelected = model.id === activeModel.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          onProviderChange?.(model.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={model.icon}
                            alt={model.name}
                            width={16}
                            height={16}
                            className="w-4 h-4 object-contain"
                            unoptimized
                          />
                          <div className="text-left">
                            <p className="leading-none">{model.name}</p>
                            <span className="text-[10px] text-muted-foreground leading-none">
                              {model.provider}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Submit / Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputText.trim() || disabled || isSending}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              inputText.trim() && !disabled && !isSending
                ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            }`}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
