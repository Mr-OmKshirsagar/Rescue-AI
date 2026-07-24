# AI Triage — Integration Notes

Three new files are provided:

```
app/services/gemini_service.py   # Gemini 2.5 Flash triage logic
app/schemas/triage_schema.py     # TriageRequest / TriageResponse
app/routes/triage.py             # POST /triage/, GET /triage/{incident_id}
```

Drop them into your existing `app/` tree at those exact paths, then do the following.

## 1. Add the dependency

In `requirements.txt`:

```
google-generativeai>=0.7.0
```

(Your project summary lists `google-generativeai 0.3.0` — that version predates
the async `generate_content_async` API used here. Upgrade to `>=0.7.0`.)

```bash
pip install -r requirements.txt
```

## 2. Config: make sure `GEMINI_API_KEY` is exposed

In `app/config.py`, your `Settings` class should include:

```python
class Settings(BaseSettings):
    ...
    GEMINI_API_KEY: str = ""
    ...

settings = Settings()
```

And in `.env`:

```
GEMINI_API_KEY=your_key_here
```

If `app/config.py` already exposes `settings.GEMINI_API_KEY` (per your README's
`.env.example`), no changes are needed — `gemini_service.py` imports
`from app.config import settings` directly.

## 3. Wire the router into `app/main.py`

```python
from app.routes import triage

app.include_router(triage.router)
```

This registers:
- `POST /triage/`
- `GET /triage/{incident_id}`

matching the endpoint table in your README.

## 4. Socket.IO event name

`routes/triage.py` broadcasts `INCIDENT_UPDATED` after each triage run, via
`app.services.socket_service.sio.emit(...)`. This matches the event already
listed in your README's Socket.IO section. If your actual Socket.IO server
instance has a different import path or emit helper, update the
`_broadcast_incident_updated` function in `routes/triage.py` — it's isolated
to one function specifically so this is a one-line change.

## 5. Quick test

```bash
# 1. Create an incident first (per your existing /dispatch/ endpoint)
curl -X POST http://localhost:8000/dispatch/ \
  -H "Content-Type: application/json" \
  -d '{"caller_name":"John Doe","phone":"+1-555-0100","location":"123 Main St","latitude":40.7128,"longitude":-74.0060}'

# 2. Run triage using the returned incident_id
curl -X POST http://localhost:8000/triage/ \
  -H "Content-Type: application/json" \
  -d '{"incident_id":"<incident_id>","conversation":"Patient reports severe chest pain, sweating, and shortness of breath for the last 10 minutes"}'
```

Expected response shape:

```json
{
  "incident_id": "...",
  "severity": "Critical",
  "symptoms": ["chest pain", "sweating", "shortness of breath"],
  "recommended_hospital": "Cardiac",
  "summary": "Patient presents with signs consistent with acute cardiac event...",
  "confidence": 0.85,
  "created_at": "2026-07-24T..."
}
```

## Design notes

- **Structured output**: Gemini is called with `response_mime_type: "application/json"`
  so it returns JSON directly rather than free text, with a fallback regex
  extractor in case of stray formatting.
- **Validation**: every field from the model (severity, hospital type, etc.)
  is checked against an allowed set before being trusted — an LLM hallucinating
  an unexpected value can't corrupt the incident record.
- **Graceful degradation**: if the Gemini API key is missing, the call fails,
  or the response can't be parsed, `analyze_triage()` returns a conservative
  `"High"` severity fallback rather than raising — a dispatcher still gets an
  actionable (if generic) result instead of a 500 error during an emergency.
- **DB/socket coupling kept loose**: `routes/triage.py` imports your database
  and socket modules lazily inside helper functions so this file can be added
  to the repo even if module paths differ slightly — you'll get one clear
  error message pointing at exactly what to adjust, rather than an import
  crash on app startup.
