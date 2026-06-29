"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import Spinner from "@/components/shared/Spinner";
import { createClient } from "@/lib/supabase/client";
import { PROVIDERS, API_URL } from "@/lib/constants";
import { LLMProvider } from "@/types/app";

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
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add API Key</DialogTitle>
        </DialogHeader>

        {/* Step 1 — Key type */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">What type of key are you adding?</p>
            <div className="space-y-3">
              {[
                { type: "ocr" as KeyType, title: "Mistral OCR Key", desc: "Required. Reads and extracts text from uploaded documents.", badge: "Required" },
                { type: "llm" as KeyType, title: "AI Provider Key", desc: "Required. Generates discharge summaries.", badge: "Required" },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => { setKeyType(opt.type); setStep(opt.type === "ocr" ? 3 : 2); }}
                  className="w-full text-left border rounded-2xl p-4 transition-all hover:border-blue-400"
                  style={{ borderColor: "var(--border-default)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{opt.title}</span>
                    <span className="text-[11px] bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-semibold">{opt.badge}</span>
                  </div>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center">Mistral can serve as both OCR and AI provider</p>
          </div>
        )}

        {/* Step 2 — Provider selection (LLM only) */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">← Back</button>
            <p className="text-sm text-gray-500">Select your AI provider:</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(PROVIDERS) as [LLMProvider, typeof PROVIDERS[LLMProvider]][]).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <button
                    onClick={() => setProvider(key)}
                    className="w-full border rounded-xl py-3 px-4 text-sm font-semibold transition-all flex items-center justify-between"
                    style={{
                      borderColor: provider === key ? "var(--brand-primary)" : "var(--border-default)",
                      background: provider === key ? "#eff6ff" : "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    {val.name}
                  </button>
                  <a href={val.docsUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 pl-1">
                    Get key <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(3)}>Next →</Button>
            </div>
          </div>
        )}

        {/* Step 3 — Key input */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <button onClick={() => setStep(keyType === "ocr" ? 1 : 2)} className="text-xs text-blue-600 hover:underline">← Back</button>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                {keyType === "ocr" ? "Mistral API Key" : `${PROVIDERS[effectiveProvider].name} API Key`}
              </p>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="sk-..."
                  value={key}
                  onChange={(e) => { setKey(e.target.value); setValidState("idle"); setError(""); }}
                  onBlur={validateKey}
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {validating && <Spinner />}
                  {!validating && validState === "valid" && <CheckCircle2 size={16} className="text-green-500" />}
                  {!validating && validState === "invalid" && <XCircle size={16} className="text-red-500" />}
                  <button type="button" onClick={() => setShow((v) => !v)} className="text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              {validState === "valid" && <p className="text-xs text-green-600 mt-1">✓ Key validated successfully</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || validating || !key.trim()}>
                {saving && <Spinner />}
                {saving ? "Saving…" : "Save Key"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
