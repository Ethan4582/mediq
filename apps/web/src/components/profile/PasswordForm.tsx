"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

export default function PasswordForm() {
  const supabase = createClient();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setStatus({ type: "error", msg: "New passwords do not match." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) {
      setStatus({ type: "error", msg: error.message });
    } else {
      setStatus({ type: "success", msg: "Password updated successfully." });
      setNext("");
      setConfirm("");
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Password & Security</CardTitle>
        <CardDescription className="text-xs">Update your credentials to keep your clinical account secure.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">New Password</label>
            <div className="relative">
              <Input
                type={showNext ? "text" : "password"}
                placeholder="••••••••"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={8}
                className="h-9 pr-9 text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowNext(!showNext)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 text-muted-foreground"
              >
                {showNext ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                className="h-9 pr-9 text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 text-muted-foreground"
              >
                {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
          </div>

          {status && (
            <p className={`text-xs ${status.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
              {status.msg}
            </p>
          )}

          <Button type="submit" size="sm" disabled={loading} className="text-xs shadow-sm">
            {loading ? <Spinner className="size-3.5 mr-1.5" /> : null}
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
