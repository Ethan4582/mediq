"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import UploadDropzone from "@/components/chat/UploadDropzone";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleStart = async () => {
    if (!file) {
      setError("Please upload at least one document");
      return;
    }
    setError("");

    sessionStorage.setItem("mediq_pending_upload", JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
    }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
    } else {
      router.push("/chat/new");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">MediQ</h1>
          <p className="text-xl text-muted-foreground">AI-powered discharge summary drafts</p>
        </div>
        
        <div className="space-y-4">
          <UploadDropzone onUpload={setFile} />
          {file && (
            <p className="text-sm text-green-500">
              Selected: {file.name}
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button size="lg" onClick={handleStart} className="w-full max-w-xs">
            Start
          </Button>
        </div>
      </div>
    </div>
  )
}
