"""Twilio service for SMS notifications."""
import logging
from typing import Dict, Any
from twilio.rest import Client
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Twilio client
try:
    twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
except Exception as e:
    logger.warning(f"Twilio not fully configured: {e}")
    twilio_client = None


class TwilioService:
    """Service for Twilio SMS operations."""
    
    @staticmethod
    async def send_camera_link(phone: str, incident_id: str, upload_url: str) -> Dict[str, Any]:
        """
        Send camera link to patient via SMS.
        
        Args:
            phone: Patient phone number
            incident_id: Incident ID
            upload_url: URL for uploading images
            
        Returns:
            Dict with success status and message
        """
        try:
            if not twilio_client:
                logger.warning("Twilio client not configured")
                return {
                    "success": False,
                    "message": "SMS service not configured",
                    "sid": None
                }
            
            message_body = f"""Emergency Response: Please share injury photos to help us assess your condition.

Click here to upload: {upload_url}

Incident ID: {incident_id}

Reply STOP to opt out."""

            message = twilio_client.messages.create(
                body=message_body,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone
            )
            
            logger.info(f"SMS sent successfully. SID: {message.sid}")
            
            return {
                "success": True,
                "message": "Camera link sent via SMS",
                "sid": message.sid
            }
            
        except Exception as e:
            logger.error(f"Error sending SMS: {e}")
            return {
                "success": False,
                "message": f"Failed to send SMS: {str(e)}",
                "sid": None
            }
    
    @staticmethod
    async def send_alert(phone: str, alert_message: str) -> Dict[str, Any]:
        """
        Send alert SMS.
        
        Args:
            phone: Recipient phone number
            alert_message: Alert message text
            
        Returns:
            Dict with success status and message
        """
        try:
            if not twilio_client:
                logger.warning("Twilio client not configured")
                return {
                    "success": False,
                    "message": "SMS service not configured",
                    "sid": None
                }
            
            message = twilio_client.messages.create(
                body=alert_message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone
            )
            
            logger.info(f"Alert SMS sent successfully. SID: {message.sid}")
            
            return {
                "success": True,
                "message": "Alert sent",
                "sid": message.sid
            }
            
        except Exception as e:
            logger.error(f"Error sending alert SMS: {e}")
            return {
                "success": False,
                "message": f"Failed to send alert: {str(e)}",
                "sid": None
            }
    
    @staticmethod
    async def send_hospital_alert(hospital_phone: str, incident_details: str) -> Dict[str, Any]:
        """
        Send alert to hospital.
        
        Args:
            hospital_phone: Hospital phone number
            incident_details: Incident details
            
        Returns:
            Dict with success status and message
        """
        try:
            if not twilio_client:
                logger.warning("Twilio client not configured")
                return {
                    "success": False,
                    "message": "SMS service not configured",
                    "sid": None
                }
            
            message = twilio_client.messages.create(
                body=incident_details,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=hospital_phone
            )
            
            logger.info(f"Hospital alert sent. SID: {message.sid}")
            
            return {
                "success": True,
                "message": "Hospital alert sent",
                "sid": message.sid
            }
            
        except Exception as e:
            logger.error(f"Error sending hospital alert: {e}")
            return {
                "success": False,
                "message": f"Failed to send alert: {str(e)}",
                "sid": None
            }
