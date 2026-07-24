"""Gemini AI service for triage and analysis."""
import logging
import json
import re
from typing import Dict, Any
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    """Service for interacting with Gemini AI."""
    
    MODEL_NAME = "gemini-2.5-flash"
    
    @staticmethod
    async def analyze_triage(conversation: str) -> Dict[str, Any]:
        """
        Analyze emergency conversation using Gemini Flash.
        
        Args:
            conversation: Patient conversation transcript
            
        Returns:
            Dict with severity, summary, and recommended hospital
        """
        try:
            prompt = f"""Analyze the following emergency call conversation and provide a medical triage assessment.

CONVERSATION:
{conversation}

Please provide your response as a JSON object with exactly these fields:
{{
    "severity": "Critical" or "High" or "Moderate" or "Low",
    "summary": "Brief medical summary of symptoms and condition",
    "recommended_hospital": "Type of hospital needed (e.g., Trauma Center, Cardiac Center, General Hospital, Pediatric Hospital)",
    "symptoms": "Comma-separated list of identified symptoms"
}}

Important: Return ONLY valid JSON, no additional text."""

            model = genai.GenerativeModel(self.MODEL_NAME)
            response = model.generate_content(prompt)
            
            # Extract JSON from response
            response_text = response.text.strip()
            
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response_text)
            
            logger.info(f"Triage analysis completed: {result}")
            
            # Ensure all required fields
            return {
                "severity": result.get("severity", "Moderate"),
                "summary": result.get("summary", "Unable to determine"),
                "recommended_hospital": result.get("recommended_hospital", "General Hospital"),
                "symptoms": result.get("symptoms", "")
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            return {
                "severity": "Moderate",
                "summary": "Emergency medical attention required",
                "recommended_hospital": "General Hospital",
                "symptoms": ""
            }
        except Exception as e:
            logger.error(f"Error in triage analysis: {e}")
            return {
                "severity": "Moderate",
                "summary": "Error processing triage",
                "recommended_hospital": "General Hospital",
                "symptoms": ""
            }
    
    @staticmethod
    async def extract_symptoms(conversation: str) -> str:
        """
        Extract symptoms from conversation.
        
        Args:
            conversation: Patient conversation transcript
            
        Returns:
            Extracted symptoms as string
        """
        try:
            prompt = f"""Extract all medical symptoms mentioned in this emergency call conversation.
            
CONVERSATION:
{conversation}

Return only a comma-separated list of symptoms, nothing else."""

            model = genai.GenerativeModel(self.MODEL_NAME)
            response = model.generate_content(prompt)
            
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting symptoms: {e}")
            return ""
    
    @staticmethod
    async def generate_summary(conversation: str) -> str:
        """
        Generate medical summary from conversation.
        
        Args:
            conversation: Patient conversation transcript
            
        Returns:
            Medical summary
        """
        try:
            prompt = f"""Provide a brief professional medical summary of this emergency call.

CONVERSATION:
{conversation}

Summary (2-3 sentences max):"""

            model = genai.GenerativeModel(self.MODEL_NAME)
            response = model.generate_content(prompt)
            
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return ""
