import logging
from openai import AsyncOpenAI
from app.core.config import get_settings

logger = logging.getLogger(__name__)

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
        
        # Auto-detect Gemini key (starts with AQ.) and set defaults
        if api_key.startswith("AQ."):
            if not base_url:
                base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
            # If model is set to an OpenAI model, override it to Gemini
            if settings.model_name.startswith("gpt-"):
                settings.model_name = "gemini-2.5-flash"
            
        kwargs = {"api_key": api_key}
        if base_url:
            kwargs["base_url"] = base_url
            
        _client = AsyncOpenAI(**kwargs)
    return _client


async def create_chat_completion_with_fallback(
    messages: list[dict],
    response_format: dict | None = None,
    temperature: float = 0.7,
    max_tokens: int = 512,
):
    """
    Call chat completions with fallback models and retry logic for high demand/503 errors.
    """
    settings = get_settings()
    
    # Order of models to try
    models_to_try = [settings.model_name]
    
    # Fallbacks based on configuration
    if "gemini-2.5-flash" in settings.model_name:
        models_to_try.extend(["gemini-2.0-flash", "gemini-2.5-pro"])
    elif "gemini-2.0-flash" in settings.model_name:
        models_to_try.extend(["gemini-2.5-flash", "gemini-2.5-pro"])
        
    # Append defaults if they aren't already listed
    for fallback in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"]:
        if fallback not in models_to_try:
            models_to_try.append(fallback)
            
    last_exception = None
    for model in models_to_try:
        try:
            logger.info("Attempting chat completion with model: %s", model)
            kwargs = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if response_format:
                kwargs["response_format"] = response_format
                
            client = get_openai_client()
            response = await client.chat.completions.create(**kwargs)
            logger.info("Chat completion succeeded with model: %s", model)
            return response
        except Exception as exc:
            err_msg = str(exc)
            logger.warning("Model %s failed with exception: %s", model, err_msg)
            # If it's a rate limit or service unavailable, try the next model
            if any(term in err_msg.lower() for term in ["503", "unavailable", "demand", "429", "limit", "exhausted"]):
                last_exception = exc
                continue
            else:
                # If it is a different error (e.g. invalid key), raise immediately
                raise exc
                
    # If all models fail, raise the last exception encountered
    raise last_exception
