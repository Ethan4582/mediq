import { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export type KeyType = "ocr" | "llm"

export type LLMProvider = "groq" | "openai" | "anthropic" | "mistral" | "gemini"

export type SessionStatus = "pending" | "processing" | "done" | "error"

export type MessageRole = "user" | "assistant"

export type OcrStatus = "pending" | "processing" | "done" | "failed"

export type AppSession = Tables<'sessions'>

export type Message = Tables<'messages'>

export type Document = Tables<'documents'>

export type Folder = Tables<'folders'>

export type Summary = Tables<'drafts'>

export type SessionWithFolder = AppSession & {
  folders: Folder | null
}

export interface ApiKey {
  id: string
  user_id: string
  provider: LLMProvider
  key_type: KeyType
  is_active: boolean
  key_last4?: string | null
  created_at: string
}

export interface UserKeyStatus {
  has_mistral_key: boolean
  has_llm_key: boolean
  active_llm_provider: string | null
}

export interface TokenUsage {
  id: string
  user_id: string
  session_id: string
  provider: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  estimated_cost_usd: number
  call_type: 'ocr' | 'summary' | 'qa' | 'entity_extraction'
  created_at: string
}

export interface UsageAnalytics {
  period_days: number
  total_tokens: number
  total_cost_usd: number
  call_count: number
  by_provider: Record<string, {
    total_tokens: number
    total_cost_usd: number
    call_count: number
  }>
  by_call_type: Record<string, {
    total_tokens: number
    total_cost_usd: number
    call_count: number
  }>
  daily_usage: Array<{
    date: string
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    cost_usd: number
    call_count: number
  }>
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
  status: string
  page_count: number
  provider_used: string | null
}

export interface ClinicalMedication {
  name: string
  dose?: string
  dosage?: string
  route?: string
  frequency?: string
  status?: "continued" | "started" | "stopped" | "modified" | "unchanged"
  reason?: string
}

export interface ClinicalVitals {
  pr?: string
  bp?: string
  rr?: string
  spo2?: string
  temp?: string
}

export interface ClinicalConflict {
  field: string
  description?: string
  source_a?: string
  source_b?: string
  sources?: string[]
}

export interface ClinicalFlags {
  conflicts?: ClinicalConflict[]
  conflicting_fields?: ClinicalConflict[]
  missing_fields?: string[]
  critical_flags?: Array<{ message: string; severity?: "warning" | "critical" }>
  drug_interactions?: Array<{ drugs: string[]; severity: string; description: string }>
}

export interface ClinicalPatientInfo {
  name?: string
  age?: number | string
  gender?: string
  mrn?: string
  admission_date?: string
  discharge_date?: string
  [key: string]: unknown
}

export interface ClinicalDraft {
  id?: string
  created_at?: string
  patient_info?: ClinicalPatientInfo
  diagnoses?: {
    principal_diagnosis?: string
    secondary_diagnoses?: string[]
    admission_diagnosis?: string
  }
  course?: {
    summary?: string
    inpatient_events?: string[]
  }
  medications?: {
    admission?: ClinicalMedication[]
    discharge?: ClinicalMedication[]
    reconciled?: ClinicalMedication[]
  }
  vitals?: ClinicalVitals
  investigations?: {
    labs?: Record<string, string>
    imaging?: string[]
  }
  follow_up?: {
    instructions?: string
    appointments?: string[]
  }
  flags?: ClinicalFlags
  source_citations?: Record<string, string[]>
}

export interface OcrResultData {
  fileName: string
  pageCount: number
  chunkCount: number
  rawText: string
}
