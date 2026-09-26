"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { ClinicalDraft } from "@/types/app";

interface UseClinicalAgentProps {
  sessionId: string;
  selectedProvider: string | null;
  refetchMessages: () => Promise<void>;
  onDraftReady?: () => void;
}

export function useClinicalAgent({
  sessionId,
  selectedProvider,
  refetchMessages,
  onDraftReady,
}: UseClinicalAgentProps) {
  const [activeDocumentId, setActiveDocumentId] = useState<string | undefined>();
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [latestDraft, setLatestDraft] = useState<ClinicalDraft | null>(null);

  const executeAgentRun = useCallback(
    async (sessId: string, docId?: string) => {
      if (!sessId || sessId === "new") return;
      setIsAgentRunning(true);
      try {
        const supabase = createClient();
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        const token = authSession?.access_token;
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/agent/run`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              session_id: sessId,
              document_id: docId,
              provider: selectedProvider,
            }),
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail?.error || "Agent run failed");
        }

        const data = await res.json();
        if (data.draft) {
          setLatestDraft(data.draft);
          onDraftReady?.();
          toast.success("Discharge Summary generated");
        }
        await refetchMessages();
      } catch (err: unknown) {
        toast.error("Agent error", {
          description: err instanceof Error ? err.message : "Workflow encountered an error",
        });
      } finally {
        setIsAgentRunning(false);
      }
    },
    [selectedProvider, refetchMessages, onDraftReady]
  );

  useEffect(() => {
    if (!sessionId || sessionId === "new") return;
    let mounted = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        const headers: HeadersInit = authSession?.access_token
          ? { Authorization: `Bearer ${authSession.access_token}` }
          : {};
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/patient/${sessionId}/drafts`,
          { headers }
        );
        if (res.ok && mounted) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const parsed =
              typeof data[0].content === "string"
                ? JSON.parse(data[0].content)
                : data[0].content;
            setLatestDraft(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to fetch draft:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  return {
    activeDocumentId,
    setActiveDocumentId,
    isAgentRunning,
    latestDraft,
    setLatestDraft,
    executeAgentRun,
  };
}
