# Quick Start Guide - Emergency Response Platform

Get the Emergency Response Platform backend up and running in minutes.

## 📋 Prerequisites

- Python 3.12 or higher
- MongoDB (local or cloud instance)
- API Keys:
  - Google Gemini API key
  - Google Maps API key
  - Twilio credentials (optional, for SMS features)

## ⚡ 5-Minute Setup

### 1. Create Python Virtual Environment

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected Output:**
```
Successfully installed fastapi-0.104.1 uvicorn[standard]-0.24.0 pydantic-2.5.0 ...
```

### 3. Configure Environment Variables

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your API keys
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Required API Keys:**
```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
MONGODB_URI=mongodb://localhost:27017
```

### 4. Start MongoDB

**Option A: Using Docker (Recommended)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: Using Local Installation**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows (if installed)
# Start MongoDB from Services or Command Line
mongod
```

**Verify MongoDB is Running:**
```bash
# Should connect without errors
mongosh mongodb://localhost:27017
```

### 5. Run the Application

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
INFO:     Connected to MongoDB
```

### 6. Verify Installation

Open your browser and navigate to:
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Test the API

### Initialize Sample Hospitals

```bash
curl -X POST http://localhost:8000/hospital/seed
```

**Response:**
```json
{
  "success": true,
  "message": "Seeded 4 hospitals"
}
```

### Create Emergency Dispatch

```bash
curl -X POST http://localhost:8000/dispatch/ \
  -H "Content-Type: application/json" \
  -d '{
    "caller_name": "John Doe",
    "phone": "+1-555-0100",
    "location": "123 Main St, NYC",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

**Response:**
```json
{
  "incident_id": "507f1f77bcf86cd799439011",
  "status": "Ambulance Dispatched",
  "message": "Emergency response dispatched to 123 Main St, NYC"
}
```

### Perform Triage Assessment

```bash
curl -X POST http://localhost:8000/triage/ \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "507f1f77bcf86cd799439011",
    "conversation": "Patient reports severe chest pain and shortness of breath. Blood pressure elevated at 160/100. History of hypertension."
  }'
```

**Response:**
```json
{
  "severity": "High",
  "summary": "Patient experiencing acute chest pain with dyspnea and elevated BP. Possible cardiac event.",
  "recommended_hospital": "Trauma Center"
}
```

### Calculate ETA

```bash
curl -X POST http://localhost:8000/hospital/eta \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "40.7128,-74.0060",
    "destination": "40.7580,-73.9855"
  }'
```

**Response:**
```json
{
  "eta_minutes": 8,
  "distance_km": 3.2,
  "duration_text": "8 mins"
}
```

## 🔌 Connect with WebSocket

### Using JavaScript (Web)

```javascript
const socket = io('http://localhost:8000', {
  transports: ['websocket']
});

// Listen for new incidents
socket.on('NEW_INCIDENT', (data) => {
  console.log('New incident:', data);
});

// Listen for ambulance location updates
socket.on('AMBULANCE_LOCATION', (data) => {
  console.log('Ambulance location:', data);
});

// Subscribe to incident
socket.emit('incident_subscribe', {
  incident_id: '507f1f77bcf86cd799439011'
});
```

### Using Python

```python
import socketio
import asyncio

sio = socketio.AsyncClient()

@sio.event
async def connect():
    print('Connection established')

@sio.on('NEW_INCIDENT')
async def on_incident(data):
    print(f'New incident: {data}')

@sio.on('AMBULANCE_LOCATION')
async def on_ambulance(data):
    print(f'Ambulance: {data}')

async def main():
    await sio.connect('http://localhost:8000')
    await sio.wait()

asyncio.run(main())
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py              ← Start here
│   ├── config.py            ← Configuration
│   ├── routes/              ← API endpoints
│   ├── services/            ← Business logic
│   ├── models/              ← Database models
│   ├── schemas/             ← Request/response validation
│   └── database/            ← MongoDB utilities
├── uploads/                 ← Image uploads directory
├── requirements.txt         ← Python dependencies
├── .env.example            ← Environment template
├── README.md               ← Full documentation
├── QUICKSTART.md           ← This file
└── test_components.py      ← Component tests
```

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'fastapi'"

**Solution:**
```bash
pip install -r requirements.txt
```

### Issue: "Connection refused to MongoDB"

**Solution:**
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017

# If not running:
# Docker: docker run -d -p 27017:27017 mongo:latest
# Local: mongod (or systemctl start mongod)
```

### Issue: "GEMINI_API_KEY not set"

**Solution:**
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `GEMINI_API_KEY=your_key_here`
3. Restart application

### Issue: "Port 8000 already in use"

**Solution:**
```bash
# Use different port
uvicorn app.main:app --port 8001
```

### Issue: "CORS errors in frontend"

**Solution:** CORS is already enabled for all origins in development. For production, update in `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/dispatch/` | Create emergency dispatch |
| GET | `/dispatch/{id}` | Get incident details |
| GET | `/dispatch/` | Get all incidents |
| POST | `/triage/` | AI triage assessment |
| POST | `/vision/analyze` | Upload & analyze image |
| GET | `/vision/get/{id}` | Get vision analysis |
| POST | `/hospital/eta` | Calculate ETA |
| GET | `/hospital/nearest` | Find nearest hospital |
| POST | `/hospital/alert` | Send hospital alert |
| POST | `/hospital/seed` | Seed sample hospitals |
| GET | `/health` | Health check |

## 🚀 Next Steps

1. **Frontend Integration**: Connect your frontend to WebSocket for real-time updates
2. **API Testing**: Use Swagger UI at `/docs` to test all endpoints
3. **Database Seeding**: Run `/hospital/seed` to populate hospitals
4. **Production Setup**: See README.md for deployment instructions
5. **Monitoring**: Check application logs for errors

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs
- **Full README**: See `README.md`
- **Component Tests**: Run `python test_components.py`
- **Configuration**: See `app/config.py`

## ✅ Health Check Validation

After startup, verify everything is working:

```bash
# Health check
curl http://localhost:8000/health

# Check API documentation is available
curl http://localhost:8000/docs

# Verify database connection
curl http://localhost:8000/hospital/seed
```

## 🎯 Demo Flow

1. **Create Dispatch** → Get `incident_id`
2. **Subscribe to WebSocket** → Listen for updates
3. **Perform Triage** → AI analyzes symptoms
4. **Watch Ambulance** → Real-time location updates every 5 seconds
5. **Upload Image** → Vision analysis for severity assessment
6. **Get ETA** → Calculate transport time to hospital
7. **Hospital Alert** → Broadcast incident to receiving facility

---

**Need Help?** Check the logs in the console for detailed error messages and troubleshooting information.
