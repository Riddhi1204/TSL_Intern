from pydantic import BaseModel, Field


class GrammarIssue(BaseModel):
    """A single grammar issue found in the email body."""

    original: str = Field(..., description="The original incorrect text")
    corrected: str = Field(..., description="The corrected replacement text")


class SubjectSuggestion(BaseModel):
    """An improved subject line suggestion with an effectiveness score."""

    subject: str = Field(..., description="The improved subject line text")
    score: int = Field(..., ge=0, le=100, description="Effectiveness score from 0 to 100")


class EmailCheckResponse(BaseModel):
    """Full response returned by the email check endpoint."""

    corrected_body: str = Field(..., description="The grammar-corrected email body")
    grammar_issues: list[GrammarIssue] = Field(
        default_factory=list,
        description="List of grammar issues found with original and corrected text",
    )
    improved_subjects: list[SubjectSuggestion] = Field(
        default_factory=list,
        description="List of improved subject line suggestions ordered by score descending",
    )
