"""Schemas module."""
from app.schemas.triage_schema import TriageRequest, TriageResponse
from app.schemas.incident_schema import (
    DispatchRequest,
    DispatchResponse,
    CameraLinkRequest,
    CameraLinkResponse,
    VisionAnalysisRequest,
    VisionAnalysisResponse,
    ETARequest,
    ETAResponse,
    HospitalAlertPayload,
)

__all__ = [
    "TriageRequest",
    "TriageResponse",
    "DispatchRequest",
    "DispatchResponse",
    "CameraLinkRequest",
    "CameraLinkResponse",
    "VisionAnalysisRequest",
    "VisionAnalysisResponse",
    "ETARequest",
    "ETAResponse",
    "HospitalAlertPayload",
]
