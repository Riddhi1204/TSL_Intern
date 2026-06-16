from pydantic import BaseModel, Field


class EmailCheckRequest(BaseModel):
    """Request schema for the email check endpoint."""

    subject: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="The email subject line to analyze",
        examples=["Meeting update for Q3 review"],
    )
    body: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="The email body content to analyze for grammar issues",
        examples=["We has completed the task yesterday and will send the report soon."],
    )
