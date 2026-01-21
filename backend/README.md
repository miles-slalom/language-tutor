# Language Tutor - Backend

FastAPI backend for the Language Tutor application. Integrates with Claude 3 Sonnet via AWS Bedrock for AI-powered language tutoring.

## Prerequisites

- Python 3.11+
- AWS account with Bedrock access (Claude 3 Sonnet enabled)
- AWS credentials configured (`~/.aws/credentials` or environment variables)

## Setup

1. **Create virtual environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure AWS credentials**

   Ensure your AWS credentials have access to Bedrock:
   ```bash
   aws configure
   ```

   Or set environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   ```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_REGION` | `us-east-1` | AWS region for Bedrock |

## Local Development

Start the development server:
```bash
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check - returns `{"status": "healthy"}` |
| `/api/locales` | GET | List all supported languages and regional variants |
| `/api/scenario/generate` | POST | Generate a new scenario based on difficulty and locale |
| `/api/scenario/modify` | POST | Modify an existing scenario based on user feedback |
| `/api/chat` | POST | Send a message, receive character response and tutor tips |

## AI Model

- **Model:** Claude 3 Sonnet (`anthropic.claude-3-sonnet-20240229-v1:0`)
- **Provider:** AWS Bedrock
- **Features:** Scenario generation, character roleplay, grammar correction, vocabulary suggestions, cultural tips

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, routers, Lambda handler
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py       # Pydantic request/response models
│   │   └── locales.py       # Supported languages and variants
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── chat.py          # /api/chat endpoint
│   │   ├── scenario.py      # /api/scenario/* endpoints
│   │   └── locales.py       # /api/locales endpoint
│   └── services/
│       ├── __init__.py
│       ├── auth.py          # JWT token validation
│       └── bedrock.py       # Claude API integration
├── requirements.txt
├── build_lambda.sh          # Lambda deployment package builder
└── Dockerfile               # Container build (for local testing)
```

## Lambda Deployment

Build the Lambda deployment package:
```bash
chmod +x build_lambda.sh
./build_lambda.sh
```

This creates `lambda.zip` containing the application code and dependencies, ready for upload to AWS Lambda.

## Testing Endpoints

Using curl:
```bash
# Health check
curl http://localhost:8000/api/health

# Get supported locales
curl http://localhost:8000/api/locales

# Generate scenario (requires valid auth in production)
curl -X POST http://localhost:8000/api/scenario/generate \
  -H "Content-Type: application/json" \
  -d '{"difficulty": "B1", "locale": "fr-FR"}'
```
