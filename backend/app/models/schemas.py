from typing import List, Optional
from pydantic import BaseModel, Field


class Message(BaseModel):
    """A single message in the conversation."""
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class TutorTips(BaseModel):
    """Tutor feedback on user's target language."""
    corrections: List[str] = Field(default_factory=list, description="Grammar/spelling corrections")
    vocabulary: List[str] = Field(default_factory=list, description="Helpful vocabulary suggestions")
    cultural: List[str] = Field(default_factory=list, description="Cultural tips and notes")


class ScenarioProposal(BaseModel):
    """A dynamically generated scenario proposal."""
    setting: str = Field(..., description="The scenario setting, e.g., 'A small hotel in Provence'")
    setting_description: str = Field(..., description="Atmospheric details (2-3 sentences)")
    objective: str = Field(..., description="User's goal, e.g., 'Extend your stay by one night'")
    conflict: str = Field(..., description="The challenge, e.g., 'There's a lavender festival and rooms are scarce'")
    difficulty: str = Field(..., description="CEFR level: A1, A2, B1, B2, C1, C2")
    opening_line: str = Field(..., description="Character's first line in target language")
    character_name: str = Field(..., description="Character name, e.g., 'Marie, the receptionist'")
    character_personality: str = Field(..., description="Personality traits, e.g., 'Friendly but stressed'")
    hints: List[str] = Field(default_factory=list, description="Vocabulary/phrases useful for this scenario")
    locale: str = Field(default="fr-FR", description="The locale code this scenario is for")
    language_name: str = Field(default="French", description="Language name, e.g., 'French'")
    country_name: str = Field(default="France", description="Country name, e.g., 'France'")


class ScenarioRequest(BaseModel):
    """Request body for scenario generation."""
    locale: str = Field(default="fr-FR", description="Locale code, e.g., 'fr-FR', 'es-MX', 'de-DE'")
    difficulty: str = Field(default="A1", description="CEFR level")
    preferences: Optional[str] = Field(default=None, description="User theme preferences")
    veto_reason: Optional[str] = Field(default=None, description="Reason for rejecting previous scenario")


class ScenarioResponse(BaseModel):
    """Response containing a scenario proposal."""
    scenario: ScenarioProposal


class ModifyScenarioRequest(BaseModel):
    """Request to modify an existing scenario."""
    original_scenario: ScenarioProposal
    modification_request: str = Field(..., description="What the user wants changed")


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str = Field(..., description="User's message in French")
    conversation_history: List[Message] = Field(default_factory=list, description="Previous messages")
    scenario: ScenarioProposal = Field(..., description="Full scenario object for context")
    exchange_count: int = Field(default=0, description="Track progress toward resolution")


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    character_response: str = Field(..., description="AI character's response in French")
    tutor_tips: TutorTips = Field(..., description="Tutor feedback")
    conversation_complete: bool = Field(default=False, description="Whether scenario is complete")
    resolution_status: Optional[str] = Field(default=None, description="success|adapted|graceful_fail when complete")
    arc_progress: str = Field(default="beginning", description="beginning|rising|climax|resolution")
