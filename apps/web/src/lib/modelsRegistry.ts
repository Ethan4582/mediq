import type { LLMProvider } from "@/types/app";

export interface ModelInfo {
  id: string;
  name: string;
  provider: LLMProvider;
  providerName: string;
  providerIcon: string;
  description?: string;
  tag?: string;
  isDefault?: boolean;
}

export interface ProviderGroup {
  id: LLMProvider;
  name: string;
  icon: string;
  docsUrl: string;
  models: ModelInfo[];
}

export const DEFAULT_MODEL: ModelInfo = {
  id: "gemini-3.7-flash",
  name: "Gemini 3.7 Flash",
  provider: "gemini",
  providerName: "Google Gemini",
  providerIcon: "/gemini.svg",
  description: "High-speed multimodal clinical intelligence",
  tag: "Fast",
  isDefault: true,
};

export const MODEL_REGISTRY: ModelInfo[] = [
  // OpenAI
  { id: "gpt-5.6-sol", name: "GPT-5.6 Sol", provider: "openai", providerName: "OpenAI", providerIcon: "/openai.svg", description: "Flagship intelligence for clinical synthesis", tag: "Flagship" },
  { id: "gpt-5.6-terra", name: "GPT-5.6 Terra", provider: "openai", providerName: "OpenAI", providerIcon: "/openai.svg", description: "Balanced grounded reasoning for clinical notes", tag: "Balanced" },
  { id: "gpt-5.6-luna", name: "GPT-5.6 Luna", provider: "openai", providerName: "OpenAI", providerIcon: "/openai.svg", description: "Fast lightweight clinical parsing", tag: "Fast" },

  // Anthropic
  { id: "claude-fable-5", name: "Claude Fable 5", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "Deep reasoning across complex longitudinal charts", tag: "Reasoning" },
  { id: "claude-opus-5", name: "Claude Opus 5", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "Demanding agentic & multi-document synthesis", tag: "Opus" },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "Optimal speed & precision for hospital records", tag: "Recommended" },
  { id: "claude-opus-4-8", name: "Claude Opus 4.8", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "Complex clinical analysis engine" },
  { id: "claude-opus-4-7", name: "Claude Opus 4.7", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "High-capability clinical parsing" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "Advanced document structuring" },
  { id: "claude-opus-4-5-20251101", name: "Claude Opus 4.5", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "Established medical document synthesis" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "Fast dependable clinical summaries" },
  { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "Standard clinical documentation model" },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", provider: "anthropic", providerName: "Anthropic", providerIcon: "/anthropic.svg", description: "Ultra-fast low latency intake", tag: "Fast" },

  // Google Gemini
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "Next-gen lightning inference with long context", tag: "Latest" },
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "Default high-speed clinical intelligence", tag: "Default", isDefault: true },
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "Fast, reliable chart analysis" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "Strong quality per token speed" },
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "Compact high-efficiency model", tag: "Lite" },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash-Lite", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "Lightweight extraction" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "Deep reasoning across long medical files" },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "Surprising capability with instant turnaround" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "High-accuracy clinical extraction" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "High throughput summarization" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", provider: "gemini", providerName: "Google Gemini", providerIcon: "/gemini.svg", description: "Sub-second intake extraction" },

  // Groq
  { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", provider: "groq", providerName: "Groq", providerIcon: "/groq.svg", description: "120B parameter open weights at 500+ tok/s", tag: "Ultra-Fast" },
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", provider: "groq", providerName: "Groq", providerIcon: "/groq.svg", description: "20B open weights high-speed inference", tag: "Ultra-Fast" },
  { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B", provider: "groq", providerName: "Groq", providerIcon: "/groq.svg", description: "Powerful multilingual clinical understanding" },
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "groq", providerName: "Groq", providerIcon: "/groq.svg", description: "LPU-accelerated 70B clinical reasoning" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", provider: "groq", providerName: "Groq", providerIcon: "/groq.svg", description: "Instant token throughput for quick queries" },

  // Mistral
  { id: "mistral-large-3", name: "Mistral Large 3", provider: "mistral", providerName: "Mistral", providerIcon: "/mistral.svg", description: "Top-tier multilingual medical reasoning", tag: "Flagship" },
  { id: "mistral-medium-3.5", name: "Mistral Medium 3.5", provider: "mistral", providerName: "Mistral", providerIcon: "/mistral.svg", description: "Enterprise-grade clinical structuring" },
  { id: "mistral-small-4", name: "Mistral Small 4", provider: "mistral", providerName: "Mistral", providerIcon: "/mistral.svg", description: "Fast, cost-effective note drafting" },
  { id: "ministral-3-14b", name: "Ministral 3 14B", provider: "mistral", providerName: "Mistral", providerIcon: "/mistral.svg", description: "Edge-optimized 14B clinical model" },
  { id: "ministral-3-8b", name: "Ministral 3 8B", provider: "mistral", providerName: "Mistral", providerIcon: "/mistral.svg", description: "Compact 8B model for fast parsing" },
  { id: "ministral-3-3b", name: "Ministral 3 3B", provider: "mistral", providerName: "Mistral", providerIcon: "/mistral.svg", description: "Ultra-lightweight embedded model" },
  { id: "devstral-2", name: "Devstral 2", provider: "mistral", providerName: "Mistral", providerIcon: "/mistral.svg", description: "Structured clinical schema generation" },
  { id: "magistral-medium-1.2", name: "Magistral Medium 1.2", provider: "mistral", providerName: "Mistral", providerIcon: "/mistral.svg", description: "Specialized clinical domain model" },

  // xAI (Grok)
  { id: "grok-4.6", name: "Grok 4.6", provider: "grok", providerName: "xAI", providerIcon: "/grok.svg", description: "Latest flagship reasoning from xAI", tag: "Latest" },
  { id: "grok-4.20-0309-reasoning", name: "Grok 4.20 Reasoning", provider: "grok", providerName: "xAI", providerIcon: "/grok.svg", description: "Extended chain-of-thought for diagnostic review", tag: "CoT" },
  { id: "grok-4.20-0309-non-reasoning", name: "Grok 4.20 Non-Reasoning", provider: "grok", providerName: "xAI", providerIcon: "/grok.svg", description: "Low-latency direct clinical answer generation" },
  { id: "grok-4.20-multi-agent-0309", name: "Grok 4.20 Multi-Agent", provider: "grok", providerName: "xAI", providerIcon: "/grok.svg", description: "Multi-agent coordinator for complex discharges", tag: "Agent" },

  // DeepSeek
  { id: "deepseek-flash", name: "DeepSeek-V4.1-Flash", provider: "deepseek", providerName: "DeepSeek", providerIcon: "/deepseek.svg", description: "High-speed clinical reasoning & extraction", tag: "Flash" },
  { id: "deepseek-v4-pro", name: "DeepSeek-V4-Pro", provider: "deepseek", providerName: "DeepSeek", providerIcon: "/deepseek.svg", description: "Advanced clinical analysis & math verification", tag: "Pro" },

  // Meta
  { id: "muse-spark-1.3", name: "Muse Spark 1.3", provider: "meta", providerName: "Meta", providerIcon: "/meta.svg", description: "Meta open clinical intelligence 1.3", tag: "Open" },
  { id: "muse-spark-1.3-contributor", name: "Muse Spark 1.3 Contributor", provider: "meta", providerName: "Meta", providerIcon: "/meta.svg", description: "Community fine-tuned clinical model" },
  { id: "muse-spark-1.2", name: "Muse Spark 1.2", provider: "meta", providerName: "Meta", providerIcon: "/meta.svg", description: "Stable open release for patient records" },
  { id: "muse-spark-1.2-contributor", name: "Muse Spark 1.2 Contributor", provider: "meta", providerName: "Meta", providerIcon: "/meta.svg", description: "Clinical partner fine-tuned weights" },
  { id: "muse-spark-1.1", name: "Muse Spark 1.1", provider: "meta", providerName: "Meta", providerIcon: "/meta.svg", description: "Foundational clinical note engine" },
];

export const PROVIDER_ORDER: LLMProvider[] = [
  "openai",
  "anthropic",
  "gemini",
  "groq",
  "mistral",
  "grok",
  "deepseek",
  "meta",
];

export const PROVIDER_META: Record<
  LLMProvider,
  { name: string; icon: string; docsUrl: string; baseUrl: string }
> = {
  openai: {
    name: "OpenAI",
    icon: "/openai.svg",
    docsUrl: "https://platform.openai.com/api-keys",
    baseUrl: "https://api.openai.com/v1",
  },
  anthropic: {
    name: "Anthropic",
    icon: "/anthropic.svg",
    docsUrl: "https://platform.claude.com/dashboard",
    baseUrl: "https://api.anthropic.com/v1",
  },
  gemini: {
    name: "Google Gemini",
    icon: "/gemini.svg",
    docsUrl: "https://aistudio.google.com/app/apikey",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  },
  groq: {
    name: "Groq",
    icon: "/groq.svg",
    docsUrl: "https://console.groq.com/keys",
    baseUrl: "https://api.groq.com/openai/v1",
  },
  mistral: {
    name: "Mistral",
    icon: "/mistral.svg",
    docsUrl: "https://console.mistral.ai/api-keys",
    baseUrl: "https://api.mistral.ai/v1",
  },
  grok: {
    name: "xAI",
    icon: "/grok.svg",
    docsUrl: "https://console.x.ai",
    baseUrl: "https://api.x.ai/v1",
  },
  deepseek: {
    name: "DeepSeek",
    icon: "/deepseek.svg",
    docsUrl: "https://platform.deepseek.com/api_keys",
    baseUrl: "https://api.deepseek.com",
  },
  meta: {
    name: "Meta",
    icon: "/meta.svg",
    docsUrl: "https://www.llama.com",
    baseUrl: "https://api.meta.ai/v1",
  },
};

export function getProviderGroups(): ProviderGroup[] {
  return PROVIDER_ORDER.map((provId) => {
    const meta = PROVIDER_META[provId];
    return {
      id: provId,
      name: meta.name,
      icon: meta.icon,
      docsUrl: meta.docsUrl,
      models: MODEL_REGISTRY.filter((m) => m.provider === provId),
    };
  }).filter((group) => group.models.length > 0);
}
