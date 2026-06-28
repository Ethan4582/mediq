"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

export default function PasswordForm() {
  const supabase = createClient();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
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

  const toggleShow = (field: keyof typeof show) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div
      className="rounded-xl border p-6 space-y-5"
      style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
    >
      <div>
        <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
          Password
        </h3>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Update your password to keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Current Password</label>
          <div className="relative">
            <Input
              type={show.current ? "text" : "password"}
              placeholder="Enter current password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => toggleShow("current")}
            >
              {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>New Password</label>
          <div className="relative">
            <Input
              type={show.next ? "text" : "password"}
              placeholder="Enter new password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => toggleShow("next")}
            >
              {show.next ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Confirm New Password</label>
          <div className="relative">
            <Input
              type={show.confirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => toggleShow("confirm")}
            >
              {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {status && (
          <p className={`text-sm ${status.type === "error" ? "text-red-500" : "text-green-600"}`}>
            {status.msg}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading || !current || !next || !confirm}
            className="flex items-center gap-2"
            style={{ background: "var(--brand-primary)", color: "#fff" }}
          >
            {loading && <Spinner />}
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
