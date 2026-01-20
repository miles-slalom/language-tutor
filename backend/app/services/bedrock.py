import json
import logging
from typing import List

import boto3
from botocore.exceptions import ClientError

from app.models.schemas import Message

logger = logging.getLogger(__name__)

bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")

MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"


def build_system_prompt(scenario: str) -> str:
    """Build the system prompt for Claude with dual roles."""
    return f"""You are playing a character in a French language learning scenario. You have two roles:

1. CHARACTER ROLE: {scenario}
   - Respond in French as the character
   - Stay in character throughout the conversation
   - Keep responses 1-3 sentences, natural and conversational
   - Be responsive to what the user says

2. TUTOR ROLE: Analyze the user's French and provide helpful feedback.
   - Identify grammar or spelling errors
   - Suggest useful vocabulary for their next response
   - Provide cultural tips when relevant to the scenario

IMPORTANT: Always respond with valid JSON in this exact format:
{{
  "character_response": "Your in-character French response here",
  "tutor_tips": {{
    "corrections": ["List any grammar/spelling corrections, or empty array if none"],
    "vocabulary": ["Helpful vocabulary words/phrases for their next response"],
    "cultural": ["Cultural tips if relevant, or empty array if none"]
  }},
  "conversation_complete": false
}}

Set "conversation_complete" to true only when the scenario reaches a natural end (e.g., transaction complete, goodbye exchanged).

Respond ONLY with the JSON object, no other text."""


def build_messages(
    user_message: str,
    conversation_history: List[Message]
) -> List[dict]:
    """Build the messages array for Claude API."""
    messages = []

    for msg in conversation_history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    messages.append({
        "role": "user",
        "content": user_message
    })

    return messages


def parse_response(response_text: str) -> dict:
    """Parse Claude's response, handling potential JSON issues."""
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        start = response_text.find("{")
        end = response_text.rfind("}") + 1
        if start != -1 and end > start:
            try:
                return json.loads(response_text[start:end])
            except json.JSONDecodeError:
                pass

        logger.error(f"Failed to parse response: {response_text}")
        return {
            "character_response": response_text,
            "tutor_tips": {
                "corrections": [],
                "vocabulary": [],
                "cultural": []
            },
            "conversation_complete": False
        }


async def get_chat_response(
    user_message: str,
    conversation_history: List[Message],
    scenario: str
) -> dict:
    """
    Get a chat response from Claude via Bedrock.

    Args:
        user_message: The user's message in French
        conversation_history: Previous messages in the conversation
        scenario: The scenario description

    Returns:
        dict with character_response, tutor_tips, and conversation_complete
    """
    system_prompt = build_system_prompt(scenario)
    messages = build_messages(user_message, conversation_history)

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "system": system_prompt,
        "messages": messages
    }

    try:
        response = bedrock_runtime.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_body)
        )

        response_body = json.loads(response["body"].read())
        response_text = response_body["content"][0]["text"]

        return parse_response(response_text)

    except ClientError as e:
        logger.error(f"Bedrock API error: {e}")
        raise
    except Exception as e:
        logger.error(f"Error getting chat response: {e}")
        raise
