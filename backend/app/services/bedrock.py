import json
import logging
from typing import List, Optional

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


def build_scenario_generation_prompt(
    difficulty: str,
    preferences: Optional[str] = None,
    veto_reason: Optional[str] = None
) -> str:
    """Build system prompt for scenario generation."""
    prompt = f"""You are a creative French language learning scenario designer. Generate an immersive, story-driven scenario for a student at {difficulty} level.

Each scenario MUST have:
1. A vivid SETTING (bakery, train station, hotel, village market, museum, etc.)
2. A clear OBJECTIVE the learner must achieve
3. A CONFLICT or TWIST that creates interesting tension
4. A CHARACTER with personality (name, role, demeanor)
5. Potential for RESOLUTION (success, adaptation, or graceful failure)

The scenario should:
- Be completable in 5-10 exchanges
- Have vocabulary appropriate for {difficulty} level
- Include cultural authenticity (French customs, expressions)
- Be engaging with mild drama/humor

"""
    if veto_reason:
        prompt += f"The user rejected a previous scenario because: {veto_reason}. Generate something different.\n"
    if preferences:
        prompt += f"The user prefers: {preferences}\n"

    prompt += """
Respond ONLY with valid JSON in this exact format:
{
    "setting": "Brief location name",
    "setting_description": "2-3 sentences painting the scene with sensory details",
    "objective": "What the learner needs to accomplish",
    "conflict": "The twist or obstacle they'll face",
    "difficulty": \"""" + difficulty + """\",
    "opening_line": "The character's first line in French (appropriate to difficulty)",
    "character_name": "Name and role",
    "character_personality": "Brief personality description",
    "hints": ["3-5 useful vocabulary words or phrases for this scenario"]
}"""
    return prompt


async def generate_scenario(
    difficulty: str,
    preferences: Optional[str] = None,
    veto_reason: Optional[str] = None
) -> dict:
    """
    Generate a creative scenario proposal using Claude via Bedrock.

    Args:
        difficulty: CEFR level (A1, A2, B1, B2, C1, C2)
        preferences: Optional user theme preferences
        veto_reason: Optional reason why previous scenario was rejected

    Returns:
        dict matching ScenarioProposal structure
    """
    system_prompt = build_scenario_generation_prompt(difficulty, preferences, veto_reason)

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": "Generate a new French language learning scenario."}
        ]
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

        parsed = parse_response(response_text)

        if "setting" not in parsed:
            logger.error(f"Invalid scenario response: {response_text}")
            raise ValueError("Generated scenario missing required fields")

        return parsed

    except ClientError as e:
        logger.error(f"Bedrock API error in generate_scenario: {e}")
        raise
    except Exception as e:
        logger.error(f"Error generating scenario: {e}")
        raise


def build_modify_scenario_prompt(original_scenario: dict, modification_request: str) -> str:
    """Build system prompt for scenario modification."""
    hints_str = ", ".join(original_scenario.get("hints", []))

    return f"""You are modifying a French language learning scenario based on user feedback.

ORIGINAL SCENARIO:
Setting: {original_scenario.get("setting", "")}
Description: {original_scenario.get("setting_description", "")}
Objective: {original_scenario.get("objective", "")}
Conflict: {original_scenario.get("conflict", "")}
Difficulty: {original_scenario.get("difficulty", "")}
Character: {original_scenario.get("character_name", "")} - {original_scenario.get("character_personality", "")}
Opening Line: {original_scenario.get("opening_line", "")}
Hints: {hints_str}

USER'S MODIFICATION REQUEST: {modification_request}

Adjust the scenario while keeping the same difficulty level and overall structure unless specifically asked to change them.

Respond ONLY with valid JSON in the same format as the original scenario:
{{
    "setting": "Brief location name",
    "setting_description": "2-3 sentences painting the scene with sensory details",
    "objective": "What the learner needs to accomplish",
    "conflict": "The twist or obstacle they'll face",
    "difficulty": "{original_scenario.get("difficulty", "B1")}",
    "opening_line": "The character's first line in French",
    "character_name": "Name and role",
    "character_personality": "Brief personality description",
    "hints": ["3-5 useful vocabulary words or phrases for this scenario"]
}}"""


async def modify_scenario(
    original_scenario: dict,
    modification_request: str
) -> dict:
    """
    Modify an existing scenario based on user feedback.

    Args:
        original_scenario: The original ScenarioProposal as dict
        modification_request: What the user wants changed

    Returns:
        dict matching ScenarioProposal structure (modified)
    """
    system_prompt = build_modify_scenario_prompt(original_scenario, modification_request)

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": f"Please modify the scenario as requested: {modification_request}"}
        ]
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

        parsed = parse_response(response_text)

        if "setting" not in parsed:
            logger.error(f"Invalid modified scenario response: {response_text}")
            raise ValueError("Modified scenario missing required fields")

        return parsed

    except ClientError as e:
        logger.error(f"Bedrock API error in modify_scenario: {e}")
        raise
    except Exception as e:
        logger.error(f"Error modifying scenario: {e}")
        raise
