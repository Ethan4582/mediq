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
import Spinner from "@/components/shared/Spinner";
import { createClient } from "@/lib/supabase/client";
import { PROVIDERS, API_URL } from "@/lib/constants";
import type { LLMProvider } from "@/types/app";
import { cn } from "@/lib/utils";

type Step = 1 | 2;

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
  const [provider, setProvider] = useState<LLMProvider>("openai");
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validState, setValidState] = useState<"idle" | "valid" | "invalid">("idle");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setStep(1);
    setProvider("openai");
    setKey("");
    setShow(false);
    setValidating(false);
    setValidState("idle");
    setError("");
    setSaving(false);
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const validateKey = async () => {
    if (!key.trim()) return;
    setValidating(true);
    setValidState("idle");
    setError("");
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/keys/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          provider,
          key,
          key_type: "llm",
        }),
      });
      setValidState(res.ok ? "valid" : "invalid");
      if (!res.ok) setError("Invalid API key. Please check and try again.");
    } catch {
      setValidState("invalid");
      setError("Validation failed. Check your connection.");
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (validState !== "valid") {
      await validateKey();
      return;
    }
    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          provider,
          key,
          key_type: "llm",
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e?.detail?.error || "Save failed");
        return;
      }
      onSaved?.();
      close();
    } finally {
      setSaving(false);
    }
  };

  const currentProviderConfig = PROVIDERS[provider];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {step === 1 ? "Select AI Model Provider" : `Configure ${currentProviderConfig?.name || "Provider"} Key`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-1">
            <p className="text-xs text-muted-foreground">
              Choose your model provider. This unified key powers both medical document vision extraction and clinical reasoning.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(
                Object.entries(PROVIDERS) as [
                  LLMProvider,
                  (typeof PROVIDERS)[LLMProvider],
                ][]
              ).map(([pKey, val]) => (
                <button
                  key={pKey}
                  onClick={() => setProvider(pKey)}
                  className={cn(
                    "border rounded-xl p-3 text-xs font-medium transition-all flex flex-col items-center gap-2 cursor-pointer",
                    provider === pKey
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-border hover:bg-muted/40 text-foreground"
                  )}
                >
                  <Image
                    src={`/${pKey}.svg`}
                    alt={val.name}
                    width={22}
                    height={22}
                    className="object-contain"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <span className="text-[11px] font-semibold">{val.name}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(2)}
                className="h-9 px-5 text-xs font-semibold rounded-xl"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="gap-1 text-xs -ml-2 h-7 rounded-lg"
            >
              <ArrowLeft className="size-3.5" /> Back to Providers
            </Button>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/70 bg-muted/20">
              <Image
                src={`/${provider}.svg`}
                alt={currentProviderConfig?.name || provider}
                width={24}
                height={24}
                className="object-contain"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-foreground">{currentProviderConfig?.name}</span>
                <p className="text-[11px] text-muted-foreground">Unified OCR vision & clinical reasoning model</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">API Key</label>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setValidState("idle");
                  }}
                  placeholder={currentProviderConfig?.placeholder || "Enter API key"}
                  className="pr-16 text-xs h-9 rounded-xl font-mono"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShow(!show)}
                    className="size-6 text-muted-foreground rounded-md"
                  >
                    {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </Button>
                  {validState === "valid" && <CheckCircle2 className="size-4 text-emerald-500" />}
                  {validState === "invalid" && <XCircle className="size-4 text-destructive" />}
                </div>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              {currentProviderConfig?.docsUrl && (
                <a
                  href={currentProviderConfig.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                >
                  Get API key <ExternalLink className="size-3" />
                </a>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={close} className="text-xs h-8 rounded-xl">
                  Cancel
                </Button>
                {validState !== "valid" ? (
                  <Button
                    size="sm"
                    onClick={validateKey}
                    disabled={validating || !key.trim()}
                    className="text-xs h-8 rounded-xl font-semibold"
                  >
                    {validating && <Spinner className="size-3 mr-1" />}
                    {validating ? "Validating…" : "Validate"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="text-xs h-8 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {saving && <Spinner className="size-3 mr-1" />}
                    {saving ? "Saving…" : "Save Key"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
