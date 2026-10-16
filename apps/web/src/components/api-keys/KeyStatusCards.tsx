"use client";

import { useState } from "react";
import { Brain, CheckCircle2, AlertCircle, ScanLine, Plus } from "lucide-react";
import Image from "next/image";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import { PROVIDERS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AddKeyDialog from "./AddKeyDialog";
import { KeyType } from "@/types/app";

export default function KeyStatusCards() {
  const { ocrKey, activeLlmKey, has_mistral_key, has_llm_key, active_llm_provider, loading, refetch } = useKeyStatus();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKeyType, setDialogKeyType] = useState<KeyType>("ocr");

  const openDialogFor = (type: KeyType) => {
    setDialogKeyType(type);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <Card key={i} className="p-6 rounded-2xl border border-border/80">
            <CardContent className="space-y-3 p-0">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const activeProviderName =
    active_llm_provider && active_llm_provider in PROVIDERS
      ? PROVIDERS[active_llm_provider as keyof typeof PROVIDERS].name
      : activeLlmKey?.provider
      ? activeLlmKey.provider.toUpperCase()
      : null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Layer 1: Mistral Document OCR Card */}
        <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardContent className="space-y-4 p-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <ScanLine className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">Layer 1: Document OCR</h3>
                    <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                      Mistral Only
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    High-precision medical OCR (<code className="font-mono text-[11px]">mistral-ocr-latest</code>)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Engine Status</span>
                {has_mistral_key || ocrKey ? (
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 font-medium">
                    <CheckCircle2 className="size-3" /> Configured & Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 font-medium">
                    <AlertCircle className="size-3" /> Key Required
                  </Badge>
                )}
              </div>

              {has_mistral_key || ocrKey ? (
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <div className="size-4 shrink-0 flex items-center justify-center overflow-hidden">
                      <Image
                        src="/mistral.svg"
                        alt="Mistral"
                        width={16}
                        height={16}
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                    <span className="font-semibold text-foreground">Mistral AI</span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      ···{ocrKey?.key_last4 ?? ""}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 pt-0.5">
                  Document upload and parsing will fail until a Mistral OCR key is configured.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[70%]">
                Extracts clinical notes, lab tables, and discharge summaries from PDFs.
              </p>
              <Button
                variant={has_mistral_key ? "outline" : "default"}
                size="sm"
                onClick={() => openDialogFor("ocr")}
                className="h-8 px-3 text-xs rounded-xl gap-1 shrink-0 font-medium"
              >
                <Plus className="size-3.5" />
                {has_mistral_key ? "Update Key" : "Add OCR Key"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Layer 2: Clinical Reasoning LLM Card */}
        <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardContent className="space-y-4 p-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Brain className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">Layer 2: Clinical Reasoning</h3>
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                      Multi-Provider
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clinical synthesis, entity extraction, and RAG chat
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Reasoning Engine</span>
                {has_llm_key || activeLlmKey ? (
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 font-medium">
                    <CheckCircle2 className="size-3" /> Active Provider
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 font-medium">
                    <AlertCircle className="size-3" /> Key Required
                  </Badge>
                )}
              </div>

              {has_llm_key || activeLlmKey ? (
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    {active_llm_provider && (
                      <div className="size-4 shrink-0 flex items-center justify-center overflow-hidden">
                        <Image
                          src={`/${active_llm_provider.toLowerCase()}.svg`}
                          alt={activeProviderName || "LLM"}
                          width={16}
                          height={16}
                          className="w-4 h-4 object-contain"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    )}
                    <span className="font-semibold text-foreground">{activeProviderName}</span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      ···{activeLlmKey?.key_last4 ?? ""}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 pt-0.5">
                  Add a key for Groq, OpenAI, Anthropic, Gemini, Mistral, xAI, or DeepSeek.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[70%]">
                Powers structured summary generation, hospital course reviews, and interactive Q&A.
              </p>
              <Button
                variant={has_llm_key ? "outline" : "default"}
                size="sm"
                onClick={() => openDialogFor("llm")}
                className="h-8 px-3 text-xs rounded-xl gap-1 shrink-0 font-medium"
              >
                <Plus className="size-3.5" />
                {has_llm_key ? "Add / Switch" : "Add LLM Key"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddKeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultKeyType={dialogKeyType}
        onSaved={refetch}
      />
    </>
  );
}
