"use client";

import { useState } from "react";
import { Plus, Key, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import AddKeyDialog from "./AddKeyDialog";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import { createClient } from "@/lib/supabase/client";
import { API_URL, PROVIDERS } from "@/lib/constants";
import SkeletonLine from "@/components/shared/SkeletonLine";
import { ApiKey, LLMProvider } from "@/types/app";

export default function KeyTableClient() {
  const [open, setOpen] = useState(false);
  const { keys, loading, refetch } = useKeyStatus();

  const deleteKey = async (id: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/api/keys/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    refetch();
  };

  const activateKey = async (id: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/api/keys/${id}/activate`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    refetch();
  };

  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm bg-white" style={{ borderColor: "var(--card-border)" }}>
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Your API Keys</h2>
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-lg text-sm"
          style={{ background: "var(--brand-primary)", color: "white" }}
        >
          <Plus size={16} /> Add Key
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-4 space-y-3">
          {[0, 1].map((i) => <SkeletonLine key={i} className="h-10" />)}
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-5 px-6 py-3 bg-gray-50 border-y border-gray-100 text-xs font-semibold text-gray-500">
            <div>Provider</div><div>API Key</div><div>Type</div><div>Added On</div><div>Actions</div>
          </div>

          {keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-6">
                <Key size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No API keys added</h3>
              <p className="text-sm text-gray-500 mb-6">Add your own API key to unlock full access.</p>
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 border border-blue-200 bg-blue-50/50 text-blue-600 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                <Plus size={16} /> Add your first key
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {keys.map((k) => (
                <div key={k.id} className="grid grid-cols-5 items-center px-6 py-4 border-b border-gray-100 last:border-none text-sm">
                  <div className="capitalize font-semibold text-gray-900">
                    {PROVIDERS[k.provider as LLMProvider]?.name || k.provider}
                  </div>
                  <div className="font-mono text-gray-500">···· {k.key_last4}</div>
                  <div>
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${k.key_type === "ocr" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                      {k.key_type === "ocr" ? "OCR" : "LLM"}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs">{new Date(k.created_at).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2">
                    {k.key_type === "llm" && (
                      <button
                        onClick={() => activateKey(k.id)}
                        className="p-1.5 rounded-md hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-600"
                        title="Set as active"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteKey(k.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                      title="Delete key"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddKeyDialog open={open} onOpenChange={setOpen} onSaved={refetch} />
    </div>
  );
}
