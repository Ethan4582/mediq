import UsageStats from "@/components/api-keys/UsageStats";
import KeyTable from "@/components/api-keys/KeyTable";
import { BookOpen, Info } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-[1000px] mx-auto w-full py-10 px-6 space-y-6 flex-1">
        
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              API Keys
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage your API keys and usage
            </p>
          </div>
          <button className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm bg-white" style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
            <BookOpen size={16} className="text-gray-500" />
            Docs
          </button>
        </div>

        {/* Stats Row */}
        <UsageStats />

        {/* API Keys Table */}
        <KeyTable keys={[]} />

        {/* About BYOK Card */}
        <div className="rounded-xl border p-5 flex items-start gap-4 mt-8 bg-white shadow-sm" style={{ borderColor: "var(--card-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#eff6ff", color: "var(--brand-primary)" }}>
            <Info size={16} />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>About BYOK</h3>
            <p className="text-sm text-gray-500">
              Bring Your Own Key (BYOK) lets you use your own API keys from supported providers.
            </p>
            <a href="#" className="inline-block text-sm font-medium mt-1 hover:underline" style={{ color: "var(--brand-primary)" }}>
              Learn more about BYOK &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
