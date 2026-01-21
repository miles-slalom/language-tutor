import json
import logging
from typing import List, Optional

import boto3
from botocore.exceptions import ClientError

from app.models.schemas import Message
from app.models.locales import get_locale_info

logger = logging.getLogger(__name__)

bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")

MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"


def build_system_prompt(scenario: dict, exchange_count: int) -> str:
    """Build the system prompt for Claude with dual roles and arc guidance."""
    language_name = scenario.get('language_name', 'French')
    country_name = scenario.get('country_name', 'France')
    locale = scenario.get('locale', 'fr-FR')

    if exchange_count <= 2:
        arc_stage = "beginning"
        arc_guidance = "Establish the situation, hint at the conflict"
    elif exchange_count <= 5:
        arc_stage = "rising"
        arc_guidance = "The conflict becomes apparent, tension rises"
    elif exchange_count <= 8:
        arc_stage = "climax"
        arc_guidance = "Work toward resolution"
    else:
        arc_stage = "resolution"
        arc_guidance = "Reach a natural ending"

    return f"""You are playing {scenario['character_name']} in a {language_name} language learning scenario.

LOCALE CONTEXT:
- Language: {language_name}
- Country/Region: {country_name}
- Use vocabulary and expressions specific to {country_name}

SCENARIO CONTEXT:
- Setting: {scenario['setting_description']}
- Your personality: {scenario['character_personality']}
- The learner's objective: {scenario['objective']}
- The conflict/twist: {scenario['conflict']}
- Difficulty level: {scenario['difficulty']}

STORY ARC GUIDANCE:
- Current exchange: {exchange_count}
- Current stage: {arc_stage} - {arc_guidance}
- Exchanges 1-2: Establish the situation, hint at the conflict
- Exchanges 3-5: The conflict becomes apparent, tension rises
- Exchanges 6-8: Work toward resolution
- Exchanges 8-10: Reach a natural ending

YOUR CHARACTER ROLE:
1. Stay in character as {scenario['character_name']}
2. Respond in {language_name} appropriate for {scenario['difficulty']} level
3. Use vocabulary and expressions specific to {country_name}
4. Keep responses 1-3 sentences, natural and conversational
5. Naturally progress the story toward resolution
6. If the learner handles the situation well, let them succeed
7. If they struggle, offer graceful ways to adapt or fail

TUTOR ROLE:
Analyze the learner's {language_name} and provide:
- Corrections for any grammar or spelling errors
- Vocabulary suggestions for their next response
- Cultural tips when relevant (specific to {country_name})

IMPORTANT: Always respond with valid JSON in this exact format:
{{
    "character_response": "Your in-character {language_name} response (1-3 sentences)",
    "tutor_tips": {{
        "corrections": ["Grammar/spelling corrections if any, or empty array"],
        "vocabulary": ["Helpful words/phrases for their next response"],
        "cultural": ["Cultural tips if relevant, or empty array"]
    }},
    "conversation_complete": false,
    "resolution_status": null,
    "arc_progress": "{arc_stage}"
}}

Set "conversation_complete" to true only when the scenario reaches a natural end.
When complete, set "resolution_status" to one of:
- "success" - learner achieved their objective
- "adapted" - learner found an alternative solution
- "graceful_fail" - learner didn't succeed but handled it gracefully

Respond ONLY with the JSON object, no other text."""


def build_messages(
    user_message: str,
    conversation_history: List[Message]
) -> List[dict]:
    """Build the messages array for Claude API.

    Skips leading assistant messages since Bedrock requires the first
    message to have 'user' role.
    """
    messages = []

    # Find index of first user message in history
    first_user_idx = None
    for i, msg in enumerate(conversation_history):
        if msg.role == "user":
            first_user_idx = i
            break

    # Only include messages from first user message onward
    if first_user_idx is not None:
        for msg in conversation_history[first_user_idx:]:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

    # Always append the new user message
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
            "conversation_complete": False,
            "resolution_status": None,
            "arc_progress": "beginning"
        }


async def get_chat_response(
    user_message: str,
    conversation_history: List[Message],
    scenario: dict,
    exchange_count: int = 0
) -> dict:
    """
    Get a chat response from Claude via Bedrock.

    Args:
        user_message: The user's message in French
        conversation_history: Previous messages in the conversation
        scenario: The scenario dict with setting, objective, conflict, etc.
        exchange_count: Current exchange number for story arc tracking

    Returns:
        dict with character_response, tutor_tips, conversation_complete, arc_progress, resolution_status
    """
    system_prompt = build_system_prompt(scenario, exchange_count)
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
    locale: str,
    language_name: str,
    country_name: str,
    preferences: Optional[str] = None,
    veto_reason: Optional[str] = None
) -> str:
    """Build system prompt for scenario generation."""
    prompt = f"""You are a creative {language_name} language learning scenario designer. Generate an immersive, story-driven scenario for a student at {difficulty} level.

LOCALE: {locale}
- Language: {language_name}
- Country/Region: {country_name}
- Use vocabulary, expressions, and cultural references specific to {country_name}
- Set the scenario IN {country_name}

Each scenario MUST have:
1. A vivid SETTING (bakery, train station, hotel, village market, museum, etc.) located in {country_name}
2. A clear OBJECTIVE the learner must achieve
3. A CONFLICT or TWIST that creates interesting tension
4. A CHARACTER with personality (name, role, demeanor) - use culturally appropriate names for {country_name}
5. Potential for RESOLUTION (success, adaptation, or graceful failure)

The scenario should:
- Be completable in 5-10 exchanges
- Have vocabulary appropriate for {difficulty} level
- Include cultural authenticity ({country_name} customs, expressions)
- Use locale-specific vocabulary (e.g., Argentine Spanish uses voseo, Québécois French uses local expressions like "char" for car)
- Be engaging with mild drama/humor

"""
    if veto_reason:
        prompt += f"The user rejected a previous scenario because: {veto_reason}. Generate something different.\n"
    if preferences:
        prompt += f"The user prefers: {preferences}\n"

    prompt += """
IMPORTANT: The opening_line is what YOUR CHARACTER (the NPC) says FIRST to START the conversation.
The learner will then respond based on their objective. Do NOT write what the learner should say.
For example, if the character is a hotel receptionist, the opening_line might be "Bonjour, bienvenue à l'Hôtel du Lac. Vous avez une réservation?"

Respond ONLY with valid JSON in this exact format:
{
    "setting": "Brief location name",
    "setting_description": "2-3 sentences painting the scene with sensory details",
    "objective": "What the learner needs to accomplish",
    "conflict": "The twist or obstacle they'll face",
    "difficulty": \"""" + difficulty + """\",
    "locale": \"""" + locale + """\",
    "language_name": \"""" + language_name + """\",
    "country_name": \"""" + country_name + """\",
    "opening_line": "What the NPC character says FIRST to greet or engage the learner in """ + language_name + """ - this is NOT what the learner says. Example: 'Bonjour! Comment puis-je vous aider?' for a shopkeeper",
    "character_name": "Name and role",
    "character_personality": "Brief personality description",
    "hints": ["3-5 useful vocabulary words or phrases for this scenario"]
}"""
    return prompt


async def generate_scenario(
    difficulty: str,
    preferences: Optional[str] = None,
    veto_reason: Optional[str] = None,
    locale: str = "fr-FR"
) -> dict:
    """
    Generate a creative scenario proposal using Claude via Bedrock.

    Args:
        difficulty: CEFR level (A1, A2, B1, B2, C1, C2)
        preferences: Optional user theme preferences
        veto_reason: Optional reason why previous scenario was rejected
        locale: Locale code (e.g., "fr-FR", "es-MX")

    Returns:
        dict matching ScenarioProposal structure
    """
    locale_info = get_locale_info(locale)
    if locale_info:
        language, variant = locale_info
        language_name = language.name
        country_name = variant.country
    else:
        language_name = "French"
        country_name = "France"
        locale = "fr-FR"

    system_prompt = build_scenario_generation_prompt(
        difficulty, locale, language_name, country_name, preferences, veto_reason
    )

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": f"Generate a new {language_name} language learning scenario."}
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

        parsed["locale"] = locale
        parsed["language_name"] = language_name
        parsed["country_name"] = country_name
        return parsed

    except ClientError as e:
        logger.error(f"Bedrock API error in generate_scenario: {e}")
        raise
    except Exception as e:
        logger.error(f"Error generating scenario: {e}")
        raise


def build_modify_scenario_prompt(original_scenario: dict, modification_request: str) -> str:
    """Build system prompt for scenario modification."""
    locale = original_scenario.get("locale", "fr-FR")
    language_name = original_scenario.get("language_name", "French")
    country_name = original_scenario.get("country_name", "France")
    hints_str = ", ".join(original_scenario.get("hints", []))

    return f"""You are modifying a {language_name} language learning scenario based on user feedback.

LOCALE: {locale} ({language_name} - {country_name})
Use vocabulary and expressions specific to {country_name}.

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

Adjust the scenario while keeping the same difficulty level, locale, and overall structure unless specifically asked to change them.

Respond ONLY with valid JSON in the same format as the original scenario:
{{
    "setting": "Brief location name",
    "setting_description": "2-3 sentences painting the scene with sensory details",
    "objective": "What the learner needs to accomplish",
    "conflict": "The twist or obstacle they'll face",
    "difficulty": "{original_scenario.get("difficulty", "B1")}",
    "locale": "{locale}",
    "language_name": "{language_name}",
    "country_name": "{country_name}",
    "opening_line": "The character's first line in {language_name}",
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
    locale = original_scenario.get("locale", "fr-FR")
    language_name = original_scenario.get("language_name", "French")
    country_name = original_scenario.get("country_name", "France")

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

        parsed["locale"] = locale
        parsed["language_name"] = language_name
        parsed["country_name"] = country_name
        return parsed

    except ClientError as e:
        logger.error(f"Bedrock API error in modify_scenario: {e}")
        raise
    except Exception as e:
        logger.error(f"Error modifying scenario: {e}")
        raise
