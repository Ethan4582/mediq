import type { LLMProvider } from "@/types/app";

export interface ModelInfo {
  id: string;
  name: string;
  provider: LLMProvider;
  providerName: string;
  providerIcon: string;
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
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "openai",
    providerName: "OpenAI",
    providerIcon: "/openai.svg",
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    provider: "openai",
    providerName: "OpenAI",
    providerIcon: "/openai.svg",
  },
  {
    id: "o1",
    name: "o1",
    provider: "openai",
    providerName: "OpenAI",
    providerIcon: "/openai.svg",
  },
  {
    id: "chatgpt-4o-latest",
    name: "ChatGPT-4o",
    provider: "openai",
    providerName: "OpenAI",
    providerIcon: "/openai.svg",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    providerName: "OpenAI",
    providerIcon: "/openai.svg",
  },
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    provider: "anthropic",
    providerName: "Anthropic",
    providerIcon: "/anthropic.svg",
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    providerName: "Anthropic",
    providerIcon: "/anthropic.svg",
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    providerName: "Anthropic",
    providerIcon: "/anthropic.svg",
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    providerName: "Anthropic",
    providerIcon: "/anthropic.svg",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    providerName: "Google Gemini",
    providerIcon: "/gemini.svg",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash-Lite",
    provider: "gemini",
    providerName: "Google Gemini",
    providerIcon: "/gemini.svg",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "gemini",
    providerName: "Google Gemini",
    providerIcon: "/gemini.svg",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "gemini",
    providerName: "Google Gemini",
    providerIcon: "/gemini.svg",
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "groq",
    providerName: "Groq",
    providerIcon: "/groq.svg",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    provider: "groq",
    providerName: "Groq",
    providerIcon: "/groq.svg",
  },
  {
    id: "deepseek-r1-distill-llama-70b",
    name: "DeepSeek R1 Distill 70B",
    provider: "groq",
    providerName: "Groq",
    providerIcon: "/groq.svg",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    provider: "groq",
    providerName: "Groq",
    providerIcon: "/groq.svg",
  },
  {
    id: "gemma2-9b-it",
    name: "Gemma 2 9B",
    provider: "groq",
    providerName: "Groq",
    providerIcon: "/groq.svg",
  },
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    provider: "mistral",
    providerName: "Mistral",
    providerIcon: "/mistral.svg",
  },
  {
    id: "mistral-small-latest",
    name: "Mistral Small",
    provider: "mistral",
    providerName: "Mistral",
    providerIcon: "/mistral.svg",
  },
  {
    id: "codestral-latest",
    name: "Codestral",
    provider: "mistral",
    providerName: "Mistral",
    providerIcon: "/mistral.svg",
  },
  {
    id: "pixtral-large-latest",
    name: "Pixtral Large",
    provider: "mistral",
    providerName: "Mistral",
    providerIcon: "/mistral.svg",
  },
  {
    id: "ministral-8b-latest",
    name: "Ministral 8B",
    provider: "mistral",
    providerName: "Mistral",
    providerIcon: "/mistral.svg",
  },
  {
    id: "grok-2-latest",
    name: "Grok 2",
    provider: "grok",
    providerName: "xAI",
    providerIcon: "/grok.svg",
  },
  {
    id: "grok-2-vision-1212",
    name: "Grok 2 Vision",
    provider: "grok",
    providerName: "xAI",
    providerIcon: "/grok.svg",
  },
  {
    id: "grok-beta",
    name: "Grok Beta",
    provider: "grok",
    providerName: "xAI",
    providerIcon: "/grok.svg",
  },
];

export const PROVIDER_ORDER: LLMProvider[] = [
  "openai",
  "anthropic",
  "gemini",
  "groq",
  "mistral",
  "grok",
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
  gemini: {
    name: "Google Gemini",
    icon: "/gemini.svg",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  groq: {
    name: "Groq",
    icon: "/groq.svg",
    docsUrl: "https://console.groq.com/keys",
  },
  mistral: {
    name: "Mistral",
    icon: "/mistral.svg",
    docsUrl: "https://console.mistral.ai/api-keys",
  },
  grok: {
    name: "xAI",
    icon: "/grok.svg",
    docsUrl: "https://console.x.ai",
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
