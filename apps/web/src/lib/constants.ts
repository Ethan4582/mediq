export const APP_NAME = "MediQ"

export const ROUTES = {
  LANDING:   "/",
  AUTH:      "/auth",
  CHAT:      "/chat",
  ANALYTICS: "/analytics",
  API_KEYS:  "/api-keys",
  PROFILE:   "/profile",
} as const

export const PROVIDERS = {
  groq:      { name: "Groq",      type: "llm",  docsUrl: "https://console.groq.com/keys" },
  openai:    { name: "OpenAI",    type: "llm",  docsUrl: "https://platform.openai.com/api-keys" },
  anthropic: { name: "Anthropic", type: "llm",  docsUrl: "https://console.anthropic.com/keys" },
  mistral:   { name: "Mistral",   type: "both", docsUrl: "https://console.mistral.ai/api-keys" },
} as const

export const REQUIRED_KEYS = {
  ocr: "mistral",
  llm: ["groq", "openai", "anthropic", "mistral"],
} as const

export const UPLOAD_LIMITS = {
  maxPages:  100,
  maxSizeMb: 20,
  maxFiles:  5,
} as const

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
