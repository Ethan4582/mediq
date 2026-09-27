"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { Paperclip, ArrowUp, ChevronDown, X, Loader2 } from "lucide-react";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import { DEFAULT_MODEL, MODEL_REGISTRY, type ModelInfo } from "@/lib/modelsRegistry";
import ModelSelectorDialog from "./ModelSelectorDialog";

interface ChatComposerAstryxProps {
  onSend: (text: string) => void;
  onUpload?: (file: File) => void;
  disabled?: boolean;
  isSending?: boolean;
  selectedModel?: ModelInfo;
  onModelChange?: (model: ModelInfo) => void;
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
  selectedModel: controlledModel,
  onModelChange,
  selectedProvider,
  onProviderChange,
  attachedFiles = [],
  onRemoveAttachment,
}: ChatComposerAstryxProps) {
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internalModel, setInternalModel] = useState<ModelInfo>(DEFAULT_MODEL);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { keys } = useKeyStatus();

  const configuredProviders = useMemo(() => {
    const set = new Set<string>();
    for (const k of keys) {
      if (k.is_active || k.key_type === "llm") {
        set.add(k.provider);
      }
    }
    return set;
  }, [keys]);

  const activeModel: ModelInfo = useMemo(() => {
    if (controlledModel) return controlledModel;
    if (selectedProvider) {
      const match = MODEL_REGISTRY.find((m) => m.provider === selectedProvider && !m.isDefault);
      if (match) return match;
    }
    return internalModel;
  }, [controlledModel, selectedProvider, internalModel]);

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

  const handleSelectModel = (model: ModelInfo) => {
    setInternalModel(model);
    onModelChange?.(model);
    onProviderChange?.(model.provider);
  };

  return (
    <div className="w-full max-w-[800px] mx-auto pb-4">
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

      <div className="relative rounded-2xl border border-border bg-card shadow-sm focus-within:border-blue-500/80 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
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

        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 rounded-lg transition-colors cursor-pointer border border-border/80 shadow-2xs disabled:opacity-50"
            >
              <Image
                src={activeModel.providerIcon}
                alt={activeModel.name}
                width={14}
                height={14}
                className="w-3.5 h-3.5 object-contain"
                unoptimized
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <span className="max-w-[130px] truncate">{activeModel.name}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

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

      <ModelSelectorDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedModelId={activeModel.id}
        onSelectModel={handleSelectModel}
        configuredProviders={configuredProviders}
      />
    </div>
  );
}
