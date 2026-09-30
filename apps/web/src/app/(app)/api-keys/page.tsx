import SettingsShell from "@/components/layout/SettingsShell";
import KeyStatusCards from "@/components/api-keys/KeyStatusCards";
import KeyTableClient from "@/components/api-keys/KeyTableClient";
import { BookOpen, Info } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <SettingsShell
      title="API Keys"
      description="Bring Your Own Key (BYOK) provider credentials and active routing configurations."
      badge={
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 border border-border/80 rounded-xl px-3 py-1.5 text-xs font-medium hover:bg-background transition-colors shadow-xs bg-card text-foreground"
        >
          <BookOpen size={13} className="text-muted-foreground" />
          <span>Provider Docs</span>
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
          <h3 className="font-semibold text-xs text-foreground">About BYOK Unified Architecture</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            MediQ uses your personal API keys with zero markup. Provide an active key for any supported vision-capable model (OpenAI, Anthropic, Gemini, Mistral) to power both document OCR and clinical reasoning.
          </p>
        </div>
      </div>
    </SettingsShell>
  );
}
