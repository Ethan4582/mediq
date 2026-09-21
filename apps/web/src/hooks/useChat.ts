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

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const sendMessage = useCallback(async (text: string, sessionId: string) => {
    if (!text.trim() || isSending) return;

    const tempId = `opt-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      session_id: sessionId,
      role: "user",
      content: text,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setIsSending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const messageHistory = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: sessionId, message: text, message_history: messageHistory }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || errData?.detail || "Failed to send message");
      }

      setMessages(prev => prev.filter(m => m.id !== tempId));
      onCompleteRef.current?.();
    } catch (err: unknown) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      const message = err instanceof Error ? err.message : "Failed to send message";
      setError(message);
    } finally {
      setIsSending(false);
    }
  }, [isSending, messages, setMessages]);

  return { sendMessage, isSending, error };
}
