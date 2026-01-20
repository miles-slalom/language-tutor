export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface TutorTips {
  corrections: string[]
  vocabulary: string[]
  cultural: string[]
}

export interface ChatRequest {
  message: string
  conversation_history: Message[]
  scenario: string
}

export interface ChatResponse {
  character_response: string
  tutor_tips: TutorTips
  conversation_complete: boolean
}

export interface Scenario {
  setting: string
  objective: string
  conflict: string
  opening_message: string
}

export interface AuthUser {
  userId: string
  email?: string
}
