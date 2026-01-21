# Language Tutor

An AI-powered conversational language learning application that immerses users in realistic scenarios to practice speaking and comprehension. Built with React, FastAPI, and Claude 3 Sonnet via AWS Bedrock.

## 🌐 Live Demo

- **Application:** https://d3blyys2t3r0hm.cloudfront.net
- **API Endpoint:** https://vgxcb7g6al.execute-api.us-east-1.amazonaws.com

## ✨ Features

- **15 Languages Supported** - French, Spanish, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic, Russian, Dutch, Swedish, Norwegian, Danish, and Polish with regional variants
- **CEFR Difficulty Levels** - Choose from A1 (Beginner) to C2 (Mastery) to match your proficiency
- **Dynamic Scenario Generation** - AI creates immersive, story-driven scenarios (bakery, train station, hotel, etc.)
- **Scenario Negotiation** - Accept, modify, or veto proposed scenarios for user agency
- **Story Arcs** - 4-stage narrative structure (beginning, rising, climax, resolution) over 5-10 exchanges
- **Real-Time Tutoring** - Grammar corrections, vocabulary suggestions, and cultural tips after each response
- **Conversation Summary** - End-of-scenario review with resolution status and learning highlights

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- AWS account with Bedrock access

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd language-tutor
   ```

2. **Set up the backend** - See [backend/README.md](./backend/README.md)

3. **Set up the frontend** - See [frontend/README.md](./frontend/README.md)

## 🏗️ Deployment

The application is deployed to AWS using Terraform. Infrastructure includes:
- Lambda (FastAPI backend via Mangum)
- API Gateway (HTTP API)
- S3 + CloudFront (React frontend)
- Cognito (Authentication with Google OAuth)
- DynamoDB (Future: conversation storage)

```bash
cd terraform
terraform init
terraform apply
```

See [SPEC.md](./SPEC.md) for detailed architecture and design decisions.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11, Mangum (Lambda adapter) |
| AI | Claude 3 Sonnet via AWS Bedrock |
| Auth | AWS Cognito with Google OAuth |
| Infrastructure | Terraform, AWS (Lambda, API Gateway, S3, CloudFront) |

## 📖 Documentation

- [SPEC.md](./SPEC.md) - Detailed product specification and architecture
- [frontend/README.md](./frontend/README.md) - Frontend setup and development
- [backend/README.md](./backend/README.md) - Backend setup and API documentation

## 📄 License

MIT
