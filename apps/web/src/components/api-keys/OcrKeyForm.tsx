"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";
import { createClient } from "@/lib/supabase/client";
import { API_URL, PROVIDERS } from "@/lib/constants";

interface OcrKeyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OcrKeyForm({ onSuccess, onCancel }: OcrKeyFormProps) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validState, setValidState] = useState<"idle" | "valid" | "invalid">("idle");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const validateKey = async () => {
    if (!key.trim()) return;
    setValidating(true);
    setValidState("idle");
    setError("");
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/keys/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          provider: "mistral",
          key: key.trim(),
          key_type: "ocr",
        }),
      });
      if (res.ok) {
        setValidState("valid");
      } else {
        setValidState("invalid");
        setError("Invalid Mistral API key. Please check and try again.");
      }
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
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          provider: "mistral",
          key: key.trim(),
          key_type: "ocr",
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setError(e?.detail?.error || "Failed to save OCR key");
        return;
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-start gap-3 p-3.5 rounded-xl border border-violet-500/20 bg-violet-500/5">
        <div className="size-9 rounded-lg bg-white dark:bg-card border border-border flex items-center justify-center shrink-0">
          <Image
            src="/mistral.svg"
            alt="Mistral AI"
            width={22}
            height={22}
            className="w-[22px] h-[22px] object-contain shrink-0"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Mistral AI Document OCR</span>
            <span className="text-[10px] font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-md">
              Layer 1 Required
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            High-precision document parsing engine (<code className="font-mono text-violet-600 dark:text-violet-400">mistral-ocr-latest</code>). Extracts clinical notes, discharge sheets, and lab tables from uploaded PDFs.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Mistral API Key</label>
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setValidState("idle");
              setError("");
            }}
            placeholder="mis_..."
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
        <a
          href={PROVIDERS.mistral.docsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
        >
          Get Mistral API Key <ExternalLink className="size-3" />
        </a>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs h-8 rounded-xl">
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
              {saving ? "Saving…" : "Save OCR Key"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
