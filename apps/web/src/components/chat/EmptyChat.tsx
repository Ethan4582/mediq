import Link from "next/link";
import { FileText } from "lucide-react";

export default function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
      <FileText
        size={48}
        style={{ color: "var(--text-muted)" }}
      />
      <div className="text-center space-y-1">
        <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
          No documents yet
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Upload patient documents to generate a discharge summary
        </p>
      </div>
      <Link
        href="/"
        className="mt-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
        style={{ background: "var(--brand-primary)" }}
      >
        Upload documents
      </Link>
    </div>
  );
}
