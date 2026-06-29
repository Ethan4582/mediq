"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import UploadDropzone from "@/components/chat/UploadDropzone";
import { createClient } from "@/lib/supabase/client";
import { useUpload } from "@/hooks/useUpload";
import Spinner from "@/components/shared/Spinner";

export default function LandingPage() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  
  const { upload, status, progress, stage, error: uploadError } = useUpload((sessionId) => {
    router.push(`/chat/${sessionId}`);
  });

  const handleStart = async () => {
    if (!file) return;
    await upload([file]);
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            MediQ
          </h1>
          <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
            AI-powered discharge summary drafts
          </p>
        </div>

        <div className="space-y-4">
          <UploadDropzone onUpload={setFile} />
          {file && (
            <p className="text-sm text-green-600">Selected: {file.name}</p>
          )}
          {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          
          {(status === "uploading" || status === "processing") && (
            <div className="w-full max-w-xs text-center space-y-1">
              <p className="text-sm text-gray-500">{stage} ({progress}%)</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <Button
            size="lg"
            onClick={handleStart}
            disabled={status !== "idle" && status !== "error"}
            className="w-full max-w-xs flex items-center justify-center gap-2"
            style={{ background: "var(--brand-primary)", color: "#fff" }}
          >
            {(status === "uploading" || status === "processing") && <Spinner />}
            {status === "uploading" || status === "processing" ? "Processing…" : "Start"}
          </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        <p>&copy; {new Date().getFullYear()} MediQ. All rights reserved.</p>
      </footer>
    </div>
  );
}
