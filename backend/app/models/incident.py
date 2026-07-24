"""Incident model for MongoDB."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId


class IncidentBase(BaseModel):
    """Base incident model."""
    caller_name: str
    phone: str
    location: str
    latitude: float
    longitude: float
    

class IncidentCreate(IncidentBase):
    """Create incident request."""
    pass


class IncidentUpdate(BaseModel):
    """Update incident model."""
    symptoms: Optional[str] = None
    conversation: Optional[str] = None
    severity: Optional[str] = None
    hospital: Optional[str] = None
    eta: Optional[int] = None
    status: Optional[str] = None
    image_url: Optional[str] = None
    vision_analysis: Optional[dict] = None


class IncidentResponse(BaseModel):
    """Incident response model."""
    id: str = Field(alias="_id")
    caller_name: str
    phone: str
    location: str
    latitude: float
    longitude: float
    symptoms: Optional[str] = None
    conversation: Optional[str] = None
    severity: Optional[str] = None
    hospital: Optional[str] = None
    eta: Optional[int] = None
    status: str = "Received"
    image_url: Optional[str] = None
    vision_analysis: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class Incident(IncidentBase):
    """Incident model for database."""
    symptoms: Optional[str] = None
    conversation: Optional[str] = None
    severity: Optional[str] = None
    hospital: Optional[str] = None
    eta: Optional[int] = None
    status: str = "Received"
    image_url: Optional[str] = None
    vision_analysis: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "caller_name": "John Doe",
                "phone": "+1234567890",
                "location": "123 Main St, City",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "symptoms": "chest pain",
                "conversation": "...",
                "severity": "High",
                "hospital": "Trauma Center",
                "eta": 8,
                "status": "Ambulance Dispatched",
                "created_at": "2024-01-01T10:00:00",
                "updated_at": "2024-01-01T10:00:00"
            }
        }
