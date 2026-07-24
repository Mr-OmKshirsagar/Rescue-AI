"""Vision service for image analysis."""
import logging
import json
import re
from typing import Dict, Any
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class VisionService:
    """Service for image analysis using Gemini Vision."""
    
    MODEL_NAME = "gemini-2.5-flash"
    
    @staticmethod
    async def analyze_image(image_path: str) -> Dict[str, Any]:
        """
        Analyze medical image using Gemini Vision.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dict with severity, analysis, recommendation, and confidence
        """
        try:
            # Read image file
            with open(image_path, "rb") as f:
                image_data = f.read()
            
            # Create image content
            image_content = {
                "mime_type": "image/jpeg",  # Assuming JPEG, can be enhanced
                "data": image_data
            }
            
            prompt = """Analyze this injury/medical image from an emergency scene and provide assessment.

Please provide your response as a JSON object with exactly these fields:
{
    "severity": "Critical" or "High" or "Moderate" or "Low",
    "analysis": "Detailed description of visible injuries or medical conditions",
    "recommendation": "Recommended immediate treatment or action",
    "confidence": 0.0 to 1.0 confidence score,
    "possible_injury": "Most likely diagnosis or injury type"
}

Important: Return ONLY valid JSON, no additional text."""

            model = genai.GenerativeModel(self.MODEL_NAME)
            response = model.generate_content([image_content, prompt])
            
            response_text = response.text.strip()
            
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response_text)
            
            logger.info(f"Vision analysis completed: {result}")
            
            return {
                "severity": result.get("severity", "Moderate"),
                "analysis": result.get("analysis", "Unable to analyze image"),
                "recommendation": result.get("recommendation", "Seek immediate medical attention"),
                "confidence": result.get("confidence", 0.5),
                "possible_injury": result.get("possible_injury", "Unknown injury")
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse vision response as JSON: {e}")
            return {
                "severity": "Moderate",
                "analysis": "Image analyzed but details unclear",
                "recommendation": "Seek immediate medical attention",
                "confidence": 0.3,
                "possible_injury": "Unknown"
            }
        except FileNotFoundError as e:
            logger.error(f"Image file not found: {e}")
            return {
                "severity": "Unknown",
                "analysis": "Image not found",
                "recommendation": "Unable to analyze",
                "confidence": 0.0,
                "possible_injury": "Error"
            }
        except Exception as e:
            logger.error(f"Error in vision analysis: {e}")
            return {
                "severity": "Moderate",
                "analysis": "Error processing image",
                "recommendation": "Seek immediate medical attention",
                "confidence": 0.0,
                "possible_injury": "Unknown"
            }
    
    @staticmethod
    async def analyze_image_from_bytes(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
        """
        Analyze medical image from bytes using Gemini Vision.
        
        Args:
            image_bytes: Image data as bytes
            mime_type: MIME type of the image
            
        Returns:
            Dict with severity, analysis, recommendation, and confidence
        """
        try:
            prompt = """Analyze this injury/medical image from an emergency scene and provide assessment.

Please provide your response as a JSON object with exactly these fields:
{
    "severity": "Critical" or "High" or "Moderate" or "Low",
    "analysis": "Detailed description of visible injuries or medical conditions",
    "recommendation": "Recommended immediate treatment or action",
    "confidence": 0.0 to 1.0 confidence score,
    "possible_injury": "Most likely diagnosis or injury type"
}

Important: Return ONLY valid JSON, no additional text."""

            model = genai.GenerativeModel(self.MODEL_NAME)
            response = model.generate_content([
                {"mime_type": mime_type, "data": image_bytes},
                prompt
            ])
            
            response_text = response.text.strip()
            
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response_text)
            
            logger.info(f"Vision analysis completed: {result}")
            
            return {
                "severity": result.get("severity", "Moderate"),
                "analysis": result.get("analysis", "Unable to analyze image"),
                "recommendation": result.get("recommendation", "Seek immediate medical attention"),
                "confidence": result.get("confidence", 0.5),
                "possible_injury": result.get("possible_injury", "Unknown injury")
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse vision response as JSON: {e}")
            return {
                "severity": "Moderate",
                "analysis": "Image analyzed but details unclear",
                "recommendation": "Seek immediate medical attention",
                "confidence": 0.3,
                "possible_injury": "Unknown"
            }
        except Exception as e:
            logger.error(f"Error in vision analysis: {e}")
            return {
                "severity": "Moderate",
                "analysis": "Error processing image",
                "recommendation": "Seek immediate medical attention",
                "confidence": 0.0,
                "possible_injury": "Unknown"
            }
