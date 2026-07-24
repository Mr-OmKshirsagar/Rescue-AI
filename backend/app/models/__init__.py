"""Models module."""
from app.models.incident import Incident, IncidentCreate, IncidentUpdate, IncidentResponse
from app.models.hospital import Hospital, HospitalCreate, HospitalUpdate, HospitalResponse

__all__ = [
    "Incident",
    "IncidentCreate",
    "IncidentUpdate",
    "IncidentResponse",
    "Hospital",
    "HospitalCreate",
    "HospitalUpdate",
    "HospitalResponse",
]
