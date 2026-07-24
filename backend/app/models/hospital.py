"""Hospital model for MongoDB."""
from typing import Optional
from pydantic import BaseModel, Field


class HospitalBase(BaseModel):
    """Base hospital model."""
    name: str
    latitude: float
    longitude: float
    type: str  # "Trauma Center", "General", "Cardiac", etc.
    beds_available: int
    phone: str


class HospitalCreate(HospitalBase):
    """Create hospital request."""
    pass


class HospitalUpdate(BaseModel):
    """Update hospital model."""
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    type: Optional[str] = None
    beds_available: Optional[int] = None
    phone: Optional[str] = None


class HospitalResponse(BaseModel):
    """Hospital response model."""
    id: str = Field(alias="_id")
    name: str
    latitude: float
    longitude: float
    type: str
    beds_available: int
    phone: str
    
    class Config:
        populate_by_name = True


class Hospital(HospitalBase):
    """Hospital model for database."""
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "City Hospital",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "type": "Trauma Center",
                "beds_available": 10,
                "phone": "+1987654321"
            }
        }
