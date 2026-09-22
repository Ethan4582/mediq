"use client";

import { ScanText, Brain, CheckCircle2, AlertCircle } from "lucide-react";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import { PROVIDERS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function KeyStatusCards() {
  const { keys, has_mistral_key, has_llm_key, active_llm_provider, loading } = useKeyStatus();

  const ocrKey = keys.find((k) => k.key_type === "ocr" && k.is_active);
  const llmKey = keys.find((k) => k.key_type === "llm" && k.is_active);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <Card key={i} className="p-6">
            <CardContent className="space-y-3 p-0">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-5">
        <CardContent className="flex items-start gap-4 p-0">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ScanText className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">Mistral OCR Key</h3>
              <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                Required
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mb-1 text-sm font-medium">
              {has_mistral_key ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Connected ···{ocrKey?.key_last4 ?? ""}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="text-destructive">Not configured</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Extracts clinical text from scans & records</p>
          </div>
        </CardContent>
      </Card>

      <Card className="p-5">
        <CardContent className="flex items-start gap-4 p-0">
          <div className="size-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Brain className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">AI Provider Key</h3>
              <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                Required
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mb-1 text-sm font-medium">
              {has_llm_key ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {active_llm_provider && active_llm_provider in PROVIDERS
                      ? PROVIDERS[active_llm_provider as keyof typeof PROVIDERS].name
                      : "Connected"} ···{llmKey?.key_last4 ?? ""}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="text-destructive">Not configured</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Synthesizes and formats discharge summaries</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
