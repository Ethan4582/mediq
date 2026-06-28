"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

const PROVIDERS = ["Groq", "OpenAI", "Anthropic", "Mistral"];

export default function AddKeyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [provider, setProvider] = useState("Groq");
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!key.trim()) {
      setError("API key cannot be empty.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key }),
      });
    } catch {}
    setSaving(false);
    onOpenChange(false);
    setKey("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add API Key</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Provider</p>
            <div className="grid grid-cols-4 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className="border rounded-lg py-1.5 text-xs font-medium transition-colors"
                  style={{
                    borderColor: provider === p ? "var(--brand-primary)" : "var(--border-default)",
                    background: provider === p ? "var(--brand-light)" : "transparent",
                    color: provider === p ? "var(--brand-text)" : "var(--text-secondary)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              placeholder="sk-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="pr-10"
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShow((v) => !v)}
              style={{ color: "var(--text-muted)" }}
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving && <Spinner />}
            {saving ? "Saving…" : "Save Key"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
