import logging
from typing import Optional

from fastapi import Request

logger = logging.getLogger(__name__)


def get_user_id_from_request(request: Request) -> Optional[str]:
    """
    Extract user ID from the request context.

    API Gateway JWT authorizer validates the token and adds claims to the request context.
    For Lambda with API Gateway HTTP API, claims are in requestContext.authorizer.jwt.claims

    Args:
        request: FastAPI request object

    Returns:
        User ID (Cognito sub claim) or None if not found
    """
    try:
        scope = request.scope
        aws_event = scope.get("aws.event", {})
        request_context = aws_event.get("requestContext", {})
        authorizer = request_context.get("authorizer", {})
        jwt_claims = authorizer.get("jwt", {}).get("claims", {})

        user_id = jwt_claims.get("sub")

        if user_id:
            logger.info(f"Extracted user_id: {user_id}")
            return user_id

        user_id = authorizer.get("claims", {}).get("sub")
        if user_id:
            return user_id

        logger.warning("No user_id found in request context")
        return None

    except Exception as e:
        logger.error(f"Error extracting user_id: {e}")
        return None


def get_user_email_from_request(request: Request) -> Optional[str]:
    """
    Extract user email from the request context.

    Args:
        request: FastAPI request object

    Returns:
        User email or None if not found
    """
    try:
        scope = request.scope
        aws_event = scope.get("aws.event", {})
        request_context = aws_event.get("requestContext", {})
        authorizer = request_context.get("authorizer", {})
        jwt_claims = authorizer.get("jwt", {}).get("claims", {})

        return jwt_claims.get("email")

    except Exception as e:
        logger.error(f"Error extracting email: {e}")
        return None
