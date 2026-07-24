"""Ambulance simulation service."""
import logging
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
import math
import random
from app.config import settings

logger = logging.getLogger(__name__)


class AmbulanceService:
    """Service for simulating ambulance movement."""
    
    def __init__(self):
        """Initialize ambulance service."""
        self.active_ambulances: Dict[str, Dict[str, Any]] = {}
    
    async def start_ambulance_simulation(
        self,
        incident_id: str,
        start_lat: float,
        start_lon: float,
        destination_lat: float,
        destination_lon: float,
        callback: callable
    ) -> str:
        """
        Start ambulance simulation for an incident.
        
        Args:
            incident_id: Incident ID
            start_lat, start_lon: Ambulance starting coordinates
            destination_lat, destination_lon: Destination coordinates
            callback: Async callback function to call on position updates
            
        Returns:
            Ambulance ID
        """
        try:
            ambulance_id = f"amb-{incident_id}"
            
            # Calculate distance and ETA
            distance = self._calculate_distance(start_lat, start_lon, destination_lat, destination_lon)
            speed_ms = settings.AMBULANCE_SPEED * 1000 / 3600  # Convert km/h to m/s
            estimated_duration_seconds = (distance * 1000) / speed_ms if speed_ms > 0 else 300
            
            ambulance_data = {
                "incident_id": incident_id,
                "start_lat": start_lat,
                "start_lon": start_lon,
                "current_lat": start_lat,
                "current_lon": start_lon,
                "destination_lat": destination_lat,
                "destination_lon": destination_lon,
                "distance_m": distance * 1000,
                "total_distance_m": distance * 1000,
                "estimated_duration_s": estimated_duration_seconds,
                "elapsed_time_s": 0,
                "speed_kmh": settings.AMBULANCE_SPEED,
                "status": "en_route",
                "created_at": datetime.utcnow(),
                "callback": callback,
                "update_interval": settings.AMBULANCE_UPDATE_INTERVAL
            }
            
            self.active_ambulances[ambulance_id] = ambulance_data
            
            # Start update task
            asyncio.create_task(self._update_ambulance_position(ambulance_id))
            
            logger.info(f"Ambulance simulation started: {ambulance_id} (Distance: {distance:.2f}km, ETA: {estimated_duration_seconds/60:.1f}min)")
            
            return ambulance_id
            
        except Exception as e:
            logger.error(f"Error starting ambulance simulation: {e}")
            raise
    
    async def _update_ambulance_position(self, ambulance_id: str):
        """Update ambulance position periodically."""
        try:
            ambulance = self.active_ambulances.get(ambulance_id)
            if not ambulance:
                return
            
            while ambulance["status"] == "en_route":
                # Sleep for update interval
                await asyncio.sleep(ambulance["update_interval"])
                
                ambulance["elapsed_time_s"] += ambulance["update_interval"]
                
                # Calculate progress
                progress = min(1.0, ambulance["elapsed_time_s"] / ambulance["estimated_duration_s"])
                
                # Calculate current position (linear interpolation)
                start_lat = ambulance["start_lat"]
                start_lon = ambulance["start_lon"]
                dest_lat = ambulance["destination_lat"]
                dest_lon = ambulance["destination_lon"]
                
                ambulance["current_lat"] = start_lat + (dest_lat - start_lat) * progress
                ambulance["current_lon"] = start_lon + (dest_lon - start_lon) * progress
                
                # Calculate remaining distance
                remaining_distance = self._calculate_distance(
                    ambulance["current_lat"],
                    ambulance["current_lon"],
                    dest_lat,
                    dest_lon
                )
                ambulance["distance_m"] = remaining_distance * 1000
                
                # Check if arrived
                if progress >= 0.99 or remaining_distance < 0.05:
                    ambulance["status"] = "arrived"
                    ambulance["current_lat"] = dest_lat
                    ambulance["current_lon"] = dest_lon
                    ambulance["distance_m"] = 0
                
                # Call callback with updated position
                if ambulance["callback"]:
                    try:
                        await ambulance["callback"]({
                            "ambulance_id": ambulance_id,
                            "incident_id": ambulance["incident_id"],
                            "latitude": ambulance["current_lat"],
                            "longitude": ambulance["current_lon"],
                            "distance_m": ambulance["distance_m"],
                            "eta_seconds": int(max(0, ambulance["estimated_duration_s"] - ambulance["elapsed_time_s"])),
                            "status": ambulance["status"],
                            "speed_kmh": ambulance["speed_kmh"]
                        })
                    except Exception as e:
                        logger.error(f"Error in ambulance callback: {e}")
                
                # Clean up after arrival
                if ambulance["status"] == "arrived":
                    logger.info(f"Ambulance {ambulance_id} arrived at destination")
                    await asyncio.sleep(5)  # Keep for a bit longer
                    break
        
        except asyncio.CancelledError:
            logger.info(f"Ambulance simulation cancelled for {ambulance_id}")
        except Exception as e:
            logger.error(f"Error in ambulance position update: {e}")
        finally:
            # Clean up
            if ambulance_id in self.active_ambulances:
                del self.active_ambulances[ambulance_id]
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points in kilometers using Haversine formula.
        
        Args:
            lat1, lon1: First point coordinates
            lat2, lon2: Second point coordinates
            
        Returns:
            Distance in kilometers
        """
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def get_ambulance_status(self, ambulance_id: str) -> Optional[Dict[str, Any]]:
        """Get ambulance status."""
        ambulance = self.active_ambulances.get(ambulance_id)
        if not ambulance:
            return None
        
        return {
            "ambulance_id": ambulance_id,
            "incident_id": ambulance["incident_id"],
            "latitude": ambulance["current_lat"],
            "longitude": ambulance["current_lon"],
            "distance_m": ambulance["distance_m"],
            "eta_seconds": int(max(0, ambulance["estimated_duration_s"] - ambulance["elapsed_time_s"])),
            "status": ambulance["status"],
            "speed_kmh": ambulance["speed_kmh"]
        }
    
    async def cancel_ambulance(self, ambulance_id: str) -> bool:
        """Cancel ambulance simulation."""
        if ambulance_id in self.active_ambulances:
            self.active_ambulances[ambulance_id]["status"] = "cancelled"
            del self.active_ambulances[ambulance_id]
            logger.info(f"Ambulance {ambulance_id} cancelled")
            return True
        return False


# Global instance
ambulance_service = AmbulanceService()
