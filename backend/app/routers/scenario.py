import logging

from fastapi import APIRouter, HTTPException, Request

from app.models.schemas import (
    ScenarioRequest,
    ScenarioResponse,
    ScenarioProposal,
    ModifyScenarioRequest,
)
from app.services.auth import get_user_id_from_request
from app.services.bedrock import generate_scenario, modify_scenario

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/scenario/generate", response_model=ScenarioResponse)
async def generate_scenario_endpoint(
    request: Request,
    scenario_request: ScenarioRequest
) -> ScenarioResponse:
    """
    Generate a new scenario proposal based on difficulty and optional preferences.

    The AI will create an immersive, story-driven scenario appropriate for
    the specified CEFR level.
    """
    user_id = get_user_id_from_request(request)
    logger.info(f"Scenario generation request from user: {user_id}, difficulty: {scenario_request.difficulty}, locale: {scenario_request.locale}")

    try:
        scenario_data = await generate_scenario(
            difficulty=scenario_request.difficulty,
            preferences=scenario_request.preferences,
            veto_reason=scenario_request.veto_reason,
            locale=scenario_request.locale
        )

        scenario = ScenarioProposal(
            setting=scenario_data.get("setting", ""),
            setting_description=scenario_data.get("setting_description", ""),
            objective=scenario_data.get("objective", ""),
            conflict=scenario_data.get("conflict", ""),
            difficulty=scenario_data.get("difficulty", scenario_request.difficulty),
            opening_line=scenario_data.get("opening_line", ""),
            character_name=scenario_data.get("character_name", ""),
            character_personality=scenario_data.get("character_personality", ""),
            hints=scenario_data.get("hints", []),
            locale=scenario_data.get("locale", scenario_request.locale),
            language_name=scenario_data.get("language_name", "French"),
            country_name=scenario_data.get("country_name", "France")
        )

        return ScenarioResponse(scenario=scenario)

    except Exception as e:
        logger.error(f"Error generating scenario: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate scenario. Please try again."
        )


@router.post("/scenario/modify", response_model=ScenarioResponse)
async def modify_scenario_endpoint(
    request: Request,
    modify_request: ModifyScenarioRequest
) -> ScenarioResponse:
    """
    Modify an existing scenario based on user feedback.

    The AI will adjust the scenario while keeping the overall structure
    and difficulty level unless specifically requested to change.
    """
    user_id = get_user_id_from_request(request)
    logger.info(f"Scenario modification request from user: {user_id}")

    try:
        original_dict = modify_request.original_scenario.model_dump()

        modified_data = await modify_scenario(
            original_scenario=original_dict,
            modification_request=modify_request.modification_request
        )

        scenario = ScenarioProposal(
            setting=modified_data.get("setting", ""),
            setting_description=modified_data.get("setting_description", ""),
            objective=modified_data.get("objective", ""),
            conflict=modified_data.get("conflict", ""),
            difficulty=modified_data.get("difficulty", modify_request.original_scenario.difficulty),
            opening_line=modified_data.get("opening_line", ""),
            character_name=modified_data.get("character_name", ""),
            character_personality=modified_data.get("character_personality", ""),
            hints=modified_data.get("hints", []),
            locale=modified_data.get("locale", modify_request.original_scenario.locale),
            language_name=modified_data.get("language_name", modify_request.original_scenario.language_name),
            country_name=modified_data.get("country_name", modify_request.original_scenario.country_name)
        )

        return ScenarioResponse(scenario=scenario)

    except Exception as e:
        logger.error(f"Error modifying scenario: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to modify scenario. Please try again."
        )
