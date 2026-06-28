export type Tier = "free" | "byok" | "owner"
export type SessionStatus = "pending" | "processing" | "done" | "error"
export type MessageRole = "user" | "assistant"
export type OcrStatus = "pending" | "processing" | "done" | "failed"

export interface AppSession {
  id: string
  title: string | null
  patient_name: string | null
  status: SessionStatus
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

export interface Draft {
  id: string
  session_id: string
  content: DraftContent
  edited_content: DraftContent | null
  version: number
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
