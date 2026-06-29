"use client";

import { ScanText, Brain, CheckCircle, XCircle } from "lucide-react";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import { PROVIDERS } from "@/lib/constants";
import SkeletonLine from "@/components/shared/SkeletonLine";

export default function KeyStatusCards() {
  const { keys, has_mistral_key, has_llm_key, active_llm_provider, loading, refetch } = useKeyStatus();

  const ocrKey = keys.find((k) => k.key_type === "ocr" && k.is_active);
  const llmKey = keys.find((k) => k.key_type === "llm" && k.is_active);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border p-6 space-y-3 bg-white shadow-sm" style={{ borderColor: "var(--card-border)" }}>
            <SkeletonLine className="w-1/3 h-4" />
            <SkeletonLine className="w-1/2 h-7" />
            <SkeletonLine className="w-2/3 h-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* OCR Key Card */}
      <div className="rounded-2xl border p-6 shadow-sm bg-white" style={{ borderColor: "var(--card-border)" }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <ScanText size={22} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Mistral OCR Key</h3>
              <span className="text-[11px] bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-semibold">Required</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              {has_mistral_key ? (
                <>
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm font-semibold text-green-600">Connected ···{ocrKey?.key_last4}</span>
                </>
              ) : (
                <>
                  <XCircle size={14} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-600">Not connected</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">Reads and extracts text from uploaded documents</p>
          </div>
        </div>
      </div>

      {/* LLM Provider Card */}
      <div className="rounded-2xl border p-6 shadow-sm bg-white" style={{ borderColor: "var(--card-border)" }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
            <Brain size={22} className="text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>AI Provider</h3>
              <span className="text-[11px] bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-semibold">Required</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              {has_llm_key ? (
                <>
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm font-semibold text-green-600">
                    {active_llm_provider ? PROVIDERS[active_llm_provider]?.name : "Connected"} ···{llmKey?.key_last4}
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={14} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-600">Not connected</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">Generates discharge summaries</p>
          </div>
        </div>
      </div>
    </div>
  );
}
