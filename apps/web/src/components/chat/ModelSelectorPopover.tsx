"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Check, Lock, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MODEL_REGISTRY,
  PROVIDER_ORDER,
  PROVIDER_META,
  type ModelInfo,
} from "@/lib/modelsRegistry";

interface ModelSelectorPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModelId: string;
  onSelectModel: (model: ModelInfo) => void;
  configuredProviders: Set<string>;
}

export default function ModelSelectorPopover({
  isOpen,
  onClose,
  selectedModelId,
  onSelectModel,
  configuredProviders,
}: ModelSelectorPopoverProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const filteredModels = useMemo(() => {
    return MODEL_REGISTRY.filter((model) => {
      const matchesProvider =
        selectedProvider === "all" || model.provider === selectedProvider;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        model.name.toLowerCase().includes(q) ||
        model.id.toLowerCase().includes(q) ||
        model.provider.toLowerCase().includes(q) ||
        (model.description && model.description.toLowerCase().includes(q));
      return matchesProvider && matchesSearch;
    });
  }, [selectedProvider, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full left-0 mb-2 w-[380px] sm:w-[440px] max-h-[460px] rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
    >
      {/* Search Header */}
      <div className="p-2.5 border-b border-gray-100 bg-gray-50/80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-7 py-2 text-xs text-gray-900 placeholder:text-gray-400 transition-colors outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Icon Rail + Model List */}
      <div className="flex flex-1 min-h-0 h-[360px]">
        {/* Left Provider Rail */}
        <div className="w-12 bg-gray-50/90 border-r border-gray-100 flex flex-col items-center py-2 gap-1 shrink-0 overflow-y-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedProvider("all")}
            title="All Models"
            className={cn(
              "size-8 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              selectedProvider === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:bg-gray-200/60 hover:text-gray-900"
            )}
          >
            <Star className="size-4" />
          </button>

          <div className="w-5 h-px bg-gray-200 my-1" />

          {PROVIDER_ORDER.map((provider) => {
            const meta = PROVIDER_META[provider];
            if (!meta) return null;
            const isSelected = selectedProvider === provider;
            return (
              <button
                key={provider}
                type="button"
                onClick={() => setSelectedProvider(provider)}
                title={meta.name}
                className={cn(
                  "size-8 rounded-xl flex items-center justify-center cursor-pointer relative",
                  isSelected
                    ? "bg-white shadow-xs border border-gray-200"
                    : "bg-transparent hover:bg-gray-200/60"
                )}
              >
                <Image
                  src={meta.icon}
                  alt={meta.name}
                  width={18}
                  height={18}
                  className="size-4.5 object-contain"
                  unoptimized
                />
              </button>
            );
          })}
        </div>

        {/* Right Model List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar bg-white">
          {filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-xs text-muted-foreground">No models found</p>
            </div>
          ) : (
            filteredModels.map((model) => {
              const isSelected = selectedModelId === model.id;
              const isConfigured =
                !!model.isDefault || configuredProviders.has(model.provider);
              const meta = PROVIDER_META[model.provider];

              return (
                <button
                  key={`${model.provider}-${model.id}`}
                  type="button"
                  onClick={() => {
                    onSelectModel(model);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer border",
                    isSelected
                      ? "bg-blue-50/70 border-blue-200 text-blue-950 font-medium"
                      : "bg-gray-50/50 hover:bg-gray-100/70 border-gray-100 text-gray-800"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-6 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-center shrink-0">
                      {meta && (
                        <Image
                          src={meta.icon}
                          alt=""
                          width={14}
                          height={14}
                          className="size-3.5 object-contain"
                          unoptimized
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs truncate leading-tight text-gray-900">
                          {model.name}
                        </span>
                        {model.tag && (
                          <span className="text-[9px] px-1 py-0 rounded bg-blue-50 text-blue-600 border border-blue-200/80 font-medium">
                            {model.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                        {model.description || meta?.name || model.provider}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isConfigured && (
                      <span title="API Key required in Settings" className="text-amber-500">
                        <Lock className="size-3" />
                      </span>
                    )}
                    {isSelected && <Check className="size-3.5 text-blue-600 stroke-[2.5]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between text-[11px] text-gray-500">
        <span>{filteredModels.length} models</span>
        <Link
          href="/settings"
          onClick={onClose}
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
        >
          Manage API Keys &rarr;
        </Link>
      </div>
    </div>
  );
}
