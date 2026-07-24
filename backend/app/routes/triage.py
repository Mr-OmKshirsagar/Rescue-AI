"""Triage assessment routes."""
import logging
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.schemas.incident_schema import TriageRequest, TriageResponse
from app.database.mongodb import get_db
from app.services.gemini_service import GeminiService
from app.services.socket_service import SocketIOService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/triage", tags=["triage"])

# Socket.IO service instance will be injected
socket_service: SocketIOService = None


def set_socket_service(service: SocketIOService):
    """Set Socket.IO service instance."""
    global socket_service
    socket_service = service


@router.post("/", response_model=TriageResponse)
async def perform_triage(request: TriageRequest, db=Depends(get_db)):
    """
    Perform AI-powered triage assessment.
    
    - Uses Gemini to analyze conversation
    - Extracts symptoms and severity
    - Recommends hospital type
    - Updates incident record
    """
    try:
        # Verify incident exists
        incident = await db["incidents"].find_one({"_id": ObjectId(request.incident_id)})
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        # Get Gemini analysis
        logger.info(f"Performing triage analysis for incident {request.incident_id}")
        
        triage_result = await GeminiService.analyze_triage(request.conversation)
        
        # Update incident with triage results
        update_data = {
            "conversation": request.conversation,
            "severity": triage_result["severity"],
            "summary": triage_result["summary"],
            "hospital": triage_result["recommended_hospital"],
            "symptoms": triage_result["symptoms"],
            "status": f"Triage Complete - {triage_result['severity']}",
            "updated_at": datetime.utcnow()
        }
        
        await db["incidents"].update_one(
            {"_id": ObjectId(request.incident_id)},
            {"$set": update_data}
        )
        
        logger.info(f"Triage completed: {triage_result}")
        
        # Emit update via Socket.IO
        if socket_service:
            try:
                await socket_service.emit_incident_updated({
                    "incident_id": request.incident_id,
                    "severity": triage_result["severity"],
                    "summary": triage_result["summary"],
                    "hospital": triage_result["recommended_hospital"],
                    "status": update_data["status"]
                })
            except Exception as e:
                logger.warning(f"Failed to emit Socket.IO event: {e}")
        
        return TriageResponse(
            severity=triage_result["severity"],
            summary=triage_result["summary"],
            recommended_hospital=triage_result["recommended_hospital"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing triage: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to perform triage assessment"
        )
