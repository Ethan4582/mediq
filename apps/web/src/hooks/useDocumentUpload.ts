import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { API_URL } from "@/lib/constants";
import { toast } from "sonner";
import { useSessionStore } from "@/stores/sessionStore";

export type PendingUpload = {
  fileName: string;
  pageCount?: number;
  fileSize: string;
  jobId: string;
  status: "uploading" | "processing" | "done" | "error";
  progress: number;
  stage: string;
  errorMessage?: string;
};

export type OcrResult = {
  rawText: string;
  fileName: string;
  pageCount: number;
  chunkCount: number;
};

export function useDocumentUpload(sessionId: string, onComplete?: (sessionId: string, documentId?: string) => void) {
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const { triggerRefresh } = useSessionStore();

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!sessionId || sessionId === "new") return;

    let mounted = true;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchOcrResult = async (): Promise<boolean> => {
      try {
        const res = await fetch(`${API_URL}/api/patient/${sessionId}/ocr-result`);
        if (res.ok) {
          const result = await res.json();
          if (mounted && result.raw_text) {
            setOcrResult({
              rawText: result.raw_text,
              fileName: result.file_name,
              pageCount: result.page_count,
              chunkCount: result.chunk_count,
            });
            return true;
          }
        }
      } catch (err) {
        console.error("Failed to fetch existing document", err);
      }
      return false;
    };

    const poll = async () => {
      const done = await fetchOcrResult();
      if (!done && mounted) {
        pollTimer = setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      mounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [sessionId]);

  const upload = useCallback(
    async (file: File) => {
      setOcrResult(null);
      setPendingUpload({
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
        jobId: "",
        status: "uploading",
        progress: 0,
        stage: "uploading",
      });

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPendingUpload(prev => prev ? { ...prev, status: "error", errorMessage: "Not authenticated" } : null);
        return;
      }

      const form = new FormData();
      form.append("files", file);
      if (sessionId && sessionId !== "new") {
        form.append("session_id", sessionId);
      }

      try {
        const res = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: form,
        });

        if (res.status === 403) {
          setPendingUpload(prev => prev ? { ...prev, status: "error", errorMessage: "keys_required" } : null);
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setPendingUpload(prev => prev ? { ...prev, status: "error", errorMessage: err?.error || "Upload failed" } : null);
          return;
        }

        const { session_id, job_id, document_ids } = await res.json();
        setPendingUpload(prev => prev ? { ...prev, jobId: job_id } : null);
        
        onCompleteRef.current?.(session_id, document_ids?.[0]);
        
        triggerRefresh();

        const es = new EventSource(`${API_URL}/api/upload/${job_id}/status`);
        es.onmessage = async (e) => {
          const data = JSON.parse(e.data);
          
          if (data.status === "done") {
            es.close();
            setPendingUpload(prev => prev ? { ...prev, status: "done", progress: 100, stage: "ready" } : null);
            
            try {
               const ocrRes = await fetch(`${API_URL}/api/patient/${session_id}/ocr-result`);
               if (ocrRes.ok) {
                 const result = await ocrRes.json();
                 setOcrResult({
                   rawText: result.raw_text,
                   fileName: result.file_name,
                   pageCount: result.page_count,
                   chunkCount: result.chunk_count
                 });
               }
            } catch (err) {
               console.error("Failed to fetch OCR result", err);
            }

            useSessionStore.getState().setPendingPipelineStatus("agent_running");
          } else if (data.status === "error") {
            es.close();
            setPendingUpload(prev => prev ? { ...prev, status: "error", errorMessage: data.error } : null);
            toast.error("Processing failed", {
              description: "Could not read the document. Please try again.",
            });
          } else {
            setPendingUpload(prev => prev ? { 
              ...prev, 
              status: "processing", 
              progress: data.progress, 
              stage: data.stage 
            } : null);
          }
        };
        es.onerror = () => {
          es.close();
          setPendingUpload(prev => prev ? { ...prev, status: "error", errorMessage: "Connection lost" } : null);
        };
      } catch {
        setPendingUpload(prev => prev ? { ...prev, status: "error", errorMessage: "Upload failed" } : null);
      }
    },
    [sessionId, triggerRefresh]
  );

  return { upload, pendingUpload, setPendingUpload, ocrResult, setOcrResult };
}
