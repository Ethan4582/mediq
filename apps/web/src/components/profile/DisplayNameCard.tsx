"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";
import { toast } from "sonner";

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
    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      toast.success("Display name updated successfully");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
      <div>
        <h3 className="font-semibold text-sm text-foreground">
          Display Name
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          This is how your name will appear across MediQ clinical summaries and session logs.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-md h-9 text-xs"
          placeholder="Enter your name"
        />
        <Button
          onClick={handleSave}
          disabled={saving || name.trim() === displayName}
          className="h-9 px-4 text-xs font-semibold shrink-0 cursor-pointer"
        >
          {saving && <Spinner />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
