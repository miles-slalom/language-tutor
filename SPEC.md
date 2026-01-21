# Language Tutor - Product Specification

## Product Vision

An AI-powered conversational language tutor that provides immersive, scenario-based practice for language learners. Rather than drilling vocabulary or grammar rules in isolation, users engage in realistic conversations with AI characters in authentic settings—ordering at a bakery in Paris, negotiating at a market in Mexico City, or checking into a hotel in Tokyo.

The application combines:
- **Immersive roleplay** - AI characters with personality in vivid settings
- **Intelligent tutoring** - Real-time feedback on grammar, vocabulary, and cultural nuances
- **Adaptive difficulty** - CEFR-aligned content from A1 to C2
- **Narrative engagement** - Story arcs with conflict and resolution

## Phase Roadmap

### Phase 1: Foundation MVP ✅ COMPLETE
- React frontend with Vite and Tailwind CSS
- FastAPI backend deployed on AWS Lambda
- AWS Cognito authentication with Google OAuth
- Claude 3 Sonnet integration via AWS Bedrock
- Basic chat interface with AI responses

### Phase 2: Scenario System ✅ COMPLETE
- Dynamic scenario generation based on difficulty and locale
- Accept/modify/veto flow for scenario negotiation
- Story arcs with 4-stage structure (beginning → rising → climax → resolution)
- 15 languages with regional variants (fr-FR, fr-CA, es-ES, es-MX, etc.)
- Character personalities and setting descriptions
- Scenario hints for vocabulary preparation

### Phase 3: Intelligent Tutoring ⚠️ PARTIAL
**Completed:**
- Real-time grammar and spelling corrections
- Vocabulary suggestions for next response
- Cultural tips relevant to scenario context
- End-of-conversation summary with resolution status
- Arc progress tracking

**Not yet implemented:**
- Detailed CEFR assessment in summary
- Personalized study tips based on errors
- Book/resource recommendations

### Phase 4: Adaptive Difficulty ⚠️ PARTIAL
**Completed:**
- CEFR level selection (A1-C2)
- Difficulty-appropriate scenario generation
- Vocabulary complexity matching level

**Not yet implemented:**
- Mid-conversation difficulty adaptation
- Cross-session level tracking
- Automatic level inference from user performance

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                          │
│                   (d3blyys2t3r0hm.cloudfront.net)             │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│      S3 Bucket           │    │       API Gateway            │
│   (React Frontend)       │    │  (vgxcb7g6al.execute-api...) │
│                          │    └──────────────────────────────┘
│  - React 18 + Vite       │                    │
│  - Tailwind CSS          │                    ▼
│  - AWS Amplify Auth      │    ┌──────────────────────────────┐
└──────────────────────────┘    │       Lambda Function        │
                                │    (FastAPI + Mangum)        │
┌──────────────────────────┐    │                              │
│     Cognito User Pool    │    │  - /api/health               │
│                          │    │  - /api/locales              │
│  - Email/password auth   │    │  - /api/scenario/generate    │
│  - Google OAuth          │    │  - /api/scenario/modify      │
│  - JWT tokens            │    │  - /api/chat                 │
└──────────────────────────┘    └──────────────────────────────┘
                                                │
                                                ▼
                                ┌──────────────────────────────┐
                                │      AWS Bedrock             │
                                │   (Claude 3 Sonnet)          │
                                │                              │
                                │  - Scenario generation       │
                                │  - Character responses       │
                                │  - Tutor feedback            │
                                └──────────────────────────────┘
```

### Frontend (React + Vite + Tailwind)
- **Auth.tsx** - Cognito authentication with sign up, sign in, verification, and password reset
- **Layout.tsx** - Main application shell
- **LocaleSelector.tsx** - Language and regional variant selection
- **DifficultySelector.tsx** - CEFR level picker (A1-C2)
- **ScenarioProposalCard.tsx** - Accept/modify/veto interface
- **ChatArea.tsx** - Conversation interface with message bubbles
- **TutorSidebar.tsx** - Real-time corrections, vocabulary, cultural tips
- **ScenarioSummary.tsx** - End-of-conversation review

### Backend (FastAPI + Mangum)
- **main.py** - FastAPI app with CORS, routers, Lambda handler
- **routers/chat.py** - POST /api/chat endpoint
- **routers/scenario.py** - POST /api/scenario/generate, /api/scenario/modify
- **routers/locales.py** - GET /api/locales
- **services/bedrock.py** - Claude API integration, prompt engineering
- **services/auth.py** - JWT token validation
- **models/schemas.py** - Pydantic models for requests/responses
- **models/locales.py** - Supported languages and variants

### AI (Claude 3 Sonnet via Bedrock)
- Dual-role prompting: Claude plays character AND tutor in single response
- JSON-structured responses for reliable parsing
- Story arc guidance in system prompt
- Locale-aware vocabulary and expressions

## Key Design Decisions

### Why AWS Bedrock over direct Claude API?
- **AWS-native integration** - No API key management, uses IAM roles
- **Simplified billing** - Consolidated AWS billing
- **VPC integration** - Can run in private subnets if needed
- **Compliance** - Inherits AWS compliance certifications

### Locale System Design
Supporting regional variants (not just languages) because:
- **Vocabulary differs** - Québécois French uses "char" for car, Mexican Spanish uses "camión" for bus
- **Cultural context** - Scenarios set IN the region (Paris vs Montreal, Madrid vs Mexico City)
- **Expressions** - Argentine Spanish uses voseo, Brazilian Portuguese differs from European

**Structure:**
```
Language (French)
├── Variant (France) → fr-FR
├── Variant (Canada) → fr-CA
├── Variant (Belgium) → fr-BE
└── Variant (Switzerland) → fr-CH
```

### Story Arc Structure
4-stage narrative over 5-10 exchanges:
1. **Beginning (1-2)** - Establish setting, introduce character, hint at conflict
2. **Rising (3-5)** - Conflict becomes apparent, tension increases
3. **Climax (6-8)** - Work toward resolution
4. **Resolution (8-10)** - Natural ending with success, adaptation, or graceful failure

This creates engagement through narrative tension while keeping conversations focused and completable.

### Dual-Role Prompting
Single API call produces both:
1. **Character response** - In-character dialogue in target language
2. **Tutor feedback** - Corrections, vocabulary, cultural tips in English

Benefits:
- Contextual awareness (tutor sees what character said)
- Reduced latency (one API call vs two)
- Coherent experience (feedback relates to conversation)

### Scenario Negotiation Flow
Users aren't forced into scenarios—they can:
1. **Accept** - Start conversation with proposed scenario
2. **Modify** - Request changes (different setting, easier vocabulary, etc.)
3. **Veto** - Reject entirely, optionally explain why, get new proposal

This provides agency while maintaining AI-driven creativity.

## Data Models

### ScenarioProposal
```typescript
{
  setting: string              // "A bustling bakery"
  setting_description: string  // "The morning sun streams through..."
  objective: string            // "Order a specific pastry for a friend's birthday"
  conflict: string             // "The bakery is out of your first choice"
  difficulty: string           // "B1"
  locale: string               // "fr-FR"
  language_name: string        // "French"
  country_name: string         // "France"
  opening_line: string         // "Bonjour! Qu'est-ce que je peux..."
  character_name: string       // "Marie, the baker"
  character_personality: string // "Warm but busy, speaks quickly"
  hints: string[]              // ["croissant", "tarte aux pommes", ...]
}
```

### ChatRequest
```typescript
{
  message: string                    // User's message in target language
  conversation_history: Message[]    // Previous messages
  scenario: ScenarioProposal         // Active scenario
  exchange_count: number             // For arc tracking
}
```

### ChatResponse
```typescript
{
  character_response: string    // Character's reply in target language
  tutor_tips: {
    corrections: string[]       // Grammar/spelling fixes
    vocabulary: string[]        // Helpful words for next response
    cultural: string[]          // Cultural context tips
  }
  conversation_complete: boolean
  resolution_status: "success" | "adapted" | "graceful_fail" | null
  arc_progress: "beginning" | "rising" | "climax" | "resolution"
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check, returns service status |
| `/api/locales` | GET | Returns all supported languages and variants |
| `/api/scenario/generate` | POST | Generate new scenario based on difficulty/locale |
| `/api/scenario/modify` | POST | Modify existing scenario per user request |
| `/api/chat` | POST | Send message, get character response + tutor tips |

## Supported Locales

| Language | Variants |
|----------|----------|
| French | France (fr-FR), Canada (fr-CA), Belgium (fr-BE), Switzerland (fr-CH) |
| Spanish | Spain (es-ES), Mexico (es-MX), Argentina (es-AR), Colombia (es-CO) |
| German | Germany (de-DE), Austria (de-AT), Switzerland (de-CH) |
| Italian | Italy (it-IT), Switzerland (it-CH) |
| Portuguese | Portugal (pt-PT), Brazil (pt-BR) |
| Japanese | Japan (ja-JP) |
| Korean | Korea (ko-KR) |
| Chinese | Simplified (zh-CN), Traditional (zh-TW) |
| Arabic | Standard (ar-SA), Egyptian (ar-EG) |
| Russian | Russia (ru-RU) |
| Dutch | Netherlands (nl-NL), Belgium (nl-BE) |
| Swedish | Sweden (sv-SE) |
| Norwegian | Norway (nb-NO) |
| Danish | Denmark (da-DK) |
| Polish | Poland (pl-PL) |
