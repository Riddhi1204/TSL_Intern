"""
Shared OpenAI async client singleton.

Fix #3: Uses openai>=1.x AsyncOpenAI — the old openai.ChatCompletion.create()
was removed in SDK v1.0. All requests must go through an instantiated client.
"""

from openai import AsyncOpenAI
from app.core.config import get_settings

# Module-level singleton — created once, reused across all requests.
# Do NOT create a new AsyncOpenAI() per request; that leaks HTTP connections.
_client: AsyncOpenAI | None = None


def get_openai_client() -> AsyncOpenAI:
    """Return the shared AsyncOpenAI client, initializing it on first call."""
    global _client
    if _client is None:
        settings = get_settings()
        kwargs = {"api_key": settings.openai_api_key}
        if settings.openai_api_base:
            kwargs["base_url"] = settings.openai_api_base
        _client = AsyncOpenAI(**kwargs)
    return _client
