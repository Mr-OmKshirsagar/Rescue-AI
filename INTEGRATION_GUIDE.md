# Emergency Response Platform - Frontend & Backend Integration Guide

**Status**: ✅ **Both systems running and ready to integrate**

- **Backend**: Running on `http://127.0.0.1:8000`
- **Frontend**: Running on `http://0.0.0.0:3000` 
- **Date**: July 24, 2026

---

## Current Setup

### Backend (Python/FastAPI)
```
✅ Running on http://127.0.0.1:8000
✅ MongoDB Connected
✅ 13 API endpoints ready
✅ Socket.IO configured
✅ Swagger UI at /docs
✅ Health check passing
```

### Frontend (React/TypeScript/Vite)
```
✅ Running on http://0.0.0.0:3000
✅ Components built: Landing, Dashboard, CallSimulator, etc.
✅ Express server running
✅ Tailwind CSS styled
✅ React Router configured
✅ Auth modal ready
```

---

## What Needs to Be Done

### 🔴 Critical: Backend URL Configuration

The frontend needs to know where the backend is running.

**File to edit**: `backend/server.ts` OR create `.env.local` in frontend

**Current issue**: Frontend is likely trying to connect to `/api/*` paths which need to be proxied to backend.

**Solution 1: Update Frontend .env**
Create or edit `frontend/.env.local`:
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SOCKET_URL=http://127.0.0.1:8000
```

**Solution 2: Configure Express Proxy** (in `server.ts`)
Add to express app:
```javascript
const apiProxy = httpProxy.createProxyServer({
  target: process.env.BACKEND_URL || 'http://127.0.0.1:8000',
  changeOrigin: true
});

app.use('/api', apiProxy);
app.use('/socket.io', apiProxy);
```

**Solution 3: Update Vite Config** (vite.config.ts)
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/socket.io': {
        target: 'http://127.0.0.1:8000',
        ws: true,
        changeOrigin: true
      }
    }
  }
});
```

---

## Integration Checklist

### Phase 1: API Connection ✅ Ready to do

- [ ] Configure VITE_API_URL in frontend `.env.local`
- [ ] Test `GET /health` from frontend
- [ ] Verify response in browser console
- [ ] Add GEMINI_API_KEY to backend `.env`
- [ ] Test POST /dispatch/ from frontend
- [ ] Verify incident appears in dashboard

### Phase 2: WebSocket Real-time Updates ✅ Ready to do

- [ ] Install Socket.IO client in frontend (if not already done)
- [ ] Create `useSocket` hook in frontend
- [ ] Connect to backend Socket.IO server
- [ ] Listen for NEW_INCIDENT event
- [ ] Listen for AMBULANCE_LOCATION event (every 5s)
- [ ] Update dashboard in real-time

### Phase 3: Call Simulator Integration ✅ Ready to do

- [ ] Wire CallSimulatorView to POST /dispatch/
- [ ] Get incident_id from response
- [ ] Pass to ambulance tracking
- [ ] Show real-time ambulance movement

### Phase 4: Vision/Camera Integration ✅ Ready to do

- [ ] Wire CameraUploadView to POST /vision/analyze
- [ ] Send incident_id + image file
- [ ] Display vision analysis result
- [ ] Update dashboard with severity

### Phase 5: Hospital Dashboard ✅ Ready to do

- [ ] Connect to Socket.IO NEW_INCIDENT event
- [ ] Display new incidents in real-time
- [ ] Show ambulance location updates
- [ ] Show ETA countdown
- [ ] Display hospital alert notifications

---

## What Frontend Components Exist

### ✅ Already Built Components
1. **Navbar** - Navigation + emergency alert toggle + notifications
2. **LandingHero** - Landing page hero section
3. **FeatureGrid** - Feature showcase
4. **HowItWorksTimeline** - How the system works
5. **LiveDemoPhone** - Demo phone mockup
6. **HospitalDashboard** - Hospital operations dashboard
7. **CallSimulatorView** - AI voice call simulator
8. **CameraUploadView** - Medical image upload
9. **DispatchMapView** - Live dispatch map
10. **AdminPanel** - Admin controls
11. **AuthModal** - Login/logout

### ✅ Types Defined
- `AppView` - All page views
- `User` - User model
- `NotificationItem` - Notification model
- Plus more in `types.ts`

---

## Quick Integration Steps

### Step 1: Add Backend API URL (5 min)

Create `frontend/.env.local`:
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SOCKET_URL=http://127.0.0.1:8000
```

### Step 2: Update Frontend API Calls (10 min)

In components, update all `fetch` calls to use env variable:

**Before**:
```javascript
fetch('/api/dispatch/')
```

**After**:
```javascript
fetch(`${import.meta.env.VITE_API_URL}/dispatch/`)
```

### Step 3: Connect Socket.IO (10 min)

Create `frontend/src/hooks/useSocket.ts`:
```typescript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket']
    });

    socket.on('NEW_INCIDENT', (data) => {
      console.log('New incident:', data);
      // Update dashboard
    });

    socket.on('AMBULANCE_LOCATION', (data) => {
      console.log('Ambulance location:', data);
      // Update map marker
    });

    setSocket(socket);

    return () => socket.disconnect();
  }, []);

  return socket;
}
```

### Step 4: Update Dashboard (15 min)

In `HospitalDashboard.tsx`:
```typescript
import { useSocket } from '../hooks/useSocket';

export function HospitalDashboard() {
  const socket = useSocket();
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    // Subscribe to incident updates
    socket?.emit('incident_subscribe', { incident_id: 'all' });
  }, [socket]);

  return (
    // Dashboard component
  );
}
```

---

## File Updates Needed

### 1. Frontend `.env.local` (NEW FILE)
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SOCKET_URL=http://127.0.0.1:8000
```

### 2. Backend `.env` (EXISTING - NEEDS API KEYS)
```env
GEMINI_API_KEY=<your-key>
GOOGLE_MAPS_API_KEY=<your-key>
```

### 3. Frontend `package.json` (CHECK/ADD SOCKET.IO)
```json
{
  "dependencies": {
    "socket.io-client": "^4.7.2"  // Add if missing
  }
}
```

### 4. Frontend components - Replace hardcoded URLs with env variables

Example pattern:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Use in fetch calls:
fetch(`${API_URL}/dispatch/`, ...)
```

---

## Testing the Integration

### Test 1: Backend Health (5 min)
```bash
# In browser console:
fetch('http://127.0.0.1:8000/health')
  .then(r => r.json())
  .then(console.log)
```
Expected: `{status: "healthy", app: "Emergency Response Platform", version: "1.0.0"}`

### Test 2: Create Dispatch (5 min)
```bash
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
```
Expected: `{incident_id: "...", status: "Ambulance Dispatched", message: "..."}`

### Test 3: WebSocket Connection (5 min)
```javascript
// In browser console:
const socket = io('http://127.0.0.1:8000');

socket.on('connect', () => {
  console.log('✅ Connected to backend');
});

socket.on('CONNECTION_RESPONSE', (data) => {
  console.log('Server response:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from backend');
});
```

### Test 4: Trigger Dispatch (10 min)
```javascript
// This should trigger both HTTP and WebSocket events
fetch('http://127.0.0.1:8000/dispatch/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    caller_name: 'John Test',
    phone: '+1-555-0100',
    location: 'Test Location',
    latitude: 40.7128,
    longitude: -74.0060
  })
})
```
Check WebSocket listener - should receive `NEW_INCIDENT` event

---

## Directory Structure

```
healthcare system/
├── backend/                    (Python/FastAPI)
│   ├── app/
│   ├── requirements.txt
│   ├── .env                    ← ADD API KEYS HERE
│   ├── run.py
│   └── (running on :8000)
│
├── frontend/                   (React/TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   ├── types.ts
│   │   └── main.tsx
│   ├── package.json
│   ├── .env.local              ← CREATE THIS FILE
│   ├── server.ts
│   ├── vite.config.ts
│   └── (running on :3000)
│
└── INTEGRATION_GUIDE.md (this file)
```

---

## Common Issues & Solutions

### Issue 1: CORS Errors

**Problem**: Frontend can't call backend
**Solution**: 
- Backend already has CORS enabled (`allow_origins=["*"]`)
- Ensure using correct URL: `http://127.0.0.1:8000` (not `localhost`)
- Check browser console for exact error

### Issue 2: WebSocket Connection Fails

**Problem**: Socket.IO won't connect
**Solution**:
- Verify backend is running: `http://127.0.0.1:8000/docs`
- Check Socket.IO namespace: `/socket.io` 
- Try: `io('http://127.0.0.1:8000', { transports: ['websocket'] })`
- Install socket.io-client: `npm install socket.io-client`

### Issue 3: API Key Errors

**Problem**: Gemini/Maps endpoints return 500 errors
**Solution**:
- Add API keys to backend `.env`:
  ```env
  GEMINI_API_KEY=sk-...
  GOOGLE_MAPS_API_KEY=AIza...
  ```
- Restart backend after adding keys
- Test: `POST /triage/` should work

### Issue 4: Images Won't Upload

**Problem**: Vision analysis fails
**Solution**:
- Ensure `uploads/` directory exists
- Check file size < 10MB
- Verify file is valid image format
- Check GEMINI_API_KEY is set

---

## Next Phase: Vapi Integration

Once frontend↔backend integration is working, next step is Vapi:

1. **Create Vapi Account**: https://dashboard.vapi.ai
2. **Define Tools in Vapi**:
   - `dispatch_ambulance` → `POST /dispatch/`
   - `perform_triage` → `POST /triage/`
   - `analyze_image` → `POST /vision/analyze`
   - `get_eta` → `POST /hospital/eta`
   - `send_hospital_alert` → `POST /hospital/alert`

3. **Configure Vapi Voice Flow**:
   - Call starts
   - Vapi greets caller
   - Collects incident info
   - Calls dispatch_ambulance
   - Gets triage assessment
   - Confirms hospital
   - Ends call

---

## Timeline

### Today (2-3 hours)
- [x] Backend validation complete
- [x] Frontend running
- [ ] Configure API URLs
- [ ] Test API connections
- [ ] Connect WebSocket

### Tomorrow (Full day)
- [ ] Wire all API calls
- [ ] Test real-time updates
- [ ] Polish dashboard
- [ ] Test end-to-end flow

### Day 3 (1-2 days)
- [ ] Integrate Vapi
- [ ] Test voice flow
- [ ] Deploy to production
- [ ] Go live!

---

## Success Criteria

You'll know integration is working when:

✅ Frontend loads at `http://0.0.0.0:3000`  
✅ Backend API responds at `http://127.0.0.1:8000/docs`  
✅ Click "Create Dispatch" button → incident created in MongoDB  
✅ Dashboard shows incident in real-time (via Socket.IO)  
✅ Ambulance location updates every 5 seconds  
✅ Vision image upload works  
✅ Triage analysis displays in dashboard  
✅ Call simulator triggers dispatch  

---

## Quick Reference

**Backend Port**: 8000  
**Frontend Port**: 3000  
**API Documentation**: http://127.0.0.1:8000/docs  
**Real-time Protocol**: Socket.IO (at `/socket.io` namespace)  
**Database**: MongoDB (local or Atlas)  

**Key API Endpoints**:
- `POST /dispatch/` - Create emergency
- `POST /triage/` - AI analysis
- `POST /vision/analyze` - Image analysis
- `GET /hospital/nearest` - Find hospital
- `POST /hospital/eta` - Calculate ETA

**Key Socket Events**:
- `NEW_INCIDENT` - New emergency reported
- `AMBULANCE_LOCATION` - Ambulance position (every 5s)
- `INCIDENT_UPDATED` - Incident changed
- `VISION_RESULT` - Image analysis complete

---

## Questions?

1. **How do I add API keys?** → Edit backend `.env`, restart backend
2. **Where are incidents stored?** → MongoDB (verify with MongoDB Compass)
3. **Why isn't WebSocket connecting?** → Check backend is running, verify Socket.IO namespace
4. **Can I test without Vapi?** → Yes! Use frontend call simulator or curl commands
5. **How do I deploy?** → See backend's DEPLOYMENT_CHECKLIST.md

---

**Status**: ✅ **Ready for integration**

Next step: Configure `.env` files and test API connections.
