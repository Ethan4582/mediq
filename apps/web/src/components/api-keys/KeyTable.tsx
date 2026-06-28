"use client";

import { useState } from "react";
import { RefreshCw, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonLine from "@/components/shared/SkeletonLine";
import AddKeyDialog from "./AddKeyDialog";

type ApiKey = {
  id: string;
  provider: string;
  last4: string;
  status: "done" | "error" | "pending";
  created_at: string;
};

export default function KeyTable({
  keys = [],
  loading,
}: {
  keys?: ApiKey[];
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
          API Keys
        </h2>
        <Button size="sm" onClick={() => setOpen(true)} className="flex items-center gap-1.5">
          <Plus size={14} />
          Add Key
        </Button>
      </div>

      {loading ? (
        <div className="px-5 py-4 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonLine key={i} className="h-8" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No API keys added. Add your own key to unlock full access.
          </p>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            Add a key
          </Button>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b text-xs"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-muted)",
              }}
            >
              {["Provider", "Key", "Status", "Added", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr
                key={k.id}
                className="border-b last:border-none"
                style={{ borderColor: "var(--border-default)" }}
              >
                <td className="px-5 py-3 capitalize font-medium" style={{ color: "var(--text-primary)" }}>
                  {k.provider}
                </td>
                <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                  ••••••••{k.last4}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={k.status} />
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  {k.created_at}
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors" style={{ color: "var(--text-muted)" }}>
                      <RefreshCw size={13} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AddKeyDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
