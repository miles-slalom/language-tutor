import logging

from fastapi import APIRouter, HTTPException, Request

from app.models.schemas import ChatRequest, ChatResponse, TutorTips
from app.services.auth import get_user_id_from_request
from app.services.bedrock import get_chat_response

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: Request, chat_request: ChatRequest) -> ChatResponse:
    """
    Process a chat message and return AI character response with tutor feedback.

    The user sends a message in French, and the AI responds as the character
    in the scenario while also providing tutor tips for improvement.
    """
    user_id = get_user_id_from_request(request)
    logger.info(f"Chat request from user: {user_id}")

    try:
        response_data = await get_chat_response(
            user_message=chat_request.message,
            conversation_history=chat_request.conversation_history,
            scenario=chat_request.scenario
        )

        tutor_tips = TutorTips(
            corrections=response_data.get("tutor_tips", {}).get("corrections", []),
            vocabulary=response_data.get("tutor_tips", {}).get("vocabulary", []),
            cultural=response_data.get("tutor_tips", {}).get("cultural", [])
        )

        return ChatResponse(
            character_response=response_data.get("character_response", ""),
            tutor_tips=tutor_tips,
            conversation_complete=response_data.get("conversation_complete", False)
        )

    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat request. Please try again."
        )
