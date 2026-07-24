"""Configuration module for Emergency Response Platform."""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings:
    """Application settings."""
    
    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = "emergency_response"
    
    # APIs
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    # Twilio
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    
    # Vapi
    VAPI_API_KEY: str = os.getenv("VAPI_API_KEY", "")
    
    # Application
    APP_NAME: str = "Emergency Response Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # File uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Socket.IO
    SOCKET_PING_INTERVAL: int = 60
    SOCKET_PING_TIMEOUT: int = 120
    
    # Ambulance simulation
    AMBULANCE_UPDATE_INTERVAL: int = 5  # seconds
    AMBULANCE_SPEED: float = 60  # km/h


settings = Settings()
