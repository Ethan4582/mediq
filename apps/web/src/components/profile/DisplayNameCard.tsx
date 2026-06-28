"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";

export default function DisplayNameCard({
  user,
}: {
  user: { email?: string; user_metadata?: { full_name?: string } };
}) {
  const supabase = createClient();
  const displayName = user?.user_metadata?.full_name ?? "";
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });
    if (error) setError(error.message);
    setSaving(false);
  };

  return (
    <div
      className="rounded-xl border p-6 space-y-4"
      style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
    >
      <div>
        <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
          Display Name
        </h3>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          This is how your name will appear in MediQ.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
          placeholder="Enter your name"
        />
        <Button
          onClick={handleSave}
          disabled={saving || name.trim() === displayName}
          className="shrink-0 flex items-center justify-center gap-2"
          style={{ background: "var(--brand-primary)", color: "#fff" }}
        >
          {saving && <Spinner />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
