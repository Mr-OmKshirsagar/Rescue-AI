# Emergency Response Platform - Backend MVP

An AI-powered emergency response system that leverages machine learning and real-time communication to optimize emergency medical services.

## 🚀 Features

- **AI-Powered Triage**: Uses Gemini 2.5 Flash to analyze emergency conversations and recommend appropriate care levels
- **Real-Time Vision Analysis**: Analyzes injury images using Gemini Vision for rapid assessment
- **Real-Time Location Tracking**: Socket.IO integration for live ambulance tracking and incident updates
- **Automatic Ambulance Dispatch**: Simulates ambulance dispatch and tracks ETA using Google Maps API
- **Hospital Network Integration**: Finds nearest hospitals and sends alerts via Socket.IO
- **SMS Notifications**: Twilio integration for patient communication
- **Production-Ready Architecture**: Async FastAPI with clean separation of concerns

## 📋 Tech Stack

- **Backend**: FastAPI with async/await
- **Python**: 3.12+
- **Database**: MongoDB with Motor (async driver)
- **Real-Time**: Socket.IO
- **AI/ML**: Google Gemini API
- **APIs**: Google Maps Distance Matrix, Twilio SMS
- **Server**: Uvicorn ASGI

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── config.py              # Configuration settings
│   ├── routes/                # API endpoints
│   │   ├── dispatch.py        # Emergency dispatch
│   │   ├── triage.py          # AI triage assessment
│   │   ├── vision.py          # Image analysis
│   │   ├── hospital.py        # Hospital & ETA
│   │   └── websocket.py       # Socket.IO handlers
│   ├── services/              # Business logic
│   │   ├── gemini_service.py  # Gemini AI
│   │   ├── vision_service.py  # Vision analysis
│   │   ├── maps_service.py    # Google Maps
│   │   ├── twilio_service.py  # SMS service
│   │   ├── ambulance_service.py # Ambulance simulation
│   │   └── socket_service.py  # Socket.IO events
│   ├── models/                # Database models
│   │   ├── incident.py
│   │   └── hospital.py
│   ├── schemas/               # Pydantic schemas
│   │   └── incident_schema.py
│   └── database/              # Database utilities
│       └── mongodb.py
├── uploads/                   # File upload directory
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔧 Installation

### Prerequisites
- Python 3.12+
- MongoDB (local or cloud)
- API Keys:
  - Google Gemini API
  - Google Maps API
  - Twilio (for SMS features)

### Setup Steps

1. **Clone the repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

5. **Start MongoDB** (if running locally)
```bash
# For Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally:
mongod
```

6. **Run the application**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📡 API Endpoints

### Emergency Dispatch
```
POST /dispatch/
- Create emergency dispatch
- Input: caller_name, phone, location, latitude, longitude
- Returns: incident_id, status
```

### Triage Assessment
```
POST /triage/
- Analyze emergency conversation with AI
- Input: incident_id, conversation
- Returns: severity, summary, recommended_hospital
```

### Vision Analysis
```
POST /vision/analyze
- Upload and analyze injury image
- Input: incident_id, image file
- Returns: severity, analysis, recommendation, confidence
```

### Hospital & ETA
```
POST /hospital/eta
- Calculate ETA and distance
- Input: origin, destination
- Returns: eta_minutes, distance_km, duration_text

GET /hospital/nearest
- Find nearest hospital
- Input: latitude, longitude
- Returns: hospital details with distance and ETA

POST /hospital/seed
- Initialize sample hospitals (development)
```

### Incident Retrieval
```
GET /dispatch/{incident_id}
- Get incident details

GET /dispatch/
- Get all incidents
```

## 🔌 Socket.IO Events

### Client → Server
- `ambulance_subscribe`: Subscribe to ambulance updates
- `incident_subscribe`: Subscribe to incident updates

### Server → Client
- `NEW_INCIDENT`: New emergency reported
- `INCIDENT_UPDATED`: Incident status changed
- `AMBULANCE_LOCATION`: Ambulance position update (every 5 seconds)
- `VISION_RESULT`: Image analysis complete
- `ETA_UPDATED`: ETA recalculated
- `HOSPITAL_ALERT`: Alert sent to hospital
- `CONNECTION_RESPONSE`: Connection confirmation
- `SUBSCRIPTION_RESPONSE`: Subscription confirmation

## 🧠 AI Services

### Gemini Triage
- Analyzes emergency conversation transcripts
- Extracts symptoms and medical history
- Estimates severity (Critical, High, Moderate, Low)
- Recommends hospital type (Trauma Center, Cardiac, etc.)

### Gemini Vision
- Analyzes injury photographs
- Assesses injury severity
- Provides medical recommendations
- Returns confidence score

## 🚑 Ambulance Simulation

The system includes realistic ambulance simulation:
- Starts from nearby location
- Calculates distance to patient
- Updates position every 5 seconds
- Broadcasts location via Socket.IO
- Simulates realistic ETA based on distance and speed

## 📊 Database Models

### Incident
```json
{
  "_id": "ObjectId",
  "caller_name": "string",
  "phone": "string",
  "location": "string",
  "latitude": "float",
  "longitude": "float",
  "symptoms": "string",
  "conversation": "string",
  "severity": "string",
  "hospital": "string",
  "eta": "int",
  "status": "string",
  "image_url": "string",
  "vision_analysis": "object",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Hospital
```json
{
  "_id": "ObjectId",
  "name": "string",
  "latitude": "float",
  "longitude": "float",
  "type": "string",
  "beds_available": "int",
  "phone": "string"
}
```

## 🔐 Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=emergency_response

# Google APIs
GEMINI_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here

# Twilio
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Vapi (future integration)
VAPI_API_KEY=your_key_here

# Application
DEBUG=true
APP_NAME=Emergency Response Platform
```

## 🧪 Testing

### Test Emergency Dispatch
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

### Test Triage
```bash
curl -X POST http://localhost:8000/triage/ \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "your_incident_id",
    "conversation": "Patient reports chest pain and shortness of breath"
  }'
```

### Test Hospital Seeding
```bash
curl -X POST http://localhost:8000/hospital/seed
```

### Test ETA
```bash
curl -X POST http://localhost:8000/hospital/eta \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "40.7128,-74.0060",
    "destination": "40.7580,-73.9855"
  }'
```

## 📈 Logging

The application logs all critical operations:
- Incoming emergency calls
- Gemini requests and responses
- Vision analysis results
- Socket.IO events
- Ambulance position updates
- Errors and exceptions

Check logs in the console output or configure file logging in `config.py`.

## 🚀 Production Deployment

### Docker Deployment
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Setup
1. Configure all API keys in `.env`
2. Set `DEBUG=false` for production
3. Use production MongoDB URI
4. Enable HTTPS (use reverse proxy like Nginx)
5. Configure CORS properly

### Scaling Considerations
- Use connection pooling for MongoDB
- Implement caching for Maps API responses
- Consider message queue for high-volume incidents
- Use Redis for Socket.IO message brokering
- Implement rate limiting on endpoints

## 🤝 Integration Points

### Frontend Integration
- Connect to `ws://localhost:8000/socket.io` for real-time updates
- Use `/docs` (Swagger UI) for API exploration
- Handle `NEW_INCIDENT`, `AMBULANCE_LOCATION`, and `VISION_RESULT` events

### External Services
- **Google Gemini**: For AI analysis (requires API key)
- **Google Maps**: For distance/ETA calculations
- **Twilio**: For SMS notifications
- **MongoDB**: For data persistence

## 📝 License

MIT License

## 🙏 Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review error logs
3. Ensure all API keys are configured
4. Verify MongoDB connection

## 🎯 Future Enhancements

- [ ] Real ambulance tracking integration
- [ ] Real phone call ingestion via Vapi
- [ ] Advanced routing optimization
- [ ] Multi-language support
- [ ] Machine learning for triage improvement
- [ ] Historical analytics dashboard
- [ ] Integration with emergency management systems
- [ ] Mobile app notifications
- [ ] Predictive ambulance deployment
