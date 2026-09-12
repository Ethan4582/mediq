"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/shared/Avatar";
import Spinner from "@/components/shared/Spinner";
import { Pencil, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <Card className="shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <Avatar name={displayName} src={user?.user_metadata?.avatar_url} size="lg" />
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-sm max-w-xs"
              />
              <Button size="icon" variant="ghost" onClick={handleSave} disabled={saving} className="size-8 text-emerald-600">
                {saving ? <Spinner className="size-3.5" /> : <Check className="size-4" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setEditing(false)} className="size-8 text-muted-foreground">
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground truncate">{displayName}</h2>
              <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="size-7 text-muted-foreground">
                <Pencil className="size-3.5" />
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
