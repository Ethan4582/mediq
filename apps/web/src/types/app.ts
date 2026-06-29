export type KeyType = "ocr" | "llm"
export type LLMProvider = "groq" | "openai" | "anthropic" | "mistral"
export type SessionStatus = "pending" | "processing" | "done" | "error"
export type MessageRole = "user" | "assistant"
export type OcrStatus = "pending" | "processing" | "done" | "failed"

export interface ApiKey {
  id: string
  provider: LLMProvider
  key_type: KeyType
  key_last4: string
  is_active: boolean
  created_at: string
}

export interface UserKeyStatus {
  has_mistral_key: boolean
  has_llm_key: boolean
  active_llm_provider: LLMProvider | null
}

export interface AppSession {
  id: string
  title: string | null
  patient_name: string | null
  status: SessionStatus
  created_at: string
  is_pinned?: boolean
  folder_id?: string | null
}

export interface Folder {
  id: string
  name: string
  created_at: string
}

export interface Message {
  id: string
  session_id: string
  role: MessageRole
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface DraftContent {
  sections: DraftSection[]
  flags: Flag[]
  missing_fields: string[]
}

export interface DraftSection {
  section_type: string
  fields: Record<string, unknown>
  source_citations: string[]
  confidence: "high" | "low" | "unreadable"
}

export interface Flag {
  type: "conflict" | "missing" | "critical"
  message: string
  field?: string
}

export interface OverviewStats {
  total_sessions: number
  total_runs: number
  total_documents: number
  total_pages: number
  total_drafts: number
  runs_today: number
  runs_this_week: number
  sessions_by_status: Record<string, number>
}

export interface ActivityEntry {
  date: string
  runs: number
  pages: number
}

export interface RecentSession {
  session_id: string
  title: string | null
  created_at: string
  status: SessionStatus
  page_count: number
  provider_used: string | null
}
