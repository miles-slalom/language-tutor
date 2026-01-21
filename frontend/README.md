# Language Tutor - Frontend

React-based frontend for the Language Tutor application. Built with Vite, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```
   VITE_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com
   VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
   VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API Gateway URL |
| `VITE_COGNITO_USER_POOL_ID` | AWS Cognito User Pool ID |
| `VITE_COGNITO_CLIENT_ID` | AWS Cognito App Client ID |
| `VITE_COGNITO_DOMAIN` | (Optional) Cognito hosted UI domain for OAuth |

## Development

Start the development server:
```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Build

Create a production build:
```bash
npm run build
```

Output is in the `dist/` directory, ready for deployment to S3/CloudFront.

## Components

| Component | Description |
|-----------|-------------|
| `Auth.tsx` | Authentication UI - sign in, sign up, email verification, password reset |
| `Layout.tsx` | Main application shell with header and content areas |
| `LocaleSelector.tsx` | Language and regional variant dropdown selector |
| `DifficultySelector.tsx` | CEFR level picker (A1 through C2) |
| `ScenarioProposalCard.tsx` | Displays generated scenario with accept/modify/veto buttons |
| `ChatArea.tsx` | Main conversation interface with message bubbles and input |
| `TutorSidebar.tsx` | Displays real-time corrections, vocabulary, and cultural tips |
| `ScenarioSummary.tsx` | End-of-conversation summary with resolution status |

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **AWS Amplify** - Cognito authentication client
