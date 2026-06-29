import { useState, useCallback, useEffect } from "react";
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

export function useDocumentUpload(sessionId: string, onComplete?: (sessionId: string) => void) {
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const { triggerRefresh } = useSessionStore();


  useEffect(() => {
    if (!sessionId || sessionId === "new") return;

    let mounted = true;
    const fetchExistingDoc = async () => {
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
          }
        }
      } catch (err) {
        console.error("Failed to fetch existing document", err);
      }
    };

    fetchExistingDoc();

    return () => {
      mounted = false;
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

      toast.info("Uploading document...", {
        description: file.name,
        duration: 2000,
      });

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPendingUpload(prev => prev ? { ...prev, status: "error", errorMessage: "Not authenticated" } : null);
        return;
      }

      const form = new FormData();
      form.append("files", file);

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

        const { session_id, job_id } = await res.json();
        setPendingUpload(prev => prev ? { ...prev, jobId: job_id } : null);
        triggerRefresh();

        // Poll SSE stream
        const es = new EventSource(`${API_URL}/api/upload/${job_id}/status`);
        es.onmessage = async (e) => {
          const data = JSON.parse(e.data);
          
          if (data.status === "done") {
            es.close();
            setPendingUpload(prev => prev ? { ...prev, status: "done", progress: 100 } : null);
            
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

            toast.success("Document processed", {
              description: `${file.name} is ready. You can now ask questions about this case.`,
              duration: 5000,
            });
            
            onComplete?.(session_id);
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
      } catch (err) {
        setPendingUpload(prev => prev ? { ...prev, status: "error", errorMessage: "Upload failed" } : null);
      }
    },
    [onComplete, triggerRefresh]
  );

  return { upload, pendingUpload, setPendingUpload, ocrResult, setOcrResult };
}
