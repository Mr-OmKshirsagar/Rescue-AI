# Test API endpoints

# Test 1: Health Check
Write-Host "Test 1: Health Check"
$response = Invoke-WebRequest -Uri http://127.0.0.1:8000/health -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)`n"

# Test 2: Dispatch
Write-Host "Test 2: Create Dispatch"
$json = '{
  "caller_name": "John Doe",
  "phone": "+1-555-0100",
  "location": "123 Main St, New York, NY",
  "latitude": 40.7128,
  "longitude": -74.0060
}'

$response = Invoke-WebRequest -Uri http://127.0.0.1:8000/dispatch/ `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $json `
  -UseBasicParsing

Write-Host "Status: $($response.StatusCode)"
$incident = $response.Content | ConvertFrom-Json
Write-Host "Response: $($response.Content)`n"
$incidentId = $incident.incident_id

# Test 3: Get Incident
Write-Host "Test 3: Get Incident Details"
$response = Invoke-WebRequest -Uri http://127.0.0.1:8000/dispatch/$incidentId -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)`n"

# Test 4: List All Incidents
Write-Host "Test 4: List All Incidents"
$response = Invoke-WebRequest -Uri http://127.0.0.1:8000/dispatch/ -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
$content = $response.Content | ConvertFrom-Json
Write-Host "Found $($content.Count) incidents`n"

# Test 5: Seed Hospitals
Write-Host "Test 5: Seed Hospitals"
$response = Invoke-WebRequest -Uri http://127.0.0.1:8000/hospital/seed `
  -Method POST `
  -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)`n"

Write-Host "✅ Basic API tests completed!"
