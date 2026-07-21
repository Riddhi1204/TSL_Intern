"""
Subject line generation service using GPT-4o-mini.

Fixes applied:
  #3  — Uses AsyncOpenAI client.chat.completions.create() (SDK v1.x)
  #4  — System prompt explicitly instructs JSON-only output so
         response_format=json_object is honoured by the model.
"""

import json
import logging

from app.core.config import get_settings
from app.schemas.response import SubjectSuggestion
from app.services.ai.base import get_openai_client, create_chat_completion_with_fallback

logger = logging.getLogger(__name__)

# Fix #4: Explicit JSON instruction in system prompt is required.
SUBJECT_SYSTEM_PROMPT = """\
You are an expert email marketing copywriter and communication strategist.

Your task:
Given an original email subject line and the email body, generate exactly 3 improved
subject line alternatives. Each alternative should be:
- Clear, concise, and under 60 characters
- Professional and engaging
- Directly relevant to the email's content and purpose
- Scored 0–100 for overall effectiveness (clarity + engagement + relevance)

Scoring guide:
  90–100 = Exceptional — highly compelling and precise
  75–89  = Good — clear and professional
  60–74  = Average — acceptable but generic
  Below 60 = Weak — vague, too long, or irrelevant

IMPORTANT RULES:
- You MUST respond with valid JSON only. No prose, no markdown fences.
- Use exactly this schema:

{
  "suggestions": [
    { "subject": "<subject line>", "score": <integer 0-100> },
    { "subject": "<subject line>", "score": <integer 0-100> },
    { "subject": "<subject line>", "score": <integer 0-100> }
  ]
}

- Order suggestions from highest to lowest score.
- Do NOT include any text outside the JSON object.
"""


async def generate_subjects(subject: str, body: str) -> list[SubjectSuggestion]:
    """
    Generate 3 improved subject line suggestions for the given email.

    Returns:
        List of SubjectSuggestion with subject text and score.
    """
    client = get_openai_client()
    settings = get_settings()

    logger.info("Sending subject generation request to OpenAI")

    response = await create_chat_completion_with_fallback(
        messages=[
            {"role": "system", "content": SUBJECT_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Original Subject: {subject}\n\n"
                    f"Email Body:\n{body}\n\n"
                    "Generate 3 improved subject lines."
                ),
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.7,  # Higher temperature for creative variety
        max_tokens=512,
    )

    raw_content = response.choices[0].message.content or "{}"

    try:
        data = json.loads(raw_content)
    except json.JSONDecodeError as exc:
        logger.error("JSON parse error in subject response: %s | raw=%s", exc, raw_content[:200])
        return []

    raw_suggestions: list[dict] = data.get("suggestions") or []

    suggestions = [
        SubjectSuggestion(
            subject=item["subject"],
            score=int(item.get("score", 0)),
        )
        for item in raw_suggestions[:3]
        if item.get("subject")
    ]

    logger.info("Subject generation complete: %d suggestion(s) returned", len(suggestions))
    return suggestions
