"""
triage_schema.py

Pydantic v2 request/response models for POST /triage/.

Kept in its own module (triage_schema.py) so it can be imported directly.
If your project already centralizes schemas in incident_schema.py, feel free
to move these classes there instead - nothing here depends on the filename.
"""

from datetime import datetime, timezone
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class TriageRequest(BaseModel):
    incident_id: str = Field(..., description="ID of the incident to triage")
    conversation: str = Field(..., min_length=1, description="Dispatcher/caller conversation transcript")
    symptoms: Optional[str] = Field(
        default=None, description="Optional pre-extracted symptom notes to add as context"
    )


class TriageResponse(BaseModel):
    incident_id: str
    severity: Literal["Critical", "High", "Moderate", "Low"]
    symptoms: List[str] = Field(default_factory=list)
    recommended_hospital: str = Field(..., description="Recommended hospital/facility type")
    summary: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
