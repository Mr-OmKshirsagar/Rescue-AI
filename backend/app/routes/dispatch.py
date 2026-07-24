"""Emergency dispatch routes."""
import logging
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.schemas.incident_schema import DispatchRequest, DispatchResponse
from app.database.mongodb import get_db
from app.services.ambulance_service import ambulance_service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dispatch", tags=["dispatch"])


@router.post("/", response_model=DispatchResponse)
async def create_dispatch(request: DispatchRequest, db=Depends(get_db)):
    """
    Create emergency dispatch.
    
    - Receives 911 call information
    - Creates incident record
    - Dispatches ambulance simulation
    - Returns incident ID and status
    """
    try:
        # Create incident document
        incident_data = {
            "caller_name": request.caller_name,
            "phone": request.phone,
            "location": request.location,
            "latitude": request.latitude,
            "longitude": request.longitude,
            "status": "Ambulance Dispatched",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "severity": None,
            "hospital": None,
            "eta": None,
            "symptoms": None,
            "conversation": None,
            "image_url": None,
            "vision_analysis": None
        }
        
        result = await db["incidents"].insert_one(incident_data)
        incident_id = str(result.inserted_id)
        
        # Start ambulance simulation
        # Using central coordinates as ambulance starting point (slightly offset)
        ambulance_lat = request.latitude + 0.01
        ambulance_lon = request.longitude + 0.01
        
        try:
            # We'll set up the callback later in the main app
            await ambulance_service.start_ambulance_simulation(
                incident_id=incident_id,
                start_lat=ambulance_lat,
                start_lon=ambulance_lon,
                destination_lat=request.latitude,
                destination_lon=request.longitude,
                callback=None  # Callback will be set in main app
            )
        except Exception as e:
            logger.warning(f"Ambulance simulation failed to start: {e}")
            # Continue anyway, incident is already created
        
        logger.info(f"Dispatch created for incident {incident_id}")
        
        return DispatchResponse(
            incident_id=incident_id,
            status="Ambulance Dispatched",
            message=f"Emergency response dispatched to {request.location}"
        )
        
    except Exception as e:
        logger.error(f"Error creating dispatch: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create emergency dispatch"
        )


@router.get("/{incident_id}")
async def get_incident(incident_id: str, db=Depends(get_db)):
    """Get incident details."""
    try:
        incident = await db["incidents"].find_one({"_id": ObjectId(incident_id)})
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        incident["id"] = str(incident["_id"])
        incident.pop("_id", None)
        return incident
        
    except Exception as e:
        logger.error(f"Error retrieving incident: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve incident")


@router.get("/")
async def get_all_incidents(db=Depends(get_db)):
    """Get all incidents."""
    try:
        incidents = await db["incidents"].find().sort("created_at", -1).to_list(None)
        
        for incident in incidents:
            incident["id"] = str(incident["_id"])
            incident.pop("_id", None)
        
        return incidents
        
    except Exception as e:
        logger.error(f"Error retrieving incidents: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve incidents")
