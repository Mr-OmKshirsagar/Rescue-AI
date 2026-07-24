"""
triage_schema.py

Pydantic v2 request/response models for POST /triage/.
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

    class Config:
        json_schema_extra = {
            "example": {
                "incident_id": "507f1f77bcf86cd799439011",
                "conversation": "Patient reports chest pain and shortness of breath...",
                "symptoms": "chest pain, dyspnea"
            }
        }


class TriageResponse(BaseModel):
    incident_id: str = Field(default="", description="ID of the incident triaged")
    severity: Literal["Critical", "High", "Moderate", "Low"]
    symptoms: List[str] = Field(default_factory=list)
    recommended_hospital: str = Field(..., description="Recommended hospital/facility type")
    summary: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        json_schema_extra = {
            "example": {
                "incident_id": "507f1f77bcf86cd799439011",
                "severity": "High",
                "symptoms": ["chest pain", "shortness of breath"],
                "recommended_hospital": "Cardiac",
                "summary": "Patient experiencing acute chest pain with dyspnea. Possible MI.",
                "confidence": 0.9,
                "created_at": "2026-07-24T12:00:00Z"
            }
        }
