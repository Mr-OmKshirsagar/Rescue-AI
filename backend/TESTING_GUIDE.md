# Testing Guide - Emergency Response Platform API

Complete guide for testing all API endpoints and features.

## 🚀 Starting the Application

```bash
# Terminal 1: Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Run tests (optional)
python -m pytest tests/ -v
```

## 🧪 Using Swagger UI

1. Navigate to: http://localhost:8000/docs
2. All endpoints are listed with request/response examples
3. Click "Try it out" on any endpoint to test it
4. Responses show status codes and data

## 📡 API Test Workflow

### Step 1: Initialize System

#### Seed Hospitals
**Request:**
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

---

### Step 2: Create Emergency Incident

#### Create Dispatch
**Request:**
```bash
curl -X POST http://localhost:8000/dispatch/ \
  -H "Content-Type: application/json" \
  -d '{
    "caller_name": "John Doe",
    "phone": "+1-555-0100",
    "location": "123 Main St, New York, NY 10001",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

**Response:**
```json
{
  "incident_id": "507f1f77bcf86cd799439011",
  "status": "Ambulance Dispatched",
  "message": "Emergency response dispatched to 123 Main St, New York, NY 10001"
}
```

**Save the `incident_id` for next steps!**

---

### Step 3: Retrieve Incident

#### Get Incident by ID
**Request:**
```bash
curl -X GET http://localhost:8000/dispatch/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "caller_name": "John Doe",
  "phone": "+1-555-0100",
  "location": "123 Main St, New York, NY 10001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "status": "Ambulance Dispatched",
  "severity": null,
  "hospital": null,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

#### Get All Incidents
**Request:**
```bash
curl -X GET http://localhost:8000/dispatch/
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "caller_name": "John Doe",
    "status": "Ambulance Dispatched",
    ...
  }
]
```

---

### Step 4: Perform AI Triage

#### Triage Assessment
**Request:**
```bash
curl -X POST http://localhost:8000/triage/ \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "507f1f77bcf86cd799439011",
    "conversation": "Patient is experiencing severe chest pain radiating to the left arm. Shortness of breath. Started 30 minutes ago. Has history of hypertension. Blood pressure is elevated at 160/100. Patient is a 52-year-old male. No known allergies. Takes lisinopril for hypertension."
  }'
```

**Response:**
```json
{
  "severity": "High",
  "summary": "52-year-old male with acute chest pain radiating to left arm, dyspnea, elevated BP. Possible acute coronary syndrome.",
  "recommended_hospital": "Trauma Center"
}
```

---

### Step 5: Get ETA to Hospital

#### Calculate ETA
**Request:**
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

---

### Step 6: Find Nearest Hospital

#### Get Nearest Hospital
**Request:**
```bash
curl -X GET "http://localhost:8000/hospital/nearest?latitude=40.7128&longitude=-74.0060"
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "City Trauma Center",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "type": "Trauma Center",
  "beds_available": 15,
  "phone": "+1-555-0100",
  "distance_km": 0.0,
  "eta_minutes": 1,
  "duration_text": "1 min"
}
```

---

### Step 7: Upload and Analyze Medical Image

#### Upload Image
**Request:**
```bash
curl -X POST http://localhost:8000/vision/analyze \
  -F "incident_id=507f1f77bcf86cd799439011" \
  -F "file=@/path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "severity": "High",
  "analysis": "Significant bruising and laceration visible on forehead and left side of face. Possible head trauma.",
  "recommendation": "Immediate neurosurgical evaluation recommended",
  "confidence": 0.92,
  "image_url": "/uploads/507f1f77bcf86cd799439011_image.jpg"
}
```

#### Retrieve Vision Analysis
**Request:**
```bash
curl -X GET http://localhost:8000/vision/get/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "incident_id": "507f1f77bcf86cd799439011",
  "image_url": "/uploads/507f1f77bcf86cd799439011_image.jpg",
  "vision_analysis": {
    "severity": "High",
    "analysis": "Significant bruising and laceration...",
    "recommendation": "Immediate neurosurgical evaluation...",
    "confidence": 0.92
  }
}
```

---

### Step 8: Send Hospital Alert

#### Hospital Alert
**Request:**
```bash
curl -X POST http://localhost:8000/hospital/alert \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "507f1f77bcf86cd799439011",
    "patient_name": "John Doe",
    "location": "123 Main St, New York, NY 10001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "severity": "High",
    "hospital": "City Trauma Center",
    "eta_minutes": 8,
    "image_url": "/uploads/507f1f77bcf86cd799439011_image.jpg",
    "vision_analysis": {
      "severity": "High",
      "analysis": "Head trauma visible"
    },
    "symptoms": "chest pain, shortness of breath"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Alert sent to City Trauma Center"
}
```

---

## 🔌 WebSocket/Socket.IO Testing

### Using Python Client

```python
import socketio
import asyncio

sio = socketio.AsyncClient()

@sio.event
async def connect():
    print('Connection established')
    # Subscribe to incident
    await sio.emit('incident_subscribe', {
        'incident_id': '507f1f77bcf86cd799439011'
    })

@sio.on('CONNECTION_RESPONSE')
async def on_connect_response(data):
    print(f'Server response: {data}')

@sio.on('NEW_INCIDENT')
async def on_new_incident(data):
    print(f'New incident: {data}')

@sio.on('INCIDENT_UPDATED')
async def on_incident_updated(data):
    print(f'Incident updated: {data}')

@sio.on('AMBULANCE_LOCATION')
async def on_ambulance_location(data):
    print(f'Ambulance location: {data}')

@sio.on('VISION_RESULT')
async def on_vision_result(data):
    print(f'Vision analysis complete: {data}')

async def main():
    await sio.connect('http://localhost:8000')
    await sio.wait()

asyncio.run(main())
```

### Using JavaScript Client

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
    <div id="events"></div>
    
    <script>
        const socket = io('http://localhost:8000', {
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log('Connected');
            // Subscribe to incident
            socket.emit('incident_subscribe', {
                incident_id: '507f1f77bcf86cd799439011'
            });
        });

        socket.on('CONNECTION_RESPONSE', (data) => {
            console.log('Server:', data);
            addEvent(`Connected: ${data.data}`);
        });

        socket.on('NEW_INCIDENT', (data) => {
            console.log('New incident:', data);
            addEvent(`New Incident: ${data.patient_name}`);
        });

        socket.on('AMBULANCE_LOCATION', (data) => {
            console.log('Ambulance:', data);
            addEvent(`Ambulance at ${data.latitude}, ${data.longitude}`);
        });

        socket.on('VISION_RESULT', (data) => {
            console.log('Vision:', data);
            addEvent(`Vision: ${data.analysis}`);
        });

        function addEvent(message) {
            const div = document.createElement('div');
            div.textContent = new Date().toISOString() + ' - ' + message;
            document.getElementById('events').appendChild(div);
        }
    </script>
</body>
</html>
```

---

## 🧪 End-to-End Test Scenario

### Complete Emergency Response Workflow

```bash
#!/bin/bash

# 1. Initialize hospitals
echo "1. Seeding hospitals..."
curl -X POST http://localhost:8000/hospital/seed

# 2. Create emergency dispatch
echo -e "\n2. Creating emergency dispatch..."
RESPONSE=$(curl -s -X POST http://localhost:8000/dispatch/ \
  -H "Content-Type: application/json" \
  -d '{
    "caller_name": "Jane Smith",
    "phone": "+1-555-0200",
    "location": "456 Oak Avenue, NYC",
    "latitude": 40.7200,
    "longitude": -74.0100
  }')

INCIDENT_ID=$(echo $RESPONSE | grep -o '"incident_id":"[^"]*' | cut -d'"' -f4)
echo "Incident ID: $INCIDENT_ID"

# 3. Perform triage
echo -e "\n3. Performing triage assessment..."
curl -s -X POST http://localhost:8000/triage/ \
  -H "Content-Type: application/json" \
  -d "{
    \"incident_id\": \"$INCIDENT_ID\",
    \"conversation\": \"Patient fell down stairs. Severe pain in right leg. Cannot stand. Possible fracture. Conscious and alert.\"
  }"

# 4. Get nearest hospital
echo -e "\n\n4. Finding nearest hospital..."
curl -s -X GET "http://localhost:8000/hospital/nearest?latitude=40.7200&longitude=-74.0100"

# 5. Calculate ETA
echo -e "\n\n5. Calculating ETA..."
curl -s -X POST http://localhost:8000/hospital/eta \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "40.7200,-74.0100",
    "destination": "40.7128,-74.0060"
  }'

# 6. Get incident details
echo -e "\n\n6. Getting incident details..."
curl -s -X GET "http://localhost:8000/dispatch/$INCIDENT_ID"

# 7. Get all incidents
echo -e "\n\n7. Getting all incidents..."
curl -s -X GET http://localhost:8000/dispatch/
```

---

## 📊 Testing Different Scenarios

### Scenario 1: Critical Head Trauma

**Triage Input:**
```json
{
  "incident_id": "...",
  "conversation": "Unconscious patient after motor vehicle accident. Severe head trauma with bleeding. Vital signs: BP 90/60, HR 120, RR 28. GCS score 8."
}
```

**Expected Result:**
- Severity: **Critical**
- Recommended Hospital: **Trauma Center**

### Scenario 2: Cardiac Event

**Triage Input:**
```json
{
  "incident_id": "...",
  "conversation": "65-year-old male with acute chest pain, diaphoresis, nausea. Started 15 minutes ago during exertion. Radiates to left arm and jaw. History of MI 5 years ago."
}
```

**Expected Result:**
- Severity: **High**
- Recommended Hospital: **Cardiac Center**

### Scenario 3: Minor Injury

**Triage Input:**
```json
{
  "incident_id": "...",
  "conversation": "Minor laceration on hand from cut glass. Bleeding controlled. No other injuries. Alert and oriented."
}
```

**Expected Result:**
- Severity: **Low**
- Recommended Hospital: **General Hospital**

---

## 🔍 Debugging Tips

### View Application Logs

```bash
# The application logs to console by default
# Check for:
# - Database connection status
# - API request/response logs
# - Socket.IO connection events
# - Gemini API calls
# - Errors and exceptions
```

### Test MongoDB Connection

```bash
# Connect to MongoDB directly
mongosh mongodb://localhost:27017

# Check emergency_response database
use emergency_response

# View incidents collection
db.incidents.find().pretty()

# View hospitals collection
db.hospitals.find().pretty()

# Count documents
db.incidents.countDocuments()
```

### Test API with Postman

1. Download [Postman](https://www.postman.com/)
2. Import the API endpoints
3. Create collection with all test cases
4. Set variables for `incident_id`
5. Run collection in sequence

### Monitor Network Traffic

```bash
# Use tcpdump or Wireshark to monitor HTTP/WebSocket traffic
tcpdump -i lo -n 'tcp port 8000'
```

---

## ✅ Verification Checklist

After running all tests, verify:

- [ ] All endpoints return 200/201 status codes
- [ ] Incident IDs are created and retrievable
- [ ] Triage returns valid severity levels
- [ ] ETA calculations are reasonable
- [ ] Hospital finding returns nearest facility
- [ ] Image upload accepts files
- [ ] Vision analysis returns results
- [ ] WebSocket connections work
- [ ] Real-time events are received
- [ ] Database records are created/updated
- [ ] No errors in application logs

---

## 🎯 Performance Testing

### Load Testing with Apache Bench

```bash
# Test dispatch endpoint
ab -n 100 -c 10 -p dispatch.json -T application/json \
  http://localhost:8000/dispatch/

# Test ETA endpoint
ab -n 100 -c 10 -p eta.json -T application/json \
  http://localhost:8000/hospital/eta
```

### Load Testing with Locust

```bash
pip install locust

# Create locustfile.py and run:
locust -f locustfile.py --host=http://localhost:8000
```

---

## 📈 Monitoring

### Application Metrics to Track

1. **Response Times**: Should be < 500ms for most endpoints
2. **Error Rate**: Should be < 1%
3. **Concurrent Connections**: WebSocket should handle 100+ clients
4. **Database Queries**: Should complete in < 100ms
5. **API Rate Limiting**: Implement if needed

---

**Need more help?** Check `README.md` and `QUICKSTART.md` for additional information.
