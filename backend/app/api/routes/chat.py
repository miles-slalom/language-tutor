from fastapi import APIRouter, HTTPException

from app.models.chat import ChatRequest, ChatResponse
from app.services.llm import get_llm_provider

router = APIRouter()

FRENCH_TUTOR_SYSTEM_PROMPT = """You are a friendly French conversation partner. Engage in natural French conversation with the user.
- Respond only in French
- Keep responses conversational and natural
- Adjust your vocabulary and complexity based on how the user writes
- Be encouraging and patient
- If the user writes in English, gently encourage them to try in French"""


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Send a message to the French tutor and get a response.

    The endpoint maintains conversation context by accepting the full
    message history and returns the assistant's response.
    """
    try:
        llm = get_llm_provider("bedrock")
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        response_text = await llm.generate_response(
            messages=messages, system_prompt=FRENCH_TUTOR_SYSTEM_PROMPT
        )
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate response: {str(e)}"
        )
