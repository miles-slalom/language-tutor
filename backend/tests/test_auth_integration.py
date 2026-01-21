"""
Authenticated API integration tests for the language tutor backend.

These tests require TEST_USER_EMAIL, TEST_USER_PASSWORD, and TEST_COGNITO_CLIENT_ID
environment variables to be set. Tests will be skipped if credentials are not available.
"""
import pytest


class TestScenarioAuthenticated:
    """Tests for scenario endpoints requiring authentication."""

    @pytest.mark.asyncio
    async def test_scenario_generate_authenticated(self, authenticated_client, api_url, auth_token):
        """Generate scenario with valid auth token."""
        if auth_token is None:
            pytest.skip("Auth credentials not provided")

        response = await authenticated_client.post(
            f"{api_url}/api/scenario/generate",
            json={"locale": "fr-FR", "difficulty": "A1"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "scenario" in data
        scenario = data["scenario"]
        # Verify scenario structure
        assert "setting" in scenario
        assert "objective" in scenario
        assert "opening_line" in scenario
        assert "character_name" in scenario
        assert "difficulty" in scenario
        assert scenario["difficulty"] == "A1"

    @pytest.mark.asyncio
    async def test_scenario_generate_different_difficulties(self, authenticated_client, api_url, auth_token):
        """Test scenario generation with different CEFR difficulty levels."""
        if auth_token is None:
            pytest.skip("Auth credentials not provided")

        response = await authenticated_client.post(
            f"{api_url}/api/scenario/generate",
            json={"locale": "fr-FR", "difficulty": "B1"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["scenario"]["difficulty"] == "B1"

    @pytest.mark.asyncio
    async def test_scenario_modify_authenticated(self, authenticated_client, api_url, auth_token):
        """Modify an existing scenario."""
        if auth_token is None:
            pytest.skip("Auth credentials not provided")

        # First generate a scenario
        gen_response = await authenticated_client.post(
            f"{api_url}/api/scenario/generate",
            json={"locale": "fr-FR", "difficulty": "A1"}
        )
        assert gen_response.status_code == 200
        original_scenario = gen_response.json()["scenario"]

        # Now modify it
        modify_response = await authenticated_client.post(
            f"{api_url}/api/scenario/modify",
            json={
                "original_scenario": original_scenario,
                "modification_request": "Make the character more friendly"
            }
        )
        assert modify_response.status_code == 200
        data = modify_response.json()
        assert "scenario" in data
        modified_scenario = data["scenario"]
        # Verify modified scenario has required fields
        assert "setting" in modified_scenario
        assert "character_name" in modified_scenario
        assert "character_personality" in modified_scenario


class TestChatAuthenticated:
    """Tests for chat endpoint requiring authentication."""

    @pytest.mark.asyncio
    async def test_chat_conversation(self, authenticated_client, api_url, auth_token):
        """Full chat flow: generate scenario, send message, verify response."""
        if auth_token is None:
            pytest.skip("Auth credentials not provided")

        # Generate a scenario first
        scenario_response = await authenticated_client.post(
            f"{api_url}/api/scenario/generate",
            json={"locale": "fr-FR", "difficulty": "A1"}
        )
        assert scenario_response.status_code == 200
        scenario = scenario_response.json()["scenario"]

        # Send a chat message
        chat_response = await authenticated_client.post(
            f"{api_url}/api/chat",
            json={
                "message": "Bonjour!",
                "conversation_history": [],
                "scenario": scenario,
                "exchange_count": 0
            }
        )
        assert chat_response.status_code == 200
        data = chat_response.json()
        assert "character_response" in data
        assert "tutor_tips" in data

    @pytest.mark.asyncio
    async def test_chat_response_structure(self, authenticated_client, api_url, auth_token):
        """Verify chat response has character_response, tutor_tips, arc_progress."""
        if auth_token is None:
            pytest.skip("Auth credentials not provided")

        # Generate a scenario first
        scenario_response = await authenticated_client.post(
            f"{api_url}/api/scenario/generate",
            json={"locale": "fr-FR", "difficulty": "A1"}
        )
        scenario = scenario_response.json()["scenario"]

        # Send a chat message
        chat_response = await authenticated_client.post(
            f"{api_url}/api/chat",
            json={
                "message": "Bonjour, je voudrais réserver une chambre.",
                "conversation_history": [],
                "scenario": scenario,
                "exchange_count": 0
            }
        )
        assert chat_response.status_code == 200
        data = chat_response.json()

        # Verify all expected fields
        assert "character_response" in data
        assert isinstance(data["character_response"], str)
        assert len(data["character_response"]) > 0

        assert "tutor_tips" in data
        tutor_tips = data["tutor_tips"]
        assert "corrections" in tutor_tips
        assert "vocabulary" in tutor_tips
        assert "cultural" in tutor_tips

        assert "arc_progress" in data
        assert data["arc_progress"] in ["beginning", "rising", "climax", "resolution"]

        assert "conversation_complete" in data
        assert isinstance(data["conversation_complete"], bool)

    @pytest.mark.asyncio
    async def test_chat_with_conversation_history(self, authenticated_client, api_url, auth_token):
        """Test chat with existing conversation history."""
        if auth_token is None:
            pytest.skip("Auth credentials not provided")

        # Generate a scenario first
        scenario_response = await authenticated_client.post(
            f"{api_url}/api/scenario/generate",
            json={"locale": "fr-FR", "difficulty": "A1"}
        )
        scenario = scenario_response.json()["scenario"]

        # First message
        first_response = await authenticated_client.post(
            f"{api_url}/api/chat",
            json={
                "message": "Bonjour!",
                "conversation_history": [],
                "scenario": scenario,
                "exchange_count": 0
            }
        )
        assert first_response.status_code == 200
        first_data = first_response.json()

        # Build conversation history
        conversation_history = [
            {"role": "user", "content": "Bonjour!"},
            {"role": "assistant", "content": first_data["character_response"]}
        ]

        # Second message with history
        second_response = await authenticated_client.post(
            f"{api_url}/api/chat",
            json={
                "message": "Je voudrais une chambre pour deux nuits, s'il vous plaît.",
                "conversation_history": conversation_history,
                "scenario": scenario,
                "exchange_count": 1
            }
        )
        assert second_response.status_code == 200
        second_data = second_response.json()
        assert "character_response" in second_data
        assert "tutor_tips" in second_data

    @pytest.mark.asyncio
    async def test_chat_tutor_tips_structure(self, authenticated_client, api_url, auth_token):
        """Verify tutor_tips contains lists for corrections, vocabulary, cultural."""
        if auth_token is None:
            pytest.skip("Auth credentials not provided")

        # Generate a scenario first
        scenario_response = await authenticated_client.post(
            f"{api_url}/api/scenario/generate",
            json={"locale": "fr-FR", "difficulty": "A1"}
        )
        scenario = scenario_response.json()["scenario"]

        # Send a chat message with intentional errors to trigger corrections
        chat_response = await authenticated_client.post(
            f"{api_url}/api/chat",
            json={
                "message": "Je suis besoin un chambre.",
                "conversation_history": [],
                "scenario": scenario,
                "exchange_count": 0
            }
        )
        assert chat_response.status_code == 200
        data = chat_response.json()

        tutor_tips = data["tutor_tips"]
        assert isinstance(tutor_tips["corrections"], list)
        assert isinstance(tutor_tips["vocabulary"], list)
        assert isinstance(tutor_tips["cultural"], list)
