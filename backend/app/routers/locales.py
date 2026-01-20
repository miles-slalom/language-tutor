from fastapi import APIRouter
from app.models.locales import SUPPORTED_LANGUAGES

router = APIRouter(prefix="/api", tags=["locales"])


@router.get("/locales")
def get_supported_locales():
    """Return all supported languages and their locale variants."""
    return {"languages": SUPPORTED_LANGUAGES}
