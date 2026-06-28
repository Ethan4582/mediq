"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PasswordForm() {
  const supabase = createClient();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
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
      setCurrent(""); setNext(""); setConfirm("");
    }
    setLoading(false);
  };

  return (
    <div
      className="rounded-xl border p-6 space-y-4"
      style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
    >
      <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
        Change Password
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input type="password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Input type="password" placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} />
        <Input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {status && (
          <p className={`text-sm ${status.type === "error" ? "text-red-500" : "text-green-600"}`}>
            {status.msg}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Updating…" : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
