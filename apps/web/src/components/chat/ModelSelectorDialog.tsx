"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Check, Lock, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MODEL_REGISTRY,
  PROVIDER_ORDER,
  PROVIDER_META,
  type ModelInfo,
} from "@/lib/modelsRegistry";

interface ModelSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModelId: string;
  onSelectModel: (model: ModelInfo) => void;
  configuredProviders: Set<string>;
}

export default function ModelSelectorDialog({
  isOpen,
  onOpenChange,
  selectedModelId,
  onSelectModel,
  configuredProviders,
}: ModelSelectorDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useMemo(() => {
    return MODEL_REGISTRY.filter((model) => {
      const matchesProvider =
        selectedProvider === "all" || model.provider === selectedProvider;
      const matchesSearch =
        searchQuery.trim() === "" ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProvider && matchesSearch;
    });
  }, [selectedProvider, searchQuery]);

  const handleSelect = (model: ModelInfo) => {
    onSelectModel(model);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] p-0 overflow-hidden bg-background border border-border shadow-xl rounded-2xl">
        <DialogTitle className="sr-only">Select Model</DialogTitle>
        <DialogDescription className="sr-only">
          Choose a model from your configured providers
        </DialogDescription>

        <div className="flex h-[430px]">
          <div className="w-[52px] bg-muted/40 border-r border-border flex flex-col items-center py-2.5 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedProvider("all")}
              title="All models"
              className={cn(
                "size-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                selectedProvider === "all"
                  ? "bg-background text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <Star className="size-4" />
            </button>
            <div className="w-5 h-px bg-border/80 my-1" />
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
                    "size-8 rounded-lg flex items-center justify-center transition-all cursor-pointer relative",
                    isSelected
                      ? "bg-background shadow-xs border border-border/80"
                      : "opacity-60 hover:opacity-100 hover:bg-background/40"
                  )}
                >
                  <Image
                    src={meta.icon}
                    alt={meta.name}
                    width={18}
                    height={18}
                    className="size-4.5 object-contain"
                  />
                </button>
              );
            })}
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-2.5 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 rounded-lg pl-8 pr-7 py-1 text-xs text-foreground placeholder:text-muted-foreground transition-colors outline-none focus:ring-1 focus:ring-primary/40"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 no-scrollbar">
              {filteredModels.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-xs text-muted-foreground">No models found</p>
                </div>
              ) : (
                filteredModels.map((model) => {
                  const isSelected = selectedModelId === model.id;
                  const isConfigured =
                    !!model.isDefault ||
                    configuredProviders.has(model.provider);
                  const meta = PROVIDER_META[model.provider];

                  return (
                    <button
                      key={`${model.provider}-${model.id}`}
                      type="button"
                      onClick={() => handleSelect(model)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-2.5 h-9 rounded-lg text-xs transition-colors cursor-pointer text-left",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {meta && (
                          <div className="size-4 shrink-0 flex items-center justify-center">
                            <Image
                              src={meta.icon}
                              alt=""
                              width={16}
                              height={16}
                              className="size-4 object-contain"
                            />
                          </div>
                        )}
                        <span className="truncate">{model.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isConfigured && (
                          <span
                            title="API Key required in Settings"
                            className="text-amber-500/80"
                          >
                            <Lock className="size-3" />
                          </span>
                        )}
                        {isSelected && <Check className="size-3.5 text-primary" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-3 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{filteredModels.length} models</span>
              <Link
                href="/settings"
                onClick={() => onOpenChange(false)}
                className="hover:text-foreground hover:underline transition-colors"
              >
                Manage API Keys &rarr;
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
