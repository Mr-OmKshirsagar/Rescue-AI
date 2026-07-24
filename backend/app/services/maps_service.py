"""Google Maps service for distance and ETA calculations."""
import logging
from typing import Dict, Any, Tuple
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class MapsService:
    """Service for Google Maps API interactions."""
    
    BASE_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"
    
    @staticmethod
    async def get_eta(origin: str, destination: str) -> Dict[str, Any]:
        """
        Get ETA and distance between two locations.
        
        Args:
            origin: Origin coordinates as "lat,lng" or address
            destination: Destination coordinates as "lat,lng" or address
            
        Returns:
            Dict with eta_minutes, distance_km, and duration_text
        """
        try:
            params = {
                "origins": origin,
                "destinations": destination,
                "key": settings.GOOGLE_MAPS_API_KEY,
                "units": "metric"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(MapsService.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
            
            # Parse response
            if data["status"] != "OK":
                logger.warning(f"Maps API error: {data.get('error_message', 'Unknown error')}")
                return MapsService._default_eta()
            
            if not data.get("rows") or not data["rows"][0].get("elements"):
                logger.warning("No routes found")
                return MapsService._default_eta()
            
            element = data["rows"][0]["elements"][0]
            
            if element["status"] != "OK":
                logger.warning(f"Route status: {element['status']}")
                return MapsService._default_eta()
            
            distance_meters = element["distance"]["value"]
            duration_seconds = element["duration"]["value"]
            
            # Convert to required units
            distance_km = distance_meters / 1000
            eta_minutes = duration_seconds // 60
            
            result = {
                "eta_minutes": int(eta_minutes),
                "distance_km": round(distance_km, 2),
                "duration_text": element["duration"]["text"]
            }
            
            logger.info(f"ETA calculated: {result}")
            return result
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error in Maps service: {e}")
            return MapsService._default_eta()
        except Exception as e:
            logger.error(f"Error calculating ETA: {e}")
            return MapsService._default_eta()
    
    @staticmethod
    def _default_eta() -> Dict[str, Any]:
        """Return default ETA when calculation fails."""
        return {
            "eta_minutes": 10,
            "distance_km": 5.0,
            "duration_text": "~10 mins"
        }
    
    @staticmethod
    async def get_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Get distance between two coordinates in km.
        
        Args:
            lat1, lon1: First coordinate
            lat2, lon2: Second coordinate
            
        Returns:
            Distance in kilometers
        """
        try:
            origin = f"{lat1},{lon1}"
            destination = f"{lat2},{lon2}"
            
            result = await MapsService.get_eta(origin, destination)
            return result["distance_km"]
            
        except Exception as e:
            logger.error(f"Error calculating distance: {e}")
            return 0.0
    
    @staticmethod
    async def find_nearest_hospital(patient_lat: float, patient_lon: float, hospitals: list) -> Dict[str, Any]:
        """
        Find nearest hospital to patient location.
        
        Args:
            patient_lat, patient_lon: Patient coordinates
            hospitals: List of hospital dictionaries with lat/lon
            
        Returns:
            Nearest hospital with distance and ETA
        """
        try:
            if not hospitals:
                return {}
            
            patient_loc = f"{patient_lat},{patient_lon}"
            nearest = None
            min_distance = float('inf')
            
            for hospital in hospitals:
                hospital_loc = f"{hospital['latitude']},{hospital['longitude']}"
                eta_data = await MapsService.get_eta(patient_loc, hospital_loc)
                distance = eta_data["distance_km"]
                
                if distance < min_distance:
                    min_distance = distance
                    nearest = {
                        **hospital,
                        "distance_km": distance,
                        "eta_minutes": eta_data["eta_minutes"],
                        "duration_text": eta_data["duration_text"]
                    }
            
            logger.info(f"Nearest hospital: {nearest.get('name', 'Unknown')} at {min_distance} km")
            return nearest or {}
            
        except Exception as e:
            logger.error(f"Error finding nearest hospital: {e}")
            return {}
