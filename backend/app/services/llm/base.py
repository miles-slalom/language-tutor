from abc import ABC, abstractmethod
from typing import List, Dict


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
    ) -> str:
        """
        Generate a response from the LLM.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            system_prompt: System prompt to set the LLM behavior

        Returns:
            The generated response text
        """
        pass
