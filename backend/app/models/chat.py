from typing import List, Literal

from pydantic import BaseModel


class Message(BaseModel):
    """A single chat message."""

    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    """Request body for the chat endpoint."""

    messages: List[Message]


class ChatResponse(BaseModel):
    """Response body from the chat endpoint."""

    response: str
    role: Literal["assistant"] = "assistant"
