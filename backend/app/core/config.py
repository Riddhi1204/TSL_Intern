from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Fix #2: pydantic-settings is a separate package from pydantic v2.
    Fix #9: ALLOWED_ORIGINS stored as comma-separated string, parsed to list via property.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str
    openai_api_base: str | None = None
    model_name: str = "gpt-4o-mini"
    # Comma-separated list of allowed CORS origins
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def origins_list(self) -> list[str]:
        """
        Fix #9: Split comma-separated string into a list for FastAPI CORS middleware.
        CORSMiddleware requires list[str], not a plain string.
        """
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton — reads .env once at startup."""
    return Settings()
