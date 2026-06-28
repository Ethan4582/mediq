"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import UploadDropzone from "@/components/chat/UploadDropzone";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/shared/Spinner";

export default function LandingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleStart = async () => {
    if (!file) {
      setError("Please upload at least one document");
      return;
    }
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    // Store the pending file in sessionStorage for the chat page to pick up
    sessionStorage.setItem("mediq_pending_upload", JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
    }));

    // Create a session row immediately so we have a real sessionId
    const { data, error: dbError } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        title: file.name.replace(/\.[^/.]+$/, ""),
        status: "pending",
      })
      .select("id")
      .single();

    if (dbError || !data) {
      setError("Failed to create session. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/chat/${data.id}`);
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
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            size="lg"
            onClick={handleStart}
            disabled={loading}
            className="w-full max-w-xs flex items-center justify-center gap-2"
            style={{ background: "var(--brand-primary)", color: "#fff" }}
          >
            {loading && <Spinner />}
            {loading ? "Creating session…" : "Start"}
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
