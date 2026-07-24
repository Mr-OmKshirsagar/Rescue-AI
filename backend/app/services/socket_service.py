"""Socket.IO service for real-time events."""
import logging
from typing import Dict, Any, Optional
import socketio

logger = logging.getLogger(__name__)


class SocketIOService:
    """Service for Socket.IO event management."""
    
    # Event types
    EVENT_NEW_INCIDENT = "NEW_INCIDENT"
    EVENT_INCIDENT_UPDATED = "INCIDENT_UPDATED"
    EVENT_AMBULANCE_LOCATION = "AMBULANCE_LOCATION"
    EVENT_VISION_RESULT = "VISION_RESULT"
    EVENT_ETA_UPDATED = "ETA_UPDATED"
    EVENT_HOSPITAL_ALERT = "HOSPITAL_ALERT"
    
    def __init__(self, sio: socketio.AsyncServer):
        """Initialize Socket.IO service."""
        self.sio = sio
    
    async def emit_new_incident(self, data: Dict[str, Any]) -> None:
        """
        Emit new incident to all connected clients.
        
        Args:
            data: Incident data to emit
        """
        try:
            await self.sio.emit(
                self.EVENT_NEW_INCIDENT,
                data,
                skip_sid=None
            )
            logger.info(f"Emitted NEW_INCIDENT: {data.get('incident_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error emitting new incident: {e}")
    
    async def emit_incident_updated(self, data: Dict[str, Any]) -> None:
        """Emit incident update to all connected clients."""
        try:
            await self.sio.emit(
                self.EVENT_INCIDENT_UPDATED,
                data,
                skip_sid=None
            )
            logger.info(f"Emitted INCIDENT_UPDATED: {data.get('incident_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error emitting incident update: {e}")
    
    async def emit_ambulance_location(self, data: Dict[str, Any]) -> None:
        """Emit ambulance location update."""
        try:
            await self.sio.emit(
                self.EVENT_AMBULANCE_LOCATION,
                data,
                skip_sid=None
            )
            logger.debug(f"Emitted AMBULANCE_LOCATION for {data.get('ambulance_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error emitting ambulance location: {e}")
    
    async def emit_vision_result(self, data: Dict[str, Any]) -> None:
        """Emit vision analysis result."""
        try:
            await self.sio.emit(
                self.EVENT_VISION_RESULT,
                data,
                skip_sid=None
            )
            logger.info(f"Emitted VISION_RESULT: {data.get('incident_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error emitting vision result: {e}")
    
    async def emit_eta_updated(self, data: Dict[str, Any]) -> None:
        """Emit ETA update."""
        try:
            await self.sio.emit(
                self.EVENT_ETA_UPDATED,
                data,
                skip_sid=None
            )
            logger.debug(f"Emitted ETA_UPDATED for {data.get('incident_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error emitting ETA update: {e}")
    
    async def emit_hospital_alert(self, data: Dict[str, Any]) -> None:
        """Emit hospital alert."""
        try:
            await self.sio.emit(
                self.EVENT_HOSPITAL_ALERT,
                data,
                skip_sid=None
            )
            logger.info(f"Emitted HOSPITAL_ALERT for {data.get('hospital', 'unknown')}")
        except Exception as e:
            logger.error(f"Error emitting hospital alert: {e}")
    
    async def emit_to_room(self, room: str, event: str, data: Dict[str, Any]) -> None:
        """Emit event to specific room."""
        try:
            await self.sio.emit(event, data, to=room)
            logger.debug(f"Emitted {event} to room {room}")
        except Exception as e:
            logger.error(f"Error emitting to room: {e}")
    
    async def emit_to_client(self, sid: str, event: str, data: Dict[str, Any]) -> None:
        """Emit event to specific client."""
        try:
            await self.sio.emit(event, data, to=sid)
            logger.debug(f"Emitted {event} to client {sid}")
        except Exception as e:
            logger.error(f"Error emitting to client: {e}")
