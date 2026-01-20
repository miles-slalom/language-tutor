from typing import List, Optional
from pydantic import BaseModel, Field


class Message(BaseModel):
    """A single message in the conversation."""
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class TutorTips(BaseModel):
    """Tutor feedback on user's French."""
    corrections: List[str] = Field(default_factory=list, description="Grammar/spelling corrections")
    vocabulary: List[str] = Field(default_factory=list, description="Helpful vocabulary suggestions")
    cultural: List[str] = Field(default_factory=list, description="Cultural tips and notes")


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str = Field(..., description="User's message in French")
    conversation_history: List[Message] = Field(default_factory=list, description="Previous messages")
    scenario: str = Field(
        default="You're at a small boulangerie in Lyon. You want to buy croissants for your family, but the baker seems to be having a bad day and is almost out of pastries. Navigate this interaction politely and get what you need.",
        description="Scenario description"
    )


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    character_response: str = Field(..., description="AI character's response in French")
    tutor_tips: TutorTips = Field(..., description="Tutor feedback")
    conversation_complete: bool = Field(default=False, description="Whether scenario is complete")
