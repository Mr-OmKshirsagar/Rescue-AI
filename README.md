# 🚑 Emergency Response Platform - AI-Powered Emergency Call Services

**Production-ready MVP backend for AI-powered Emergency Dispatch, Triage & Hospital Network Integration**

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Backend](https://img.shields.io/badge/backend-FastAPI%2BPython-blue)
![Frontend](https://img.shields.io/badge/frontend-React%2BTypeScript-cyan)
![Database](https://img.shields.io/badge/database-MongoDB-green)
![RealTime](https://img.shields.io/badge/realtime-Socket.IO-orange)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Integration Guide](#integration-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

Emergency Response Platform is a **hackathon MVP** that combines AI-powered triage, real-time ambulance tracking, vision-based injury assessment, and hospital network coordination into a unified emergency dispatch system.

**Key Capabilities:**
- 🎙️ **AI Voice Dispatcher** - Natural language emergency intake via Vapi AI
- 🤖 **Intelligent Triage** - Gemini 2.5 Flash severity classification
- 👁️ **Vision Analysis** - Injury detection from images (Gemini Vision)
- 📍 **Live Tracking** - Real-time ambulance location (Socket.IO)
- 🏥 **Hospital Network** - ETA calculation & bed availability
- 📱 **Multi-Channel** - Web dashboard, mobile-friendly UI

---

## Features

✅ **Emergency Dispatch**
- One-click emergency creation
- Auto-assigned nearest ambulance
- Real-time status updates

✅ **AI Triage Assessment**
- Symptom analysis via Gemini Flash
- Severity classification (Critical → Low)
- Hospital type recommendation

✅ **Vision-Based Injury Detection**
- Medical image upload from caller phone
- AI-powered injury analysis
- Confidence scoring & recommendation

✅ **Live Ambulance Tracking**
- Real-time location updates (5-second intervals)
- ETA countdown & distance calculation
- Speed & route visualization

✅ **Hospital Integration**
- Network of trauma centers & general hospitals
- ICU bed availability tracking
- Pre-arrival notification system

✅ **Real-time Dashboard**
- Live incident stream
- Ambulance telemetry
- Hospital capacity matrix

---

## Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.12+
- **Async Runtime**: Uvicorn 0.30+
- **Database**: MongoDB + Motor (async driver)
- **Real-time**: Socket.IO (python-socketio >= 5.11.0)
- **AI/ML**: Gemini 2.5 Flash + Gemini Vision
- **Maps**: Google Maps Distance Matrix API
- **SMS**: Twilio
- **Voice**: Vapi AI (integration-ready)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript 5.8
- **Build**: Vite 6.2
- **Styling**: Tailwind CSS 4
- **Real-time**: Socket.IO Client 4.7+
- **Server**: Express.js (dev middleware)
- **Maps**: @vis.gl/react-google-maps

### Database
- **MongoDB** (local or Atlas)
- Collections: `incidents`, `hospitals`
- Automatic indexing on critical fields

---

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+ & npm
- MongoDB (local or Atlas URI)
- API Keys:
  - `GEMINI_API_KEY` (Google AI Studio)
  - `GOOGLE_MAPS_API_KEY` (Google Cloud)

### 1️⃣ Backend Setup (Python)

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys:
# GEMINI_API_KEY=sk-...
# GOOGLE_MAPS_API_KEY=AIza...

# Start backend
python run.py
# Backend runs on http://127.0.0.1:8000
```

### 2️⃣ Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env.local:
echo "VITE_API_URL=http://127.0.0.1:8000" > .env.local
echo "VITE_SOCKET_URL=http://127.0.0.1:8000" >> .env.local

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

### 3️⃣ Verify Both Systems

**Terminal 1 - Backend Running:**
```
✅ Application startup complete [0.00s]
✅ Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 - Frontend Running:**
```
✅ Emergency Response Platform running at http://0.0.0.0:3000
```

**Browser:**
Visit `http://localhost:3000` and open DevTools (F12):

```javascript
// Test backend connection
fetch('http://127.0.0.1:8000/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend:', d))
```

---

## API Documentation

### Endpoints Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/dispatch/` | Create emergency incident |
| `GET` | `/dispatch/` | Get all incidents |
| `GET` | `/dispatch/{id}` | Get incident details |
| `POST` | `/triage/` | AI triage assessment |
| `POST` | `/vision/analyze` | Image analysis |
| `GET` | `/hospital/nearest` | Find closest hospital |
| `POST` | `/hospital/eta` | Calculate ETA |
| `POST` | `/hospital/alert` | Send hospital notification |
| `GET` | `/health` | System health check |

### Full API Docs
**Swagger UI**: `http://127.0.0.1:8000/docs`  
**ReDoc**: `http://127.0.0.1:8000/redoc`

---

## Integration Guide

### Step 1: Configure URLs

Frontend needs to know backend URL. Create `frontend/.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SOCKET_URL=http://127.0.0.1:8000
```

### Step 2: Add API Keys

Backend needs external service keys. Edit `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/emergencydb
GEMINI_API_KEY=your_gemini_key_here
GOOGLE_MAPS_API_KEY=your_maps_key_here
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
VAPI_API_KEY=your_vapi_key_here
```

### Step 3: Test Connection

In browser console:

```javascript
// Test 1: Health check
fetch('http://127.0.0.1:8000/health')
  .then(r => r.json())
  .then(console.log)

// Test 2: Create dispatch
fetch('http://127.0.0.1:8000/dispatch/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    caller_name: 'Test User',
    phone: '+1-555-0100',
    location: 'Test Location',
    latitude: 40.7128,
    longitude: -74.0060
  })
})
  .then(r => r.json())
  .then(console.log)

// Test 3: Connect WebSocket
const socket = io('http://127.0.0.1:8000');
socket.on('NEW_INCIDENT', data => console.log('Incident:', data));
```

### Step 4: Verify Real-time Updates

After creating a dispatch, you should see:
- ✅ Incident in MongoDB
- ✅ NEW_INCIDENT event on WebSocket
- ✅ AMBULANCE_LOCATION updates (every 5s)
- ✅ Dashboard updates in real-time

---

## Deployment

### Option 1: Render (Recommended)

**Backend Deployment:**
```bash
# Create Render service
# Name: emergency-response-backend
# Build command: pip install -r requirements.txt
# Start command: gunicorn app.main:app --worker-class uvicorn.workers.UvicornWorker
# Environment: Add all .env variables
```

**Frontend Deployment:**
```bash
# Create Render service
# Name: emergency-response-frontend
# Build command: npm install && npm run build
# Start command: npm run start
# Environment: VITE_API_URL=https://emergency-response-backend.onrender.com
```

### Option 2: Railway

```bash
# Backend
railway init
railway add postgresql  # or mongodb
railway link
railway up

# Frontend
railway add nodejs
railway up
```

### Option 3: Docker

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "run.py"]
```

Create `frontend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
```

---

## Troubleshooting

### Backend Won't Start

**Error**: `uvicorn: command not found`
```bash
# Solution: Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

**Error**: `GEMINI_API_KEY not set`
```bash
# Solution: Add to backend/.env
GEMINI_API_KEY=your_key_here
# Then restart: python run.py
```

### Frontend Won't Load

**Error**: `socket.io-client not found`
```bash
cd frontend
npm install socket.io-client
npm run dev
```

**Error**: `VITE_API_URL not configured`
```bash
# Create frontend/.env.local
echo "VITE_API_URL=http://127.0.0.1:8000" > .env.local
```

### WebSocket Won't Connect

**Error**: `WebSocket connection failed`
```javascript
// In console, check:
const socket = io('http://127.0.0.1:8000', {
  transports: ['websocket']
});
socket.on('error', err => console.error(err));
```

**Solution**: Ensure backend is running and Socket.IO is initialized

### API Returns 500 Error

**Check backend logs** for errors
**Add API keys** to `backend/.env`
**Restart backend** after changes
**Verify MongoDB** connection

---

## Project Structure

```
healthcare system/
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Settings & environment
│   │   ├── routes/
│   │   │   ├── dispatch.py        # Emergency creation
│   │   │   ├── triage.py          # AI assessment
│   │   │   ├── vision.py          # Image analysis
│   │   │   ├── hospital.py        # Hospital ops
│   │   │   └── websocket.py       # Socket.IO handlers
│   │   ├── services/
│   │   │   ├── gemini_service.py     # Triage AI
│   │   │   ├── vision_service.py     # Image AI
│   │   │   ├── maps_service.py       # ETA routing
│   │   │   ├── socket_service.py     # Real-time events
│   │   │   ├── ambulance_service.py  # Simulation
│   │   │   └── twilio_service.py     # SMS
│   │   ├── models/
│   │   │   ├── incident.py         # MongoDB model
│   │   │   └── hospital.py         # Hospital model
│   │   ├── schemas/
│   │   │   └── incident_schema.py  # Pydantic validation
│   │   └── database/
│   │       └── mongodb.py          # DB connection
│   ├── requirements.txt
│   ├── run.py
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/             # 11 React components
│   │   ├── hooks/
│   │   │   └── useSocket.ts       # WebSocket hook
│   │   ├── utils/
│   │   │   └── api.ts            # API utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── server.ts                  # Express dev server
│   └── .env.local
│
├── INTEGRATION_GUIDE.md
├── QUICK_START_INTEGRATION.md
├── SYSTEM_STATUS.md
└── README.md (this file)
```

---

## Next Steps

1. **Add API Keys**: Get keys from Google AI Studio, Google Cloud, Twilio
2. **Test Endpoints**: Use Swagger UI or browser console
3. **Connect Vapi**: Create voice call flows in Vapi dashboard
4. **Deploy**: Push to Render, Railway, or Docker
5. **Monitor**: Set up logging & error tracking

---

## Support

- 📖 **Detailed Integration**: See `INTEGRATION_GUIDE.md`
- ⚡ **Quick Setup**: See `QUICK_START_INTEGRATION.md`
- 📊 **System Status**: See `SYSTEM_STATUS.md`
- 🔧 **Backend Docs**: See `backend/README.md`

---

## License

MIT License - Built for emergency response innovation

---

**Built with ❤️ for faster, smarter emergency response**  
*Hackathon MVP - Production Ready in 48 Hours*

