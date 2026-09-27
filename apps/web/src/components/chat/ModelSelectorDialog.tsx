"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Check,
  KeyRound,
  ExternalLink,
  Sparkles,
  Lock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MODEL_REGISTRY,
  PROVIDER_ORDER,
  PROVIDER_META,
  type ModelInfo,
} from "@/lib/modelsRegistry";
import type { LLMProvider } from "@/types/app";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProviderFilter, setActiveProviderFilter] = useState<string>("all");

  const filteredModels = useMemo(() => {
    let list = MODEL_REGISTRY;
    if (activeProviderFilter !== "all") {
      list = list.filter((m) => m.provider === activeProviderFilter || (m.isDefault && activeProviderFilter === "default"));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.providerName.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [searchQuery, activeProviderFilter]);

  const modelsByProvider = useMemo(() => {
    const groups: {
      provider: LLMProvider | "default";
      name: string;
      icon: string;
      docsUrl: string;
      isConfigured: boolean;
      models: ModelInfo[];
    }[] = [];

    const defaultMatches = filteredModels.filter((m) => m.isDefault);
    if (defaultMatches.length > 0 && (activeProviderFilter === "all" || activeProviderFilter === "default")) {
      groups.push({
        provider: "default",
        name: "Default Test Model",
        icon: "/openai.svg",
        docsUrl: "",
        isConfigured: true,
        models: defaultMatches,
      });
    }

    for (const prov of PROVIDER_ORDER) {
      const provModels = filteredModels.filter((m) => m.provider === prov && !m.isDefault);
      if (provModels.length > 0) {
        const meta = PROVIDER_META[prov];
        groups.push({
          provider: prov,
          name: meta.name,
          icon: meta.icon,
          docsUrl: meta.docsUrl,
          isConfigured: configuredProviders.has(prov),
          models: provModels,
        });
      }
    }

    return groups;
  }, [filteredModels, configuredProviders, activeProviderFilter]);

  const handleSelect = (model: ModelInfo, isConfigured: boolean) => {
    if (!isConfigured && !model.isDefault) return;
    onSelectModel(model);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden bg-background border border-border flex flex-col">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/80 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Select Language Model
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Choose an AI model for clinical consultation, chart Q&A, and discharge reasoning.
              </DialogDescription>
            </div>
            <Link
              href="/api-keys"
              onClick={() => onOpenChange(false)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg text-xs font-medium border border-border/80 bg-muted/30 hover:bg-muted text-foreground transition-colors"
            >
              <KeyRound className="size-3 text-muted-foreground" />
              <span>Manage Keys</span>
            </Link>
          </div>

          <div className="relative mt-3.5 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models by name, provider, or capability (e.g. reasoning, claude, 70b)..."
              className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border rounded-xl pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 divide-x divide-border/80 overflow-hidden">
          <div className="w-48 sm:w-56 p-2 bg-muted/20 overflow-y-auto space-y-1 shrink-0 no-scrollbar">
            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Providers
            </div>

            <button
              type="button"
              onClick={() => setActiveProviderFilter("all")}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                activeProviderFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span>All Providers</span>
              <span className="text-[10px] opacity-80">{MODEL_REGISTRY.length}</span>
            </button>

            {PROVIDER_ORDER.map((provId) => {
              const meta = PROVIDER_META[provId];
              const count = MODEL_REGISTRY.filter((m) => m.provider === provId && !m.isDefault).length;
              const hasKey = configuredProviders.has(provId);
              const isActive = activeProviderFilter === provId;

              return (
                <button
                  key={provId}
                  type="button"
                  onClick={() => setActiveProviderFilter(provId)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-4.5 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                      <Image
                        src={meta.icon}
                        alt={meta.name}
                        width={18}
                        height={18}
                        className="object-contain"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                    <span className="truncate">{meta.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasKey ? (
                      <span className={cn(
                        "size-1.5 rounded-full",
                        isActive ? "bg-white" : "bg-emerald-500"
                      )} />
                    ) : (
                      <Lock className={cn("size-3", isActive ? "text-white/80" : "text-muted-foreground")} />
                    )}
                    <span className="text-[10px] opacity-80">{count}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {modelsByProvider.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-xs font-medium text-foreground">No matching models found</p>
                <p className="text-[11px] text-muted-foreground">
                  Try adjusting your search query or select another provider.
                </p>
              </div>
            ) : (
              modelsByProvider.map((group) => (
                <div key={group.provider} className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded flex items-center justify-center shrink-0">
                        <Image
                          src={group.icon}
                          alt={group.name}
                          width={18}
                          height={18}
                          className="object-contain"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                      <h4 className="text-xs font-semibold text-foreground tracking-tight">
                        {group.name}
                      </h4>
                      {group.isConfigured ? (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium border border-amber-500/20">
                          Key Required
                        </span>
                      )}
                    </div>

                    {!group.isConfigured && group.docsUrl && (
                      <Link
                        href="/api-keys"
                        onClick={() => onOpenChange(false)}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Add API Key</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {group.models.map((model) => {
                      const isSelected = selectedModelId === model.id;
                      const isEnabled = group.isConfigured || Boolean(model.isDefault);

                      return (
                        <div
                          key={model.id}
                          onClick={() => handleSelect(model, isEnabled)}
                          className={cn(
                            "relative p-3 rounded-xl border transition-all text-left flex flex-col justify-between gap-2 select-none",
                            isEnabled
                              ? "cursor-pointer hover:border-primary/50 hover:bg-muted/30"
                              : "opacity-60 bg-muted/15 cursor-not-allowed border-dashed border-border/80",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                              : "border-border/80 bg-card"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-foreground">
                                  {model.name}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                                  {model.id}
                                </span>
                                {model.contextWindow && (
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    {model.contextWindow}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-2">
                                {model.description}
                              </p>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {!isEnabled && (
                                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Lock className="size-2.5" />
                                  <span>Key required</span>
                                </span>
                              )}
                              {isSelected && (
                                <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                                  <Check className="size-3 stroke-[2.5]" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {model.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.2 rounded-md border border-border/50"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
