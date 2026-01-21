# Language Tutor - Product Specification

## Product Vision

An AI-powered conversational language tutor that provides immersive, scenario-based practice for language learners. Rather than drilling vocabulary or grammar rules in isolation, users engage in realistic conversations with AI characters in authentic settings—ordering at a bakery in Paris, negotiating at a market in Mexico City, or checking into a hotel in Berlin.

The application combines:
- **Immersive roleplay** - AI characters with personality in vivid settings
- **Intelligent tutoring** - Real-time feedback on grammar, vocabulary, and cultural nuances
- **Adaptive difficulty** - CEFR-aligned content from A1 to C2
- **Narrative engagement** - Story arcs with conflict and resolution

## Deployment

| Resource | URL |
|----------|-----|
| Application | https://d3blyys2t3r0hm.cloudfront.net |
| API | https://vgxcb7g6al.execute-api.us-east-1.amazonaws.com |

## Phase Roadmap

### Phase 1: Foundation MVP ✅ COMPLETE
- React frontend with Vite and Tailwind CSS
- FastAPI backend deployed on AWS Lambda
- AWS Cognito authentication with email/password
- Password reset flow via email verification
- Claude 3 Sonnet integration via AWS Bedrock
- Basic chat interface with AI responses
- Terraform infrastructure as code

### Phase 2: Scenario System ✅ COMPLETE
- Dynamic scenario generation based on difficulty and locale
- Accept/modify/veto flow for scenario negotiation
- Story arcs with 4-stage structure (beginning → rising → climax → resolution)
- 15 languages with regional variants (fr-FR, fr-CA, es-ES, es-MX, etc.)
- Character personalities and setting descriptions
- Scenario hints for vocabulary preparation
- Conflict/twist hidden from user (emerges naturally in conversation)
- NPC opens conversation, user responds based on their objective

### Phase 3: Intelligent Tutoring ⚠️ PARTIAL
**Completed:**
- Real-time grammar and spelling corrections
- Vocabulary suggestions for next response
- Cultural tips relevant to scenario context
- End-of-conversation summary with resolution status
- Arc progress tracking
- Tutor sidebar with collapsible sections

**Not yet implemented:**
- Detailed CEFR assessment in summary
- Personalized study tips based on errors made during conversation
- Book/resource recommendations

### Phase 4: Adaptive Difficulty ⚠️ PARTIAL
**Completed:**
- CEFR level selection (A1-C2)
- Difficulty-appropriate scenario generation
- Vocabulary complexity matching level

**Not yet implemented:**
- Mid-conversation difficulty adaptation (simplify if user struggles)
- Cross-session level tracking (DynamoDB)
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
│  - Password reset flow   │    │  - /api/scenario/modify      │
│  - JWT tokens            │    │  - /api/chat                 │
└──────────────────────────┘    └──────────────────────────────┘
                                                │
                ┌───────────────────────────────┤
                ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│      DynamoDB            │    │      AWS Bedrock             │
│   (User Profiles)        │    │   (Claude 3 Sonnet)          │
│                          │    │                              │
│  - Table defined         │    │  - Scenario generation       │
│  - Not yet integrated    │    │  - Character responses       │
└──────────────────────────┘    │  - Tutor feedback            │
                                └──────────────────────────────┘
```

### Frontend Components

| Component | Description |
|-----------|-------------|
| `Auth.tsx` | Cognito authentication with sign up, sign in, verification, and password reset |
| `Layout.tsx` | Main application shell, manages app state flow |
| `LocaleSelector.tsx` | Language and regional variant selection |
| `DifficultySelector.tsx` | CEFR level picker (A1-C2) with theme suggestions |
| `ScenarioProposalCard.tsx` | Accept/modify/veto interface (conflict hidden) |
| `ChatArea.tsx` | Conversation interface with message bubbles and arc progress |
| `TutorSidebar.tsx` | Real-time corrections, vocabulary, cultural tips |
| `ScenarioSummary.tsx` | End-of-conversation review with resolution status |

### Backend Modules

| Module | Description |
|--------|-------------|
| `main.py` | FastAPI app with CORS, routers, Lambda handler |
| `routers/chat.py` | POST /api/chat endpoint |
| `routers/scenario.py` | POST /api/scenario/generate, /api/scenario/modify |
| `routers/locales.py` | GET /api/locales |
| `services/bedrock.py` | Claude API integration, prompt engineering |
| `services/auth.py` | JWT token validation from Cognito |
| `models/schemas.py` | Pydantic models for requests/responses |
| `models/locales.py` | Supported languages and variants |

### Integration Tests

| Test Suite | Description |
|------------|-------------|
| `tests/test_api_integration.py` | Health, locales, unauthorized access tests |
| `tests/test_auth_integration.py` | Authenticated scenario generation, modification, and chat flow tests |
| `frontend/e2e/auth.spec.ts` | Playwright tests for authentication UI |
| `frontend/e2e/app.spec.ts` | Playwright tests for main app flow |

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
1. **Beginning (1-2)** - NPC opens conversation, establishes setting
2. **Rising (3-5)** - Conflict becomes apparent, tension increases
3. **Climax (6-8)** - Work toward resolution
4. **Resolution (8-10)** - Natural ending with success, adaptation, or graceful failure

This creates engagement through narrative tension while keeping conversations focused and completable.

### Conversation Flow Design
1. **Scenario presented** - User sees setting, objective, character, and vocabulary hints
2. **Conflict hidden** - The twist/conflict is NOT shown to the user; it emerges naturally
3. **NPC opens** - The AI character speaks first with a greeting/question appropriate to the setting
4. **User responds** - User creates their own opening based on their objective
5. **Conversation continues** - Natural back-and-forth toward resolution

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
  conflict: string             // Hidden from user - "The bakery is out of your first choice"
  difficulty: string           // "B1"
  locale: string               // "fr-FR"
  language_name: string        // "French"
  country_name: string         // "France"
  opening_line: string         // NPC's first line: "Bonjour! Qu'est-ce que je peux..."
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

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Health check, returns service status |
| `/api/locales` | GET | No | Returns all supported languages and variants |
| `/api/scenario/generate` | POST | Yes | Generate new scenario based on difficulty/locale |
| `/api/scenario/modify` | POST | Yes | Modify existing scenario per user request |
| `/api/chat` | POST | Yes | Send message, get character response + tutor tips |

## Supported Languages (15 languages, 30 variants)

| Language | Native Name | Variants |
|----------|-------------|----------|
| French | Français | 🇫🇷 France, 🇧🇪 Belgium, 🇨🇭 Switzerland, 🇨🇦 Canada |
| Spanish | Español | 🇲🇽 Mexico, 🇪🇸 Spain, 🇦🇷 Argentina, 🇨🇴 Colombia, 🇵🇪 Peru, 🇨🇱 Chile |
| Portuguese | Português | 🇧🇷 Brazil, 🇵🇹 Portugal |
| German | Deutsch | 🇩🇪 Germany, 🇦🇹 Austria, 🇨🇭 Switzerland |
| Italian | Italiano | 🇮🇹 Italy, 🇨🇭 Switzerland |
| Dutch | Nederlands | 🇳🇱 Netherlands, 🇧🇪 Belgium |
| Polish | Polski | 🇵🇱 Poland |
| Swedish | Svenska | 🇸🇪 Sweden |
| Danish | Dansk | 🇩🇰 Denmark |
| Norwegian | Norsk | 🇳🇴 Norway |
| Finnish | Suomi | 🇫🇮 Finland |
| Greek | Ελληνικά | 🇬🇷 Greece |
| Czech | Čeština | 🇨🇿 Czech Republic |
| Romanian | Română | 🇷🇴 Romania |
| Hungarian | Magyar | 🇭🇺 Hungary |

## Recent Changes

### 2026-01-21
- Fixed "Auth UserPool not configured" error by correcting Cognito client ID in frontend build
- Fixed "Failed to send message" Bedrock error by filtering leading assistant messages in conversation history
- Fixed opening line bug - NPC now correctly opens conversation, user responds based on objective
- Added password reset flow (forgot password → email code → new password)
- Renamed "French Tutor" to "Language Tutor" throughout the application
- Conflict/twist now hidden from scenario proposal (emerges naturally)
- Created comprehensive integration test suites (backend pytest, frontend Playwright)
- Added detailed documentation (README.md, SPEC.md, frontend/README.md, backend/README.md)
