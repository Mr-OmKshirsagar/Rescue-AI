"""
gemini_service.py

AI-powered medical triage using Google Gemini 2.5 Flash.

Responsibilities:
- Take a raw emergency conversation/transcript (+ optional structured symptoms)
- Ask Gemini to extract symptoms, estimate severity, recommend a hospital type,
  and produce a short clinical-style summary
- Return a clean, validated dict the rest of the app can trust

This module is defensive by design: Gemini is asked to return strict JSON,
but LLM output is never trusted blindly. Every field is validated/clamped
before it reaches the database or the client.
"""

import json
import logging
import re
from typing import Optional

import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-2.5-flash"

VALID_SEVERITIES = {"Critical", "High", "Moderate", "Low"}
VALID_HOSPITAL_TYPES = {"Trauma Center", "Cardiac", "General", "Pediatric", "Burn Center"}

_configured = False


def _ensure_configured() -> None:
    """Lazily configure the Gemini SDK so importing this module never fails
    just because an API key hasn't been set yet (e.g. during tests)."""
    global _configured
    if _configured:
        return
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set - triage calls will fail until configured.")
    else:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    _configured = True


TRIAGE_SYSTEM_PROMPT = """You are a medical triage assistant supporting a 911-style
emergency dispatch system. You are NOT diagnosing a patient or providing medical
advice to the public - you are helping a dispatcher quickly prioritize an
already-reported emergency based on the caller's own words.

Given the emergency conversation/transcript below, respond with ONLY a single
JSON object (no markdown fences, no commentary, no extra text) matching this
exact schema:

{
  "severity": "Critical" | "High" | "Moderate" | "Low",
  "symptoms": ["short symptom phrase", ...],
  "recommended_hospital_type": "Trauma Center" | "Cardiac" | "General" | "Pediatric" | "Burn Center",
  "summary": "one or two sentence clinical-style summary for the dispatcher",
  "confidence": 0.0 to 1.0
}

Severity guidance:
- Critical: immediate life threat (e.g. not breathing, unresponsive, severe bleeding, cardiac arrest)
- High: serious but not immediately fatal (e.g. chest pain, difficulty breathing, major trauma)
- Moderate: needs prompt care but stable (e.g. fractures, moderate bleeding, persistent pain)
- Low: non-urgent (e.g. minor cuts, mild symptoms)

If information is insufficient, make the most reasonable conservative estimate
(when in doubt, prefer the higher severity) and lower the confidence score
accordingly. Always return valid JSON matching the schema exactly."""


def _extract_json(raw_text: str) -> dict:
    """Gemini is instructed to return raw JSON, but models sometimes wrap
    output in markdown fences or add stray text. This strips that safely."""
    text = raw_text.strip()

    # Strip ```json ... ``` or ``` ... ``` fences if present
    fence_match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if fence_match:
        text = fence_match.group(1)
    else:
        # Fall back to grabbing the first {...} block in the text
        brace_match = re.search(r"\{.*\}", text, re.DOTALL)
        if brace_match:
            text = brace_match.group(0)

    return json.loads(text)


def _validate_and_normalize(data: dict) -> dict:
    """Clamp/validate model output so bad or partial JSON never propagates
    into the database with an unexpected shape."""
    severity = data.get("severity")
    if severity not in VALID_SEVERITIES:
        logger.warning("Gemini returned unrecognized severity %r, defaulting to 'Moderate'", severity)
        severity = "Moderate"

    hospital_type = data.get("recommended_hospital_type")
    if hospital_type not in VALID_HOSPITAL_TYPES:
        logger.warning(
            "Gemini returned unrecognized hospital type %r, defaulting to 'General'", hospital_type
        )
        hospital_type = "General"

    symptoms = data.get("symptoms")
    if not isinstance(symptoms, list):
        symptoms = []
    symptoms = [str(s).strip() for s in symptoms if str(s).strip()][:10]

    summary = str(data.get("summary") or "").strip()
    if not summary:
        summary = "Insufficient information provided for detailed summary."

    try:
        confidence = float(data.get("confidence", 0.5))
    except (TypeError, ValueError):
        confidence = 0.5
    confidence = max(0.0, min(1.0, confidence))

    return {
        "severity": severity,
        "symptoms": symptoms,
        "recommended_hospital_type": hospital_type,
        "summary": summary,
        "confidence": confidence,
    }


def _fallback_result(reason: str) -> dict:
    """Used when Gemini is unavailable or returns unusable output. Defaults
    to a conservative (higher-caution) severity so a dispatcher still gets
    something actionable rather than a hard failure."""
    return {
        "severity": "High",
        "symptoms": [],
        "recommended_hospital_type": "General",
        "summary": f"Automated triage unavailable ({reason}). Manual review required.",
        "confidence": 0.0,
    }


async def analyze_triage(conversation: str, symptoms: Optional[str] = None) -> dict:
    """
    Run AI triage analysis on an emergency conversation.

    Args:
        conversation: Raw conversation/transcript text between dispatcher and caller.
        symptoms: Optional pre-extracted symptom text to include as extra context.

    Returns:
        dict with keys: severity, symptoms, recommended_hospital_type, summary, confidence
    """
    _ensure_configured()

    if not conversation or not conversation.strip():
        return _fallback_result("empty conversation")

    if not settings.GEMINI_API_KEY:
        return _fallback_result("missing API key")

    prompt_parts = [TRIAGE_SYSTEM_PROMPT, "\n\nCONVERSATION:\n", conversation.strip()]
    if symptoms:
        prompt_parts.append(f"\n\nADDITIONAL REPORTED SYMPTOMS:\n{symptoms.strip()}")
    prompt = "".join(prompt_parts)

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        )
        response = await model.generate_content_async(prompt)
        raw_text = response.text
        logger.info("Gemini triage raw response received (%d chars)", len(raw_text or ""))
        parsed = _extract_json(raw_text)
        return _validate_and_normalize(parsed)

    except json.JSONDecodeError as e:
        logger.error("Failed to parse Gemini triage response as JSON: %s", e)
        return _fallback_result("invalid AI response format")
    except Exception as e:  # noqa: BLE001 - external API call, want a clean fallback
        logger.error("Gemini triage request failed: %s", e)
        return _fallback_result("AI service error")
