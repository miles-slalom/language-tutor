// Locale types
export interface LocaleVariant {
  code: string;
  country: string;
  flag: string;
  is_default: boolean;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  variants: LocaleVariant[];
}

export interface LocalesResponse {
  languages: Language[];
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface TutorTips {
  corrections: string[]
  vocabulary: string[]
  cultural: string[]
}

export interface ScenarioProposal {
  setting: string
  setting_description: string
  objective: string
  conflict: string
  difficulty: string
  opening_line: string
  character_name: string
  character_personality: string
  hints: string[]
  locale: string
  language_name: string
  country_name: string
}

export interface ScenarioRequest {
  locale: string
  difficulty: string
  preferences?: string
  veto_reason?: string
}

export interface ScenarioResponse {
  scenario: ScenarioProposal
}

export interface ModifyScenarioRequest {
  original_scenario: ScenarioProposal
  modification_request: string
}

export type ArcProgress = 'beginning' | 'rising' | 'climax' | 'resolution'
export type ResolutionStatus = 'success' | 'adapted' | 'graceful_fail'

export interface ChatRequest {
  message: string
  conversation_history: Message[]
  scenario: ScenarioProposal
  exchange_count: number
}

export interface ChatResponse {
  character_response: string
  tutor_tips: TutorTips
  conversation_complete: boolean
  resolution_status?: ResolutionStatus
  arc_progress: ArcProgress
}

export type AppState = 'loading' | 'difficulty_select' | 'scenario_proposal' | 'conversation' | 'summary'

export interface AuthUser {
  userId: string
  email?: string
}
