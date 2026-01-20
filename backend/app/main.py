from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.routers import chat, scenario, locales

app = FastAPI(
    title="French Tutor API",
    description="Backend API for French Language Tutor application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configured via CloudFront in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(scenario.router, prefix="/api", tags=["scenario"])
app.include_router(locales.router)


@app.get("/api/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "french-tutor-api"}


# Lambda handler via Mangum
handler = Mangum(app, lifespan="off")
