"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { API_URL } from "@/lib/constants";

type UploadState = {
  status: "idle" | "uploading" | "processing" | "done" | "error";
  progress: number;
  stage: string;
  error: string | null;
};

export function useUpload(onComplete?: (sessionId: string) => void) {
  const [state, setState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    stage: "",
    error: null,
  });

  const upload = useCallback(
    async (files: File[]) => {
      setState({ status: "uploading", progress: 0, stage: "uploading", error: null });
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState((s) => ({ ...s, status: "error", error: "Not authenticated" }));
        return;
      }

      const form = new FormData();
      files.forEach((f) => form.append("files", f));

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      });

      if (res.status === 403) {
        setState({ status: "error", progress: 0, stage: "", error: "keys_required" });
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setState({ status: "error", progress: 0, stage: "", error: err?.error || "Upload failed" });
        return;
      }

      const { session_id, job_id } = await res.json();

      // Poll SSE stream
      const es = new EventSource(`${API_URL}/api/upload/${job_id}/status`);
      es.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setState({
          status: data.status === "done" ? "done" : data.status === "error" ? "error" : "processing",
          progress: data.progress,
          stage: data.stage,
          error: data.error || null,
        });
        if (data.status === "done") {
          es.close();
          onComplete?.(session_id);
        }
        if (data.status === "error") {
          es.close();
        }
      };
      es.onerror = () => {
        es.close();
        setState((s) => ({ ...s, status: "error", error: "Connection lost" }));
      };
    },
    [onComplete]
  );

  return { upload, ...state };
}
