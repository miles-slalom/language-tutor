import json
from typing import List, Dict

import boto3

from .base import LLMProvider


class BedrockProvider(LLMProvider):
    """AWS Bedrock LLM provider using Claude Sonnet."""

    def __init__(self, region_name: str = "us-east-1"):
        self.client = boto3.client(
            "bedrock-runtime",
            region_name=region_name,
        )
        self.model_id = "anthropic.claude-3-sonnet-20240229-v1:0"

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
    ) -> str:
        """Generate response using AWS Bedrock Claude Sonnet."""
        formatted_messages = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in messages
        ]

        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": system_prompt,
            "messages": formatted_messages,
        }

        response = self.client.invoke_model(
            modelId=self.model_id,
            body=json.dumps(request_body),
            contentType="application/json",
            accept="application/json",
        )

        response_body = json.loads(response["body"].read())
        return response_body["content"][0]["text"]
