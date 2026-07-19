"use client";

import { FileText, CheckCircle2, Clock } from "lucide-react";

import { useSessionStore } from "@/stores/sessionStore";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FilesTabProps {
  ocrResult?: any;
}

export default function FilesTab({ ocrResult }: FilesTabProps) {
  const { setFileViewMode } = useSessionStore();
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionId || sessionId === "new") return;
    
    const fetchDocs = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/${sessionId}/documents`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    };
    fetchDocs();
  }, [sessionId]);

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Project Content</h3>
      
      <div className="space-y-3">
        {ocrResult && (
          <div 
            onClick={() => setFileViewMode(true)}
            className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border-default)] bg-[#f9fafb] hover:bg-[#f4f6f8] transition-colors cursor-pointer"
          >
            <div className="p-2 bg-white rounded-lg border border-[var(--border-default)] shadow-sm shrink-0">
              <FileText size={20} className="text-[#2563eb]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {ocrResult.fileName || "summary_1"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {ocrResult.pageCount || 1} pages
              </p>
            </div>
            
            <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200">
              <CheckCircle2 size={12} />
              Ready
            </div>
          </div>
        )}

        {documents.map((doc) => (
          <div 
            key={doc.id}
            onClick={() => {
              if (doc.ocr_status === "done") setFileViewMode(true);
            }}
            className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border-default)] bg-white hover:bg-[#f9fafb] transition-colors cursor-pointer"
          >
            <div className="p-2 bg-[#f4f6f8] rounded-lg border border-[var(--border-default)] shadow-sm shrink-0">
              <FileText size={20} className="text-[#2563eb]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {doc.file_name}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {doc.page_count} pages
              </p>
            </div>
            
            {doc.ocr_status === "done" ? (
              <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200">
                <CheckCircle2 size={12} />
                Ready
              </div>
            ) : (
              <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-medium border border-gray-200">
                <Clock size={12} />
                Processing
              </div>
            )}
          </div>
        ))}

        {!ocrResult && documents.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-[var(--border-default)] rounded-xl bg-[#f9fafb]">
            <FileText size={24} className="text-[#9ca3af] mb-2" />
            <p className="text-sm font-medium text-[var(--text-primary)]">No documents yet</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-[200px]">
              Upload a medical document in the chat to see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
