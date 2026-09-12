"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle2, XCircle, ExternalLink, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/shared/Spinner";
import { createClient } from "@/lib/supabase/client";
import { PROVIDERS, API_URL } from "@/lib/constants";
import type { LLMProvider } from "@/types/app";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;
type KeyType = "ocr" | "llm";

export default function AddKeyDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [keyType, setKeyType] = useState<KeyType>("ocr");
  const [provider, setProvider] = useState<LLMProvider>("groq");
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validState, setValidState] = useState<"idle" | "valid" | "invalid">("idle");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setStep(1); setKeyType("ocr"); setProvider("groq");
    setKey(""); setShow(false); setValidating(false);
    setValidState("idle"); setError(""); setSaving(false);
  };

  const close = () => { reset(); onOpenChange(false); };
  const effectiveProvider: LLMProvider = keyType === "ocr" ? "mistral" : provider;

  const validateKey = async () => {
    if (!key.trim()) return;
    setValidating(true); setValidState("idle"); setError("");
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/keys/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ provider: effectiveProvider, key, key_type: keyType }),
      });
      setValidState(res.ok ? "valid" : "invalid");
      if (!res.ok) setError("Invalid API key. Please check and try again.");
    } catch {
      setValidState("invalid"); setError("Validation failed. Check your internet connection.");
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (validState !== "valid") { await validateKey(); return; }
    setSaving(true); setError("");
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ provider: effectiveProvider, key, key_type: keyType }),
      });
      if (!res.ok) { const e = await res.json(); setError(e?.detail?.error || "Save failed"); return; }
      onSaved?.();
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Add API Key</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3 py-1">
            <p className="text-xs text-muted-foreground">Select the type of key to connect:</p>
            <div className="space-y-2.5">
              {[
                { type: "ocr" as KeyType, title: "Mistral OCR Key", desc: "Extracts clinical text from scanned records & charts.", badge: "Required" },
                { type: "llm" as KeyType, title: "AI Reasoning Provider Key", desc: "Synthesizes structured discharge summaries.", badge: "Required" },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => { setKeyType(opt.type); setStep(opt.type === "ocr" ? 3 : 2); }}
                  className="w-full text-left border rounded-xl p-3.5 transition-colors hover:border-primary/50 hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-foreground">{opt.title}</span>
                    <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">{opt.badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 py-1">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1 text-xs -ml-2 h-7">
              <ArrowLeft className="size-3.5" /> Back
            </Button>
            <p className="text-xs text-muted-foreground">Choose your LLM provider:</p>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.entries(PROVIDERS) as [LLMProvider, (typeof PROVIDERS)[LLMProvider]][]).map(([pKey, val]) => (
                <button
                  key={pKey}
                  onClick={() => setProvider(pKey)}
                  className={cn(
                    "border rounded-xl p-3 text-xs font-medium transition-all flex flex-col items-center gap-2",
                    provider === pKey ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/40"
                  )}
                >
                  <Image src={`/${pKey}.svg`} alt={val.name} width={20} height={20} className="object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                  <span>{val.name}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 py-1">
            <Button variant="ghost" size="sm" onClick={() => setStep(keyType === "ocr" ? 1 : 2)} className="gap-1 text-xs -ml-2 h-7">
              <ArrowLeft className="size-3.5" /> Back
            </Button>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{keyType === "ocr" ? "Mistral API Key" : `${PROVIDERS[effectiveProvider]?.name} API Key`}</span>
                <a href={PROVIDERS[effectiveProvider]?.docsUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  Get key <ExternalLink className="size-3" />
                </a>
              </div>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="sk-..."
                  value={key}
                  onChange={(e) => { setKey(e.target.value); setValidState("idle"); setError(""); }}
                  onBlur={validateKey}
                  className="pr-20 font-mono text-xs"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {validating && <Spinner className="size-3.5" />}
                  {!validating && validState === "valid" && <CheckCircle2 className="size-4 text-emerald-500" />}
                  {!validating && validState === "invalid" && <XCircle className="size-4 text-destructive" />}
                  <Button type="button" variant="ghost" size="icon" onClick={() => setShow(!show)} className="size-6 text-muted-foreground">
                    {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </Button>
                </div>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              {validState === "valid" && <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Key validated</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={close}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving || validating || !key.trim()}>
                {saving ? "Saving…" : "Save Key"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
