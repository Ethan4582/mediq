import UsageStats from "@/components/api-keys/UsageStats";
import KeyTable from "@/components/api-keys/KeyTable";

export default function ApiKeysPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        API Keys
      </h1>
      <UsageStats />
      <KeyTable keys={[]} />
    </div>
  );
}
