"""
Email check route — POST /api/v1/check

Fix #8: asyncio.gather() called with return_exceptions=True so individual
AI service failures are caught and converted to proper HTTP 500 errors
instead of crashing the entire request silently.
"""

import asyncio
import logging

from fastapi import APIRouter, HTTPException

from app.schemas.request import EmailCheckRequest
from app.schemas.response import EmailCheckResponse
from app.services.ai.grammar import analyze_grammar
from app.services.ai.subject import generate_subjects

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/check",
    response_model=EmailCheckResponse,
    summary="Analyze email content",
    description=(
        "Accepts an email subject and body, then returns grammar corrections, "
        "a list of identified issues, and improved subject line suggestions."
    ),
)
async def check_email(request: EmailCheckRequest) -> EmailCheckResponse:
    logger.info(
        "Email check request received | subject_len=%d | body_len=%d",
        len(request.subject),
        len(request.body),
    )

    # Fix #8: return_exceptions=True prevents one failure from cancelling the other task.
    grammar_result, subject_result = await asyncio.gather(
        analyze_grammar(request.body),
        generate_subjects(request.subject, request.body),
        return_exceptions=True,
    )

    # Explicitly check each result for exceptions and surface them as HTTP errors.
    if isinstance(grammar_result, Exception):
        logger.error("Grammar service failed: %s", grammar_result, exc_info=grammar_result)
        err_msg = str(grammar_result)
        if "must be set" in err_msg or "API key" in err_msg:
            detail_msg = "API Key Missing: Please configure GEMINI_API_KEY in your Render dashboard environment variables."
        else:
            detail_msg = f"Grammar analysis service failed: {err_msg}"
        raise HTTPException(
            status_code=502,
            detail=detail_msg,
        )

    if isinstance(subject_result, Exception):
        logger.error("Subject service failed: %s", subject_result, exc_info=subject_result)
        err_msg = str(subject_result)
        if "must be set" in err_msg or "API key" in err_msg:
            detail_msg = "API Key Missing: Please configure GEMINI_API_KEY in your Render dashboard environment variables."
        else:
            detail_msg = f"Subject generation service failed: {err_msg}"
        raise HTTPException(
            status_code=502,
            detail=detail_msg,
        )

    corrected_body, grammar_issues = grammar_result
    improved_subjects = subject_result

    logger.info(
        "Email check complete | issues=%d | subjects=%d",
        len(grammar_issues),
        len(improved_subjects),
    )

    return EmailCheckResponse(
        corrected_body=corrected_body,
        grammar_issues=grammar_issues,
        improved_subjects=improved_subjects,
    )
