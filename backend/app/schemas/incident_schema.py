"""Incident request/response schemas."""
from pydantic import BaseModel, Field
from typing import Optional


class DispatchRequest(BaseModel):
    """Emergency dispatch request."""
    caller_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=7, max_length=20)
    location: str = Field(..., min_length=1, max_length=500)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    
    class Config:
        json_schema_extra = {
            "example": {
                "caller_name": "John Doe",
                "phone": "+1-555-123-4567",
                "location": "123 Main St, New York, NY",
                "latitude": 40.7128,
                "longitude": -74.0060
            }
        }


class DispatchResponse(BaseModel):
    """Emergency dispatch response."""
    incident_id: str
    status: str
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "incident_id": "507f1f77bcf86cd799439011",
                "status": "Ambulance Dispatched",
                "message": "Ambulance en route to your location"
            }
        }


class TriageRequest(BaseModel):
    """Triage assessment request."""
    incident_id: str
    conversation: str = Field(..., min_length=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "incident_id": "507f1f77bcf86cd799439011",
                "conversation": "Patient reports chest pain and shortness of breath..."
            }
        }


class TriageResponse(BaseModel):
    """Triage assessment response."""
    severity: str
    summary: str
    recommended_hospital: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "severity": "High",
                "summary": "Patient experiencing acute chest pain with dyspnea. Possible MI.",
                "recommended_hospital": "Trauma Center"
            }
        }


class CameraLinkRequest(BaseModel):
    """Camera link request."""
    incident_id: str
    phone: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "incident_id": "507f1f77bcf86cd799439011",
                "phone": "+1-555-123-4567"
            }
        }


class CameraLinkResponse(BaseModel):
    """Camera link response."""
    success: bool
    upload_url: Optional[str] = None
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "upload_url": "http://localhost:8000/upload?incident_id=507f1f77bcf86cd799439011",
                "message": "Camera link sent to patient"
            }
        }


class VisionAnalysisRequest(BaseModel):
    """Vision analysis request."""
    incident_id: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "incident_id": "507f1f77bcf86cd799439011"
            }
        }


class VisionAnalysisResponse(BaseModel):
    """Vision analysis response."""
    severity: str
    analysis: str
    recommendation: str
    confidence: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "severity": "High",
                "analysis": "Significant head trauma visible. Multiple lacerations.",
                "recommendation": "Immediate neurosurgical evaluation required",
                "confidence": 0.92
            }
        }


class ETARequest(BaseModel):
    """ETA request."""
    origin: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "origin": "40.7128,-74.0060",
                "destination": "40.7580,-73.9855"
            }
        }


class ETAResponse(BaseModel):
    """ETA response."""
    eta_minutes: int
    distance_km: float
    duration_text: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "eta_minutes": 8,
                "distance_km": 3.2,
                "duration_text": "8 mins"
            }
        }


class HospitalAlertPayload(BaseModel):
    """Hospital alert payload for Socket.IO."""
    incident_id: str
    patient_name: str
    location: str
    latitude: float
    longitude: float
    severity: str
    hospital: str
    eta_minutes: int
    image_url: Optional[str] = None
    vision_analysis: Optional[dict] = None
    symptoms: Optional[str] = None
