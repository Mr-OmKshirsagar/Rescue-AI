"""
routes/triage.py

POST /triage/  - Run AI triage on an incident's conversation and persist the result.
GET  /triage/{incident_id} - Fetch the most recent triage result for an incident.

Assumes the project's existing patterns (per README.md):
- app.database.mongodb exposes get_database() returning the Motor database,
  with an "incidents" collection keyed by Mongo ObjectId.
- app.services.socket_service exposes an async emit helper used to broadcast
  the INCIDENT_UPDATED event to subscribed clients.

If your actual module names differ slightly, adjust the two imports below -
everything else is self-contained.
"""

import logging
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException

from app.schemas.triage_schema import TriageRequest, TriageResponse
from app.services import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/triage", tags=["triage"])

INCIDENT_UPDATED_EVENT = "INCIDENT_UPDATED"


def _get_incidents_collection():
    """Resolves the incidents collection from the project's mongodb module.
    Isolated into a helper so a missing/renamed module gives one clear error
    instead of an import crash at startup."""
    try:
        from app.database.mongodb import get_database
    except ImportError as e:
        raise RuntimeError(
            "Could not import get_database from app.database.mongodb. "
            "Update the import in app/routes/triage.py to match your project's "
            "database module."
        ) from e

    db = get_database()
    return db["incidents"]


async def _broadcast_incident_updated(incident_id: str, payload: dict) -> None:
    """Best-effort Socket.IO broadcast. Triage should still succeed and return
    a valid response even if the socket layer is unavailable or named
    differently in this project."""
    try:
        from app.services.socket_service import sio

        await sio.emit(INCIDENT_UPDATED_EVENT, {"incident_id": incident_id, **payload})
    except ImportError:
        logger.warning(
            "app.services.socket_service.sio not found - skipping real-time broadcast. "
            "Wire this up to your existing Socket.IO server to enable live updates."
        )
    except Exception as e:  # noqa: BLE001
        logger.error("Failed to broadcast INCIDENT_UPDATED for %s: %s", incident_id, e)


@router.post("/", response_model=TriageResponse)
async def run_triage(request: TriageRequest):
    """Run Gemini-powered triage on an incident's conversation and store the result."""
    collection = _get_incidents_collection()

    try:
        object_id = ObjectId(request.incident_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid incident_id")

    incident = await collection.find_one({"_id": object_id})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    logger.info("Running AI triage for incident %s", request.incident_id)
    result = await gemini_service.analyze_triage(
        conversation=request.conversation,
        symptoms=request.symptoms,
    )

    update_fields = {
        "conversation": request.conversation,
        "symptoms": ", ".join(result["symptoms"]) if result["symptoms"] else incident.get("symptoms"),
        "severity": result["severity"],
        "hospital": result["recommended_hospital_type"],
        "triage_summary": result["summary"],
        "triage_confidence": result["confidence"],
        "updated_at": datetime.now(timezone.utc),
    }

    await collection.update_one({"_id": object_id}, {"$set": update_fields})

    response = TriageResponse(
        incident_id=request.incident_id,
        severity=result["severity"],
        symptoms=result["symptoms"],
        recommended_hospital=result["recommended_hospital_type"],
        summary=result["summary"],
        confidence=result["confidence"],
    )

    await _broadcast_incident_updated(request.incident_id, response.model_dump(mode="json"))

    return response


@router.get("/{incident_id}", response_model=TriageResponse)
async def get_triage(incident_id: str):
    """Fetch the most recently stored triage result for an incident."""
    collection = _get_incidents_collection()

    try:
        object_id = ObjectId(incident_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid incident_id")

    incident = await collection.find_one({"_id": object_id})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if "severity" not in incident:
        raise HTTPException(status_code=404, detail="No triage result found for this incident yet")

    symptoms = incident.get("symptoms") or ""
    symptoms_list = [s.strip() for s in symptoms.split(",") if s.strip()] if isinstance(symptoms, str) else symptoms

    return TriageResponse(
        incident_id=incident_id,
        severity=incident.get("severity", "Moderate"),
        symptoms=symptoms_list,
        recommended_hospital=incident.get("hospital", "General"),
        summary=incident.get("triage_summary", ""),
        confidence=incident.get("triage_confidence", 0.0),
        created_at=incident.get("updated_at", datetime.now(timezone.utc)),
    )
