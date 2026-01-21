import os
import pytest
import pytest_asyncio
import httpx
import boto3


@pytest.fixture
def api_url() -> str:
    """Return the base API URL from environment or default."""
    return os.environ.get(
        "TEST_API_URL",
        "https://vgxcb7g6al.execute-api.us-east-1.amazonaws.com"
    )


@pytest_asyncio.fixture
async def http_client():
    """Create an async HTTP client for making requests."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        yield client


@pytest.fixture
def auth_token() -> str | None:
    """
    Authenticate with Cognito and return access token.
    Returns None if TEST_USER_EMAIL and TEST_USER_PASSWORD are not set.
    """
    email = os.environ.get("TEST_USER_EMAIL")
    password = os.environ.get("TEST_USER_PASSWORD")
    client_id = os.environ.get("TEST_COGNITO_CLIENT_ID")

    if not email or not password or not client_id:
        return None

    cognito = boto3.client("cognito-idp", region_name="us-east-1")

    response = cognito.initiate_auth(
        ClientId=client_id,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={
            "USERNAME": email,
            "PASSWORD": password,
        },
    )

    return response["AuthenticationResult"]["IdToken"]


@pytest_asyncio.fixture
async def authenticated_client(auth_token: str | None):
    """Create an async HTTP client with Authorization header if token available."""
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"

    async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
        yield client
