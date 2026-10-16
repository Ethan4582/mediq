"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { API_URL } from "@/lib/constants";
import type { Message } from "@/types/app";

export function useChat(
  messages: Message[],
  setMessages: (updater: (prev: Message[]) => Message[]) => void,
  onComplete?: () => void
) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Clean up and abort active streaming on component unmount or navigation
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string, sessionId: string, modelId?: string, provider?: string) => {
      if (!text.trim() || isSending) return;

      const userTempId = `user-opt-${Date.now()}`;
      const assistantTempId = `assistant-opt-${Date.now()}`;

      const userMsg: Message = {
        id: userTempId,
        session_id: sessionId,
        role: "user",
        content: text,
        metadata: {},
        created_at: new Date().toISOString(),
      };

      const assistantMsg: Message = {
        id: assistantTempId,
        session_id: sessionId,
        role: "assistant",
        content: "",
        metadata: {},
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsSending(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const messageHistory = messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            message: text,
            message_history: messageHistory,
            model: modelId || undefined,
            provider: provider || undefined,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.detail?.message || errData?.detail || "Failed to send message");
        }

        if (res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let accumulatedContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;
              try {
                const payload = JSON.parse(trimmed.replace(/^data: /, ""));
                if (payload.token) {
                  accumulatedContent += payload.token;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantTempId ? { ...m, content: accumulatedContent } : m
                    )
                  );
                }
                if (payload.done) {
                  if (payload.full_text && !accumulatedContent) {
                    accumulatedContent = payload.full_text;
                  }
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantTempId
                        ? {
                            ...m,
                            content: accumulatedContent,
                            metadata: {
                              sources: payload.sources || [],
                              source_count: (payload.sources || []).length,
                            },
                          }
                        : m
                    )
                  );
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        onCompleteRef.current?.();
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
        setMessages((prev) => prev.filter((m) => m.id !== userTempId && m.id !== assistantTempId));
        const message = err instanceof Error ? err.message : "Failed to send message";
        setError(message);
      } finally {
        setIsSending(false);
        abortControllerRef.current = null;
      }
    },
    [isSending, messages, setMessages]
  );

  return { sendMessage, isSending, error };
}
