import type { LLMProvider } from "@/types/app";

export interface ModelInfo {
  id: string;
  name: string;
  provider: LLMProvider;
  providerName: string;
  providerIcon: string;
  description: string;
  tags: string[];
  contextWindow?: string;
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
  id: "default",
  name: "MediQ Clinical Default",
  provider: "openai",
  providerName: "MediQ Default",
  providerIcon: "/openai.svg",
  description: "Standard clinical reasoning model configured for optimal performance",
  tags: ["Default", "Clinical"],
  contextWindow: "128k",
  isDefault: true,
};

export const MODEL_REGISTRY: ModelInfo[] = [
  DEFAULT_MODEL,
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    providerName: "OpenAI",
    providerIcon: "/openai.svg",
    description: "Flagship high-intelligence multimodal model for text and vision",
    tags: ["Flagship", "Multimodal"],
    contextWindow: "128k",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    providerName: "OpenAI",
    providerIcon: "/openai.svg",
    description: "Fast, cost-efficient model for focused analysis and clinical tasks",
    tags: ["Fast", "Cost-effective"],
    contextWindow: "128k",
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    provider: "openai",
    providerName: "OpenAI",
    providerIcon: "/openai.svg",
    description: "High-speed reasoning model specialized for science, math, and coding",
    tags: ["Reasoning", "Thinking"],
    contextWindow: "200k",
  },
  {
    id: "o1",
    name: "o1",
    provider: "openai",
    providerName: "OpenAI",
    providerIcon: "/openai.svg",
    description: "Frontier reasoning model designed for deep clinical synthesis",
    tags: ["Frontier", "Deep Reasoning"],
    contextWindow: "200k",
  },
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    provider: "anthropic",
    providerName: "Anthropic",
    providerIcon: "/anthropic.svg",
    description: "Hybrid model offering fast standard responses or extended thinking",
    tags: ["Hybrid", "Extended Thinking"],
    contextWindow: "200k",
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    providerName: "Anthropic",
    providerIcon: "/anthropic.svg",
    description: "State-of-the-art vision and language comprehension for medical records",
    tags: ["Flagship", "Vision"],
    contextWindow: "200k",
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    providerName: "Anthropic",
    providerIcon: "/anthropic.svg",
    description: "Fastest Claude model with near-instant responsiveness",
    tags: ["Ultra Fast", "Lightweight"],
    contextWindow: "200k",
  },
  {
    id: "llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    provider: "meta",
    providerName: "Meta",
    providerIcon: "/meta.svg",
    description: "Industry-leading open-weights model with frontier intelligence",
    tags: ["Open Weights", "Flagship"],
    contextWindow: "128k",
  },
  {
    id: "llama-3.1-405b-instruct",
    name: "Llama 3.1 405B Instruct",
    provider: "meta",
    providerName: "Meta",
    providerIcon: "/meta.svg",
    description: "Massive scale frontier model for complex clinical questions",
    tags: ["Frontier", "High Capacity"],
    contextWindow: "128k",
  },
  {
    id: "llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    provider: "meta",
    providerName: "Meta",
    providerIcon: "/meta.svg",
    description: "Ultra-fast low-latency open model for quick lookups",
    tags: ["Fast", "Compact"],
    contextWindow: "128k",
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek-V3",
    provider: "deepseek",
    providerName: "DeepSeek",
    providerIcon: "/deepseek.svg",
    description: "671B parameter MoE architecture with frontier language understanding",
    tags: ["MoE", "Flagship"],
    contextWindow: "64k",
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek-R1",
    provider: "deepseek",
    providerName: "DeepSeek",
    providerIcon: "/deepseek.svg",
    description: "Open reasoning model with transparent chain-of-thought verification",
    tags: ["Reasoning", "Thinking"],
    contextWindow: "64k",
  },
  {
    id: "mistral-large-latest",
    name: "Mistral Large 2",
    provider: "mistral",
    providerName: "Mistral",
    providerIcon: "/mistral.svg",
    description: "Top-tier flagship model with multilingual and reasoning excellence",
    tags: ["Flagship", "128k"],
    contextWindow: "128k",
  },
  {
    id: "mistral-small-latest",
    name: "Mistral Small",
    provider: "mistral",
    providerName: "Mistral",
    providerIcon: "/mistral.svg",
    description: "Cost-efficient enterprise-grade model for rapid processing",
    tags: ["Fast", "Efficient"],
    contextWindow: "128k",
  },
  {
    id: "codestral-latest",
    name: "Codestral",
    provider: "mistral",
    providerName: "Mistral",
    providerIcon: "/mistral.svg",
    description: "Specialized model for code, data schemas and structured medical summaries",
    tags: ["Code", "Structuring"],
    contextWindow: "32k",
  },
  {
    id: "grok-2-latest",
    name: "Grok 2",
    provider: "grok",
    providerName: "Grok",
    providerIcon: "/grok.svg",
    description: "Frontier reasoning model by xAI with deep analytical capabilities",
    tags: ["Frontier", "Reasoning"],
    contextWindow: "128k",
  },
  {
    id: "grok-2-vision-1212",
    name: "Grok 2 Vision",
    provider: "grok",
    providerName: "Grok",
    providerIcon: "/grok.svg",
    description: "Multimodal visual reasoning for charts, clinical scans and diagrams",
    tags: ["Multimodal", "Vision"],
    contextWindow: "32k",
  },
  {
    id: "grok-beta",
    name: "Grok Beta",
    provider: "grok",
    providerName: "Grok",
    providerIcon: "/grok.svg",
    description: "High-speed reasoning model by xAI with real-time knowledge",
    tags: ["Fast", "Analytical"],
    contextWindow: "128k",
  },
];

export const PROVIDER_ORDER: LLMProvider[] = [
  "openai",
  "anthropic",
  "meta",
  "deepseek",
  "mistral",
  "grok",
  "groq",
  "gemini",
];

export const PROVIDER_META: Record<
  LLMProvider,
  { name: string; icon: string; docsUrl: string }
> = {
  openai: {
    name: "OpenAI",
    icon: "/openai.svg",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    name: "Anthropic",
    icon: "/anthropic.svg",
    docsUrl: "https://platform.claude.com/dashboard",
  },
  meta: {
    name: "Meta",
    icon: "/meta.svg",
    docsUrl: "https://www.llama.com",
  },
  deepseek: {
    name: "DeepSeek",
    icon: "/deepseek.svg",
    docsUrl: "https://platform.deepseek.com/api_keys",
  },
  mistral: {
    name: "Mistral",
    icon: "/mistral.svg",
    docsUrl: "https://console.mistral.ai/api-keys",
  },
  grok: {
    name: "Grok",
    icon: "/grok.svg",
    docsUrl: "https://console.x.ai",
  },
  groq: {
    name: "Groq",
    icon: "/groq.svg",
    docsUrl: "https://console.groq.com/keys",
  },
  gemini: {
    name: "Gemini",
    icon: "/gemini.svg",
    docsUrl: "https://aistudio.google.com/app/apikey",
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
      models: MODEL_REGISTRY.filter((m) => m.provider === provId && !m.isDefault),
    };
  }).filter((group) => group.models.length > 0);
}
