"""
Grammar analysis service using GPT-4o-mini.

Fixes applied:
  #3  — Uses AsyncOpenAI client.chat.completions.create() (SDK v1.x)
  #4  — System prompt explicitly says "respond with JSON only" so
         response_format=json_object is actually respected by the model.
"""

import json
import logging

from app.core.config import get_settings
from app.schemas.response import GrammarIssue
from app.services.ai.base import get_openai_client, create_chat_completion_with_fallback

logger = logging.getLogger(__name__)


# Fix #4: The system message MUST instruct the model to output JSON.
# Without this instruction, response_format=json_object is ignored.
GRAMMAR_SYSTEM_PROMPT = """\
You are an expert English grammar checker and copy-editor.

Your task:
1. Read the email body provided by the user.
2. Identify all grammar, spelling, punctuation, and syntax errors.
3. Produce a fully corrected version of the email body.
4. List every issue you fixed with the original phrase and the corrected phrase.

IMPORTANT RULES:
- You MUST respond with valid JSON only. No prose, no markdown fences.
- Use exactly this schema:

{
  "corrected_body": "<the fully corrected email body text>",
  "issues": [
    {
      "original": "<the exact original incorrect phrase>",
      "corrected": "<the corrected replacement phrase>"
    }
  ]
}

- If no grammar issues are found, return the original body unchanged and set "issues" to [].
- Do NOT include any text outside the JSON object.
"""


async def analyze_grammar(body: str) -> tuple[str, list[GrammarIssue]]:
    """
    Send the email body to GPT-4o-mini for grammar analysis.

    Returns:
        (corrected_body, list_of_issues)
    """
    client = get_openai_client()
    settings = get_settings()

    logger.info("Sending grammar analysis request to OpenAI (body_len=%d)", len(body))

    response = await create_chat_completion_with_fallback(
        messages=[
            {"role": "system", "content": GRAMMAR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Please check the grammar in this email body:\n\n{body}",
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.1,  # Low temperature for deterministic corrections
        max_tokens=2048,
    )

    raw_content = response.choices[0].message.content or "{}"

    try:
        data = json.loads(raw_content)
    except json.JSONDecodeError as exc:
        logger.error("JSON parse error in grammar response: %s | raw=%s", exc, raw_content[:200])
        # Graceful fallback: return original body with no issues
        return body, []

    corrected_body: str = data.get("corrected_body") or body
    raw_issues: list[dict] = data.get("issues") or []

    issues = [
        GrammarIssue(
            original=issue["original"],
            corrected=issue["corrected"],
        )
        for issue in raw_issues
        if issue.get("original") and issue.get("corrected")
    ]

    logger.info("Grammar analysis complete: %d issue(s) found", len(issues))
    return corrected_body, issues
