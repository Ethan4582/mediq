import SettingsShell from "@/components/layout/SettingsShell";
import KeyStatusCards from "@/components/api-keys/KeyStatusCards";
import KeyTableClient from "@/components/api-keys/KeyTableClient";
import { BookOpen, Info } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <SettingsShell
      title="API Keys"
      description="Two-layer Bring Your Own Key (BYOK) architecture: Mistral OCR for document parsing and your chosen LLM for clinical reasoning."
      badge={
        <a
          href="https://console.mistral.ai/api-keys"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 border border-border/80 rounded-xl px-3 py-1.5 text-xs font-medium hover:bg-background transition-colors shadow-xs bg-card text-foreground"
        >
          <BookOpen size={13} className="text-muted-foreground" />
          <span>Mistral Console</span>
        </a>
      }
    >
      {/* Key Status Cards */}
      <KeyStatusCards />

      {/* API Keys Table */}
      <KeyTableClient />

      {/* About BYOK Card */}
      <div className="rounded-2xl border border-border/80 p-5 flex items-start gap-4 bg-card shadow-xs">
        <div className="size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">
          <Info size={16} />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-xs text-foreground">About the Two-Layer BYOK Architecture</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            MediQ operates on a strict two-layer architecture with zero markup on your API tokens:
          </p>
          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 pt-1">
            <li>
              <strong className="text-foreground">Layer 1 (Document OCR):</strong> Dedicated Mistral API key running <code className="font-mono text-primary text-[11px]">mistral-ocr-latest</code> for high-precision text, table, and medical record layout parsing.
            </li>
            <li>
              <strong className="text-foreground">Layer 2 (Clinical Reasoning):</strong> Your chosen external model provider (Groq, OpenAI, Anthropic, Gemini, Mistral, xAI, or DeepSeek) to power structured entity extraction, risk assessment, and discharge summaries.
            </li>
          </ul>
        </div>
      </div>
    </SettingsShell>
  );
}
