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
}

export interface ScenarioRequest {
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
