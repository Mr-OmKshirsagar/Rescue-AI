"""Vision analysis routes."""
import logging
import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from bson import ObjectId
from datetime import datetime
from app.database.mongodb import get_db
from app.services.vision_service import VisionService
from app.services.socket_service import SocketIOService
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vision", tags=["vision"])

# Socket.IO service instance will be injected
socket_service: SocketIOService = None


def set_socket_service(service: SocketIOService):
    """Set Socket.IO service instance."""
    global socket_service
    socket_service = service


@router.post("/analyze")
async def analyze_vision(
    incident_id: str = Form(...),
    file: UploadFile = File(...),
    db=Depends(get_db)
):
    """
    Analyze uploaded injury image using Gemini Vision.
    
    - Accepts image upload
    - Performs vision analysis
    - Saves result to database
    - Broadcasts to dashboard via Socket.IO
    """
    try:
        # Verify incident exists
        incident = await db["incidents"].find_one({"_id": ObjectId(incident_id)})
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        # Create uploads directory if it doesn't exist
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Save uploaded file
        file_path = os.path.join(settings.UPLOAD_DIR, f"{incident_id}_{file.filename}")
        
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File too large"
            )
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        logger.info(f"File saved: {file_path}")
        
        # Perform vision analysis
        logger.info(f"Analyzing image for incident {incident_id}")
        
        analysis_result = await VisionService.analyze_image_from_bytes(
            content,
            mime_type=file.content_type or "image/jpeg"
        )
        
        # Update incident with vision results
        image_url = f"/uploads/{incident_id}_{file.filename}"
        
        update_data = {
            "image_url": image_url,
            "vision_analysis": analysis_result,
            "status": f"Vision Analysis Complete - {analysis_result['severity']}",
            "updated_at": datetime.utcnow()
        }
        
        # Update severity if vision analysis is more critical
        current_severity = incident.get("severity", "Low")
        severity_order = {"Critical": 4, "High": 3, "Moderate": 2, "Low": 1}
        
        if severity_order.get(analysis_result["severity"], 0) > severity_order.get(current_severity, 0):
            update_data["severity"] = analysis_result["severity"]
        
        await db["incidents"].update_one(
            {"_id": ObjectId(incident_id)},
            {"$set": update_data}
        )
        
        logger.info(f"Vision analysis completed: {analysis_result}")
        
        # Emit update via Socket.IO
        if socket_service:
            try:
                await socket_service.emit_vision_result({
                    "incident_id": incident_id,
                    "severity": analysis_result["severity"],
                    "analysis": analysis_result["analysis"],
                    "recommendation": analysis_result["recommendation"],
                    "confidence": analysis_result["confidence"],
                    "image_url": image_url
                })
            except Exception as e:
                logger.warning(f"Failed to emit Socket.IO event: {e}")
        
        return {
            "success": True,
            "severity": analysis_result["severity"],
            "analysis": analysis_result["analysis"],
            "recommendation": analysis_result["recommendation"],
            "confidence": analysis_result["confidence"],
            "image_url": image_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in vision analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze image"
        )


@router.get("/get/{incident_id}")
async def get_vision_analysis(incident_id: str, db=Depends(get_db)):
    """Get vision analysis for an incident."""
    try:
        incident = await db["incidents"].find_one({"_id": ObjectId(incident_id)})
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        return {
            "incident_id": incident_id,
            "image_url": incident.get("image_url"),
            "vision_analysis": incident.get("vision_analysis")
        }
        
    except Exception as e:
        logger.error(f"Error retrieving vision analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve vision analysis")
