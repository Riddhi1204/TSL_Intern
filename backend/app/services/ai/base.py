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
        api_key = settings.gemini_api_key or settings.openai_api_key
        if not api_key:
            raise ValueError("Either GEMINI_API_KEY or OPENAI_API_KEY must be set in the environment variables.")
        
        base_url = settings.openai_api_base
        if settings.gemini_api_key and not base_url:
            base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
            
        kwargs = {"api_key": api_key}
        if base_url:
            kwargs["base_url"] = base_url
            
        _client = AsyncOpenAI(**kwargs)
    return _client
