"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/shared/Avatar";
import Spinner from "@/components/shared/Spinner";
import { Pencil, Check, X } from "lucide-react";

export default function ProfileCard({
  user,
}: {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };
}) {
  const supabase = createClient();
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "User";
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    if (error) setError(error.message);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div
      className="rounded-xl border p-6 flex items-center gap-4"
      style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
    >
      <Avatar name={displayName} src={user?.user_metadata?.avatar_url} size="lg" />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-semibold rounded border px-2 py-0.5 outline-none flex-1"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
            <button onClick={handleSave} disabled={saving} className="p-1">
              {saving ? <Spinner /> : <Check size={16} className="text-green-600" />}
            </button>
            <button onClick={() => setEditing(false)} className="p-1">
              <X size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </h2>
            <button onClick={() => setEditing(true)} className="p-1">
              <Pencil size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        )}
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {user?.email}
        </p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}
