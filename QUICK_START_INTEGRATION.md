# Quick Start - Frontend & Backend Integration (30 minutes)

## ✅ Current Status
- Backend: Running on `http://127.0.0.1:8000`
- Frontend: Running on `http://0.0.0.0:3000`
- Both ready to connect

## 🎯 Goal
Make frontend call backend, show real-time updates, and test end-to-end

## ⏱️ 30-Minute Integration Plan

### Step 1: Configure API URL (5 min)

**Create file**: `frontend/.env.local`

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SOCKET_URL=http://127.0.0.1:8000
```

**Save and reload frontend** (refresh browser at `http://0.0.0.0:3000`)

---

### Step 2: Test Backend Connection (5 min)

**Open browser console** and paste:

```javascript
// Test 1: Health check
fetch('http://127.0.0.1:8000/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend alive:', d))
  .catch(e => console.error('❌ Backend down:', e))

// Test 2: Get all incidents
fetch('http://127.0.0.1:8000/dispatch/')
  .then(r => r.json())
  .then(d => console.log('✅ Incidents:', d))
  .catch(e => console.error('❌ Failed:', e))
```

**Expected**: See green checkmarks in console

---

### Step 3: Add API Key to Backend (5 min)

**Edit**: `backend/.env`

Find and update:
```env
GEMINI_API_KEY=<your-key-from-https://makersuite.google.com/app/apikey>
GOOGLE_MAPS_API_KEY=<your-key>
```

**Restart backend**: Stop and run `python run.py` again

---

### Step 4: Test Create Dispatch (5 min)

**In browser console**, paste:

```javascript
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
  .then(d => {
    console.log('✅ Dispatch created:', d);
    window.incidentId = d.incident_id;
  })
  .catch(e => console.error('❌ Failed:', e))
```

**Expected**: See incident_id printed to console

---

### Step 5: Connect WebSocket (5 min)

**In browser console**, paste:

```javascript
// Install socket.io client first if needed
// npm install socket.io-client

const io = (await import('https://cdn.socket.io/4.7.2/socket.io.min.js')).io;
const socket = io('http://127.0.0.1:8000');

socket.on('connect', () => {
  console.log('✅ WebSocket connected');
});

socket.on('NEW_INCIDENT', (data) => {
  console.log('🚨 New incident received:', data);
});

socket.on('AMBULANCE_LOCATION', (data) => {
  console.log('📍 Ambulance location:', data);
});

socket.on('disconnect', () => {
  console.log('❌ WebSocket disconnected');
});
```

**Expected**: See "✅ WebSocket connected" message

---

### Step 6: Trigger Test Incident (5 min)

**In browser console**, run dispatch command from Step 4 again

**Watch WebSocket console** - should see:
```
✅ WebSocket connected
🚨 New incident received: {incident_id: "...", ...}
📍 Ambulance location: {latitude: 40.7135, longitude: -74.0045, ...}
📍 Ambulance location: {latitude: 40.7142, longitude: -74.0038, ...}
(updates every 5 seconds)
```

---

## ✅ If All Steps Work

🎉 **Congratulations!** Your frontend and backend are integrated!

### Next steps:
1. Wire up UI components to use these API calls
2. Display incidents in dashboard
3. Show ambulance location on map
4. Test image upload to vision endpoint

---

## ❌ If Something Fails

### Backend not responding?
```bash
# Check if backend is running
curl http://127.0.0.1:8000/health

# If not, restart:
cd backend
python run.py
```

### WebSocket won't connect?
```javascript
// Debug:
const socket = io('http://127.0.0.1:8000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ['websocket']
});

socket.on('error', (err) => console.error('Socket error:', err));
```

### CORS errors?
- Backend already allows all origins
- Use correct URL: `http://127.0.0.1:8000` (not `localhost` or `127.0.0.1:8000`)

### Gemini returning 500?
- Add `GEMINI_API_KEY` to backend `.env`
- Restart backend
- Try triage endpoint: `POST /triage/`

---

## 📋 Checklist

- [ ] Created `.env.local` in frontend folder
- [ ] Set `VITE_API_URL=http://127.0.0.1:8000`
- [ ] Restarted/refreshed frontend
- [ ] Health check works in console
- [ ] Added API keys to backend `.env`
- [ ] Restarted backend
- [ ] Dispatch creation works
- [ ] WebSocket connects
- [ ] Real-time ambulance updates visible

---

## 🚀 You're Ready For

✅ **Frontend to Backend API Calls**  
✅ **Real-time WebSocket Updates**  
✅ **End-to-End Testing**  
✅ **Vapi Integration (next)**  

---

## 💡 Pro Tip

Use browser DevTools Network tab to see all API calls and WebSocket messages:
1. Open DevTools (F12)
2. Go to Network tab
3. Make a dispatch call
4. See request/response in real-time

---

**Time to completion**: 30 minutes  
**Difficulty**: Easy  
**Next steps**: Wire up UI components

---

Need help? Check `INTEGRATION_GUIDE.md` for detailed explanations.
