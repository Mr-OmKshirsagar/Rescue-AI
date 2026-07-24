"""Main FastAPI application for Emergency Response Platform."""
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import socketio
import uvicorn

from app.config import settings
from app.database.mongodb import connect_to_mongo, disconnect_from_mongo
from app.services.socket_service import SocketIOService
from app.services.ambulance_service import ambulance_service
from app.routes import dispatch, triage, vision, hospital, websocket
from app.routes.triage import set_socket_service as set_triage_socket
from app.routes.vision import set_socket_service as set_vision_socket
from app.routes.hospital import set_socket_service as set_hospital_socket

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Initialize Socket.IO
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    ping_interval=settings.SOCKET_PING_INTERVAL,
    ping_timeout=settings.SOCKET_PING_TIMEOUT
)

# Socket.IO ASGI app
socket_io_app = socketio.ASGIApp(sio, static_files={
    '/': 'static/index.html',
})

# Global Socket.IO service
socket_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    logger.info("Starting Emergency Response Platform...")
    try:
        await connect_to_mongo()
        logger.info("MongoDB connected")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise
    
    # Setup Socket.IO handlers
    setup_socket_handlers()
    
    # Setup Socket.IO service for routes
    global socket_service
    socket_service = SocketIOService(sio)
    set_triage_socket(socket_service)
    set_vision_socket(socket_service)
    set_hospital_socket(socket_service)
    
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Emergency Response Platform...")
    await disconnect_from_mongo()
    logger.info("Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Emergency Response Platform",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routes
app.include_router(dispatch.router)
app.include_router(triage.router)
app.include_router(vision.router)
app.include_router(hospital.router)


def setup_socket_handlers():
    """Setup Socket.IO event handlers."""
    
    @sio.event
    async def connect(sid, environ):
        """Handle client connection."""
        logger.info(f"Client connected: {sid}")
        await sio.emit("CONNECTION_RESPONSE", {
            "data": "Connected to Emergency Response Platform",
            "message": "Welcome!"
        }, to=sid)
    
    @sio.event
    async def disconnect(sid):
        """Handle client disconnection."""
        logger.info(f"Client disconnected: {sid}")
    
    @sio.event
    async def ambulance_subscribe(sid, data):
        """Handle ambulance subscription."""
        incident_id = data.get("incident_id")
        logger.info(f"Client {sid} subscribed to ambulance for incident {incident_id}")
        await sio.emit("SUBSCRIPTION_RESPONSE", {
            "success": True,
            "message": f"Subscribed to ambulance updates"
        }, to=sid)
    
    @sio.event
    async def incident_subscribe(sid, data):
        """Handle incident subscription."""
        incident_id = data.get("incident_id")
        logger.info(f"Client {sid} subscribed to incident {incident_id}")
        await sio.emit("SUBSCRIPTION_RESPONSE", {
            "success": True,
            "message": f"Subscribed to incident updates"
        }, to=sid)


# Set ambulance service callback
async def ambulance_callback(position_data: dict):
    """Callback for ambulance location updates."""
    if sio:
        try:
            await sio.emit("AMBULANCE_LOCATION", position_data)
            logger.debug(f"Ambulance location broadcasted")
        except Exception as e:
            logger.error(f"Error emitting ambulance location: {e}")


# Override ambulance service callback during startup
ambulance_service._default_callback = ambulance_callback


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Emergency Response Platform API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


# Mount Socket.IO app
app.mount("/socket.io", socket_io_app)


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
