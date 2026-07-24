"""WebSocket/Socket.IO routes."""
import logging
import socketio
from typing import Callable
from app.services.ambulance_service import ambulance_service

logger = logging.getLogger(__name__)

# Socket.IO instance
sio: socketio.AsyncServer = None


def get_sio() -> socketio.AsyncServer:
    """Get Socket.IO instance."""
    return sio


def set_sio(socket_server: socketio.AsyncServer):
    """Set Socket.IO instance."""
    global sio
    sio = socket_server


# Connected clients
connected_clients = set()


@staticmethod
async def on_connect(sid: str, environ):
    """Handle client connection."""
    connected_clients.add(sid)
    logger.info(f"Client connected: {sid}, Total clients: {len(connected_clients)}")
    
    await sio.emit("CONNECTION_RESPONSE", {
        "data": "Connected to Emergency Response Platform",
        "count": len(connected_clients)
    }, to=sid)


@staticmethod
async def on_disconnect(sid: str):
    """Handle client disconnection."""
    connected_clients.discard(sid)
    logger.info(f"Client disconnected: {sid}, Total clients: {len(connected_clients)}")


@staticmethod
async def on_ambulance_subscribe(sid: str, data: dict):
    """Handle ambulance subscription."""
    incident_id = data.get("incident_id")
    logger.info(f"Client {sid} subscribed to ambulance for incident {incident_id}")
    
    await sio.emit("SUBSCRIPTION_RESPONSE", {
        "success": True,
        "message": f"Subscribed to ambulance updates for {incident_id}"
    }, to=sid)


@staticmethod
async def on_incident_subscribe(sid: str, data: dict):
    """Handle incident subscription."""
    incident_id = data.get("incident_id")
    logger.info(f"Client {sid} subscribed to incident {incident_id}")
    
    await sio.emit("SUBSCRIPTION_RESPONSE", {
        "success": True,
        "message": f"Subscribed to incident {incident_id}"
    }, to=sid)


# Callback for ambulance location updates
async def ambulance_location_callback(position_data: dict):
    """Callback for ambulance location updates."""
    if sio:
        try:
            await sio.emit("AMBULANCE_LOCATION", position_data)
            logger.debug(f"Ambulance location broadcasted: {position_data.get('ambulance_id')}")
        except Exception as e:
            logger.error(f"Error emitting ambulance location: {e}")


def setup_socket_handlers(socket_server: socketio.AsyncServer):
    """Setup Socket.IO event handlers."""
    global sio
    sio = socket_server
    
    # Register event handlers
    sio.on("connect")(on_connect)
    sio.on("disconnect")(on_disconnect)
    sio.on("ambulance_subscribe")(on_ambulance_subscribe)
    sio.on("incident_subscribe")(on_incident_subscribe)
    
    logger.info("Socket.IO handlers registered")
