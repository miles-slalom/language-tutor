import pytest
import httpx


class TestHealthEndpoint:
    @pytest.mark.asyncio
    async def test_health_endpoint(self, http_client, api_url):
        """GET /api/health returns 200 with status 'healthy'"""
        response = await http_client.get(f"{api_url}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"


class TestLocalesEndpoint:
    @pytest.mark.asyncio
    async def test_locales_endpoint(self, http_client, api_url):
        """GET /api/locales returns dict with languages list, French first"""
        response = await http_client.get(f"{api_url}/api/locales")
        assert response.status_code == 200
        data = response.json()
        assert "languages" in data
        languages = data["languages"]
        assert isinstance(languages, list)
        assert len(languages) > 0
        # French should be first
        assert languages[0]["code"] == "fr"
        assert languages[0]["name"] == "French"

    @pytest.mark.asyncio
    async def test_locales_structure(self, http_client, api_url):
        """Verify locale response has correct structure"""
        response = await http_client.get(f"{api_url}/api/locales")
        assert response.status_code == 200
        data = response.json()
        assert "languages" in data
        languages = data["languages"]
        lang = languages[0]
        assert "code" in lang
        assert "name" in lang
        assert "native_name" in lang
        assert "variants" in lang
        assert isinstance(lang["variants"], list)
        variant = lang["variants"][0]
        assert "code" in variant
        assert "country" in variant
        assert "flag" in variant
        assert "is_default" in variant


class TestUnauthorizedEndpoints:
    @pytest.mark.asyncio
    async def test_scenario_generate_unauthorized(self, http_client, api_url):
        """POST /api/scenario/generate without auth returns 401"""
        response = await http_client.post(
            f"{api_url}/api/scenario/generate",
            json={"locale": "fr-FR", "difficulty": "A1"}
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_chat_unauthorized(self, http_client, api_url):
        """POST /api/chat without auth returns 401"""
        response = await http_client.post(
            f"{api_url}/api/chat",
            json={"message": "Bonjour", "conversation_history": [], "scenario": {}}
        )
        assert response.status_code == 401
