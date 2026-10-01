"use client";

import { Brain, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import { PROVIDERS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function KeyStatusCards() {
  const { keys, has_llm_key, active_llm_provider, loading } = useKeyStatus();
  const activeKey = keys.find((k) => k.provider === active_llm_provider && k.is_active) || keys.find((k) => k.is_active);

  if (loading) {
    return (
      <Card className="p-6 rounded-2xl border border-border/80">
        <CardContent className="space-y-3 p-0">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  const providerName =
    active_llm_provider && active_llm_provider in PROVIDERS
      ? PROVIDERS[active_llm_provider as keyof typeof PROVIDERS].name
      : activeKey?.provider
      ? activeKey.provider.toUpperCase()
      : null;

  return (
    <Card className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs">
      <CardContent className="flex items-start justify-between gap-4 p-0">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Brain className="size-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">Unified AI Model Provider</h3>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Single Model Architecture
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              {has_llm_key || activeKey ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span className="text-foreground font-semibold">
                    {providerName}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ···{activeKey?.key_last4 ?? ""}
                  </span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-normal">
                    Active for OCR & Reasoning
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-destructive shrink-0" />
                  <span className="text-destructive text-xs">No active key configured. Add a provider key below.</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Your chosen model handles document vision parsing, clinical extraction, and discharge summary generation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
