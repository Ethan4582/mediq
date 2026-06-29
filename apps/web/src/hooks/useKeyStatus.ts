"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ApiKey, UserKeyStatus } from "@/types/app";
import { API_URL } from "@/lib/constants";

export function useKeyStatus() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [status, setStatus] = useState<UserKeyStatus>({
    has_mistral_key: false,
    has_llm_key: false,
    active_llm_provider: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_URL}/api/keys`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const data: ApiKey[] = await res.json();
      setKeys(data);
      setStatus({
        has_mistral_key: data.some((k) => k.key_type === "ocr" && k.is_active),
        has_llm_key: data.some((k) => k.key_type === "llm" && k.is_active),
        active_llm_provider: data.find((k) => k.key_type === "llm" && k.is_active)?.provider ?? null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  return {
    keys,
    ...status,
    isReady: status.has_mistral_key && status.has_llm_key,
    loading,
    refetch: fetchKeys,
  };
}
