"""Hospital and ETA routes."""
import logging
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.schemas.incident_schema import ETARequest, ETAResponse, HospitalAlertPayload
from app.database.mongodb import get_db
from app.services.maps_service import MapsService
from app.services.socket_service import SocketIOService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hospital", tags=["hospital"])

# Socket.IO service instance will be injected
socket_service: SocketIOService = None


def set_socket_service(service: SocketIOService):
    """Set Socket.IO service instance."""
    global socket_service
    socket_service = service


@router.post("/eta", response_model=ETAResponse)
async def get_eta(request: ETARequest):
    """
    Calculate ETA between origin and destination using Google Maps API.
    
    - Accepts origin and destination
    - Calls Google Maps Distance Matrix API
    - Returns ETA, distance, and duration
    """
    try:
        logger.info(f"Calculating ETA from {request.origin} to {request.destination}")
        
        result = await MapsService.get_eta(request.origin, request.destination)
        
        return ETAResponse(
            eta_minutes=result["eta_minutes"],
            distance_km=result["distance_km"],
            duration_text=result["duration_text"]
        )
        
    except Exception as e:
        logger.error(f"Error calculating ETA: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to calculate ETA"
        )


@router.post("/alert")
async def send_hospital_alert(alert: HospitalAlertPayload, db=Depends(get_db)):
    """
    Send alert to hospital about incoming patient.
    
    - Broadcasts hospital alert via Socket.IO
    - Includes patient info, severity, and ETA
    """
    try:
        logger.info(f"Sending hospital alert for incident {alert.incident_id}")
        
        # Verify incident exists
        incident = await db["incidents"].find_one({"_id": ObjectId(alert.incident_id)})
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        # Emit hospital alert via Socket.IO
        if socket_service:
            try:
                await socket_service.emit_hospital_alert({
                    "incident_id": alert.incident_id,
                    "patient_name": alert.patient_name,
                    "location": alert.location,
                    "latitude": alert.latitude,
                    "longitude": alert.longitude,
                    "severity": alert.severity,
                    "hospital": alert.hospital,
                    "eta_minutes": alert.eta_minutes,
                    "image_url": alert.image_url,
                    "vision_analysis": alert.vision_analysis,
                    "symptoms": alert.symptoms
                })
            except Exception as e:
                logger.warning(f"Failed to emit Socket.IO event: {e}")
        
        return {
            "success": True,
            "message": f"Alert sent to {alert.hospital}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending hospital alert: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to send hospital alert"
        )


@router.get("/nearest")
async def find_nearest_hospital(
    latitude: float,
    longitude: float,
    db=Depends(get_db)
):
    """
    Find nearest hospital to patient location.
    
    - Uses patient coordinates
    - Queries available hospitals
    - Returns nearest hospital with distance and ETA
    """
    try:
        logger.info(f"Finding nearest hospital to {latitude},{longitude}")
        
        # Get all hospitals from database
        hospitals = await db["hospitals"].find().to_list(None)
        
        if not hospitals:
            logger.warning("No hospitals configured in database")
            return {"message": "No hospitals available"}
        
        # Convert ObjectId to string
        for hospital in hospitals:
            hospital["_id"] = str(hospital["_id"])
        
        # Find nearest
        nearest = await MapsService.find_nearest_hospital(latitude, longitude, hospitals)
        
        if nearest:
            nearest["_id"] = str(nearest.get("_id", ""))
        
        return nearest or {"message": "Unable to find nearest hospital"}
        
    except Exception as e:
        logger.error(f"Error finding nearest hospital: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to find nearest hospital"
        )


@router.post("/seed")
async def seed_hospitals(db=Depends(get_db)):
    """
    Seed database with sample hospitals (for development).
    """
    try:
        hospitals_collection = db["hospitals"]
        
        # Check if hospitals already exist
        existing = await hospitals_collection.count_documents({})
        if existing > 0:
            return {"message": f"{existing} hospitals already exist"}
        
        # Sample hospitals
        sample_hospitals = [
            {
                "name": "City Trauma Center",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "type": "Trauma Center",
                "beds_available": 15,
                "phone": "+1-555-0100"
            },
            {
                "name": "Central Hospital",
                "latitude": 40.7580,
                "longitude": -73.9855,
                "type": "General Hospital",
                "beds_available": 20,
                "phone": "+1-555-0200"
            },
            {
                "name": "Heart Institute",
                "latitude": 40.7614,
                "longitude": -73.9776,
                "type": "Cardiac Center",
                "beds_available": 10,
                "phone": "+1-555-0300"
            },
            {
                "name": "Emergency Medical Center",
                "latitude": 40.6892,
                "longitude": -74.0445,
                "type": "General Hospital",
                "beds_available": 25,
                "phone": "+1-555-0400"
            }
        ]
        
        result = await hospitals_collection.insert_many(sample_hospitals)
        
        logger.info(f"Seeded {len(result.inserted_ids)} hospitals")
        
        return {
            "success": True,
            "message": f"Seeded {len(result.inserted_ids)} hospitals"
        }
        
    except Exception as e:
        logger.error(f"Error seeding hospitals: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to seed hospitals"
        )
