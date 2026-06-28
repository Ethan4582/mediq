"use client";

import { useState } from "react";
import { RefreshCw, Trash2, Plus, Key } from "lucide-react";
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
      className="rounded-2xl border overflow-hidden shadow-sm bg-white"
      style={{ borderColor: "var(--card-border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
          Your API Keys
        </h2>
        <Button 
          size="sm" 
          onClick={() => setOpen(true)} 
          className="flex items-center gap-1.5 rounded-lg text-sm"
          style={{ background: "var(--brand-primary)", color: "white" }}
        >
          <Plus size={16} />
          Add Key
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-5 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonLine key={i} className="h-8" />
          ))}
        </div>
      ) : (
        <div className="w-full">
          {/* Table Header */}
          <div className="grid grid-cols-5 px-6 py-3 bg-gray-50 border-y border-gray-100 text-xs font-semibold text-gray-500">
            <div>Provider</div>
            <div>API Key</div>
            <div>Status</div>
            <div>Added On</div>
            <div>Actions</div>
          </div>

          {keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 mb-6">
                <Key size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No API keys added
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Add your own API key to unlock full access.
              </p>
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 border border-blue-200 bg-blue-50/50 text-blue-600 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                <Plus size={16} />
                Add your first key
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="grid grid-cols-5 items-center px-6 py-4 border-b border-gray-100 last:border-none text-sm"
                >
                  <div className="capitalize font-medium text-gray-900">
                    {k.provider}
                  </div>
                  <div className="font-mono text-gray-500">
                    ••••••••{k.last4}
                  </div>
                  <div>
                    <StatusBadge status={k.status} />
                  </div>
                  <div className="text-gray-500">
                    {k.created_at}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                        <RefreshCw size={14} />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddKeyDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
