from typing import Literal

from .base import LLMProvider
from .bedrock import BedrockProvider


def get_llm_provider(provider_name: Literal["bedrock"] = "bedrock") -> LLMProvider:
    """
    Factory function to get an LLM provider instance.

    Args:
        provider_name: Name of the provider to use. Currently only "bedrock" is supported.

    Returns:
        An instance of the requested LLM provider

    Raises:
        ValueError: If an unknown provider name is given
    """
    providers = {
        "bedrock": BedrockProvider,
    }

    if provider_name not in providers:
        raise ValueError(
            f"Unknown LLM provider: {provider_name}. Available: {list(providers.keys())}"
        )

    return providers[provider_name]()
