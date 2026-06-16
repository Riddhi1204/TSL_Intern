"""
FastAPI application entry point.

Fix #5: Replaced deprecated @app.on_event("startup") / @app.on_event("shutdown")
with the modern asynccontextmanager lifespan pattern introduced in FastAPI 0.93+.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (Fix #5: modern pattern, not deprecated on_event)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    settings = get_settings()
    logger.info("=== AI Email Content Checker API starting ===")
    logger.info("Model   : %s", settings.model_name)
    logger.info("Origins : %s", settings.origins_list)
    yield
    logger.info("=== AI Email Content Checker API shutting down ===")


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="AI Email Content Checker",
        description=(
            "Analyzes email content for grammar issues and generates improved "
            "subject line suggestions using GPT-4o-mini."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Fix #9: Pass list[str] to allow_origins, not a raw comma-separated string.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    # Mount versioned API router
    app.include_router(api_router, prefix="/api/v1")

    # ------------------------------------------------------------------
    # Health endpoint
    # ------------------------------------------------------------------
    @app.get("/health", tags=["health"], summary="Health check")
    async def health_check() -> dict:
        return {"status": "healthy"}

    # ------------------------------------------------------------------
    # Global exception handler — catches anything that escaped route handlers
    # ------------------------------------------------------------------
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled exception on %s %s: %s", request.method, request.url, exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred. Please try again."},
        )

    return app


app = create_app()
