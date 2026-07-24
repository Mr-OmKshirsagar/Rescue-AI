"""Test script to verify all components of the Emergency Response Platform."""
import sys
import asyncio
import json
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))


def test_imports():
    """Test all imports work correctly."""
    print("=" * 60)
    print("Testing Imports")
    print("=" * 60)
    
    try:
        print("✓ Importing config...", end=" ")
        from app.config import settings
        print("OK")
        
        print("✓ Importing database...", end=" ")
        from app.database.mongodb import connect_to_mongo, disconnect_from_mongo
        print("OK")
        
        print("✓ Importing models...", end=" ")
        from app.models.incident import Incident, IncidentCreate
        from app.models.hospital import Hospital, HospitalCreate
        print("OK")
        
        print("✓ Importing schemas...", end=" ")
        from app.schemas.incident_schema import DispatchRequest, TriageRequest
        print("OK")
        
        print("✓ Importing services...", end=" ")
        from app.services.gemini_service import GeminiService
        from app.services.vision_service import VisionService
        from app.services.maps_service import MapsService
        from app.services.twilio_service import TwilioService
        from app.services.ambulance_service import ambulance_service
        from app.services.socket_service import SocketIOService
        print("OK")
        
        print("✓ Importing routes...", end=" ")
        from app.routes import dispatch, triage, vision, hospital
        print("OK")
        
        print("✓ Importing main app...", end=" ")
        from app.main import app
        print("OK")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def test_config():
    """Test configuration settings."""
    print("\n" + "=" * 60)
    print("Testing Configuration")
    print("=" * 60)
    
    try:
        from app.config import settings
        
        print(f"✓ App Name: {settings.APP_NAME}")
        print(f"✓ App Version: {settings.APP_VERSION}")
        print(f"✓ MongoDB URI: {settings.MONGODB_URI}")
        print(f"✓ Debug Mode: {settings.DEBUG}")
        print(f"✓ Upload Dir: {settings.UPLOAD_DIR}")
        print(f"✓ Ambulance Speed: {settings.AMBULANCE_SPEED} km/h")
        print(f"✓ Ambulance Update Interval: {settings.AMBULANCE_UPDATE_INTERVAL}s")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def test_schemas():
    """Test Pydantic schema validation."""
    print("\n" + "=" * 60)
    print("Testing Pydantic Schemas")
    print("=" * 60)
    
    try:
        from app.schemas.incident_schema import (
            DispatchRequest, TriageRequest, CameraLinkRequest,
            VisionAnalysisRequest, ETARequest
        )
        
        # Test DispatchRequest
        print("✓ Testing DispatchRequest validation...", end=" ")
        dispatch_data = {
            "caller_name": "John Doe",
            "phone": "+1-555-0100",
            "location": "123 Main St, NYC",
            "latitude": 40.7128,
            "longitude": -74.0060
        }
        dispatch_req = DispatchRequest(**dispatch_data)
        print("OK")
        
        # Test TriageRequest
        print("✓ Testing TriageRequest validation...", end=" ")
        triage_data = {
            "incident_id": "507f1f77bcf86cd799439011",
            "conversation": "Patient reports chest pain"
        }
        triage_req = TriageRequest(**triage_data)
        print("OK")
        
        # Test ETARequest
        print("✓ Testing ETARequest validation...", end=" ")
        eta_data = {
            "origin": "40.7128,-74.0060",
            "destination": "40.7580,-73.9855"
        }
        eta_req = ETARequest(**eta_data)
        print("OK")
        
        # Test invalid data
        print("✓ Testing schema validation (invalid latitude)...", end=" ")
        try:
            invalid = DispatchRequest(
                caller_name="John",
                phone="+1-555-0100",
                location="123 Main St",
                latitude=95.0,  # Invalid
                longitude=-74.0060
            )
            print("FAILED: Should have rejected invalid latitude")
            return False
        except Exception:
            print("OK (correctly rejected)")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_models():
    """Test database models."""
    print("\n" + "=" * 60)
    print("Testing Database Models")
    print("=" * 60)
    
    try:
        from app.models.incident import Incident, IncidentCreate
        from app.models.hospital import Hospital, HospitalCreate
        from datetime import datetime
        
        # Test Incident model
        print("✓ Testing Incident model...", end=" ")
        incident_data = {
            "caller_name": "Jane Doe",
            "phone": "+1-555-0200",
            "location": "456 Oak Ave",
            "latitude": 40.7200,
            "longitude": -74.0100,
            "severity": "High",
            "hospital": "Trauma Center"
        }
        incident = Incident(**incident_data)
        print("OK")
        
        # Test Hospital model
        print("✓ Testing Hospital model...", end=" ")
        hospital_data = {
            "name": "City Hospital",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "type": "Trauma Center",
            "beds_available": 15,
            "phone": "+1-555-1234"
        }
        hospital = Hospital(**hospital_data)
        print("OK")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_services_structure():
    """Test that all services are properly structured."""
    print("\n" + "=" * 60)
    print("Testing Services Structure")
    print("=" * 60)
    
    try:
        from app.services.gemini_service import GeminiService
        from app.services.vision_service import VisionService
        from app.services.maps_service import MapsService
        from app.services.twilio_service import TwilioService
        from app.services.ambulance_service import ambulance_service, AmbulanceService
        from app.services.socket_service import SocketIOService
        
        # Check GeminiService methods
        print("✓ GeminiService methods:", end=" ")
        assert hasattr(GeminiService, 'analyze_triage'), "Missing analyze_triage"
        assert hasattr(GeminiService, 'extract_symptoms'), "Missing extract_symptoms"
        print("OK")
        
        # Check VisionService methods
        print("✓ VisionService methods:", end=" ")
        assert hasattr(VisionService, 'analyze_image'), "Missing analyze_image"
        assert hasattr(VisionService, 'analyze_image_from_bytes'), "Missing analyze_image_from_bytes"
        print("OK")
        
        # Check MapsService methods
        print("✓ MapsService methods:", end=" ")
        assert hasattr(MapsService, 'get_eta'), "Missing get_eta"
        assert hasattr(MapsService, 'find_nearest_hospital'), "Missing find_nearest_hospital"
        print("OK")
        
        # Check TwilioService methods
        print("✓ TwilioService methods:", end=" ")
        assert hasattr(TwilioService, 'send_camera_link'), "Missing send_camera_link"
        assert hasattr(TwilioService, 'send_alert'), "Missing send_alert"
        print("OK")
        
        # Check AmbulanceService
        print("✓ AmbulanceService instance:", end=" ")
        assert ambulance_service is not None, "ambulance_service is None"
        assert hasattr(ambulance_service, 'start_ambulance_simulation'), "Missing start_ambulance_simulation"
        print("OK")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_fastapi_app():
    """Test FastAPI application structure."""
    print("\n" + "=" * 60)
    print("Testing FastAPI Application")
    print("=" * 60)
    
    try:
        from app.main import app
        from fastapi.testclient import TestClient
        
        print("✓ FastAPI app created:", end=" ")
        assert app is not None, "App is None"
        print("OK")
        
        print("✓ Testing routes included:", end=" ")
        routes = [route.path for route in app.routes]
        assert "/dispatch/" in routes, "dispatch route missing"
        assert "/triage/" in routes, "triage route missing"
        assert "/vision/analyze" in routes, "vision route missing"
        assert "/hospital/eta" in routes, "hospital route missing"
        print("OK")
        
        print("✓ Creating test client...", end=" ")
        client = TestClient(app)
        print("OK")
        
        print("✓ Testing health endpoint...", end=" ")
        response = client.get("/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        assert "status" in response.json(), "Missing status in response"
        print("OK")
        
        print("✓ Testing root endpoint...", end=" ")
        response = client.get("/")
        assert response.status_code == 200, f"Root endpoint failed: {response.status_code}"
        assert "message" in response.json(), "Missing message in response"
        print("OK")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_directory_structure():
    """Test that all required directories and files exist."""
    print("\n" + "=" * 60)
    print("Testing Directory Structure")
    print("=" * 60)
    
    try:
        import os
        
        required_files = [
            "app/__init__.py",
            "app/main.py",
            "app/config.py",
            "app/database/__init__.py",
            "app/database/mongodb.py",
            "app/models/__init__.py",
            "app/models/incident.py",
            "app/models/hospital.py",
            "app/schemas/__init__.py",
            "app/schemas/incident_schema.py",
            "app/services/__init__.py",
            "app/services/gemini_service.py",
            "app/services/vision_service.py",
            "app/services/maps_service.py",
            "app/services/twilio_service.py",
            "app/services/ambulance_service.py",
            "app/services/socket_service.py",
            "app/routes/__init__.py",
            "app/routes/dispatch.py",
            "app/routes/triage.py",
            "app/routes/vision.py",
            "app/routes/hospital.py",
            "app/routes/websocket.py",
            "requirements.txt",
            ".env.example",
            "README.md"
        ]
        
        required_dirs = [
            "app",
            "app/database",
            "app/models",
            "app/schemas",
            "app/services",
            "app/routes",
            "uploads"
        ]
        
        # Check directories
        for dir_path in required_dirs:
            print(f"✓ Checking directory: {dir_path}...", end=" ")
            assert os.path.isdir(dir_path), f"Directory not found: {dir_path}"
            print("OK")
        
        # Check files
        for file_path in required_files:
            print(f"✓ Checking file: {file_path}...", end=" ")
            assert os.path.isfile(file_path), f"File not found: {file_path}"
            print("OK")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_distance_calculation():
    """Test ambulance service distance calculation."""
    print("\n" + "=" * 60)
    print("Testing Ambulance Service")
    print("=" * 60)
    
    try:
        from app.services.ambulance_service import AmbulanceService
        
        service = AmbulanceService()
        
        # Test distance calculation
        print("✓ Testing distance calculation...", end=" ")
        # NYC to Times Square (approximately 3 km)
        distance = service._calculate_distance(40.7128, -74.0060, 40.7580, -73.9855)
        assert 2.5 < distance < 3.5, f"Distance calculation incorrect: {distance}"
        print(f"OK ({distance:.2f} km)")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " EMERGENCY RESPONSE PLATFORM - COMPONENT TEST SUITE ".center(58) + "║")
    print("╚" + "=" * 58 + "╝")
    
    tests = [
        ("Directory Structure", test_directory_structure),
        ("Imports", test_imports),
        ("Configuration", test_config),
        ("Schemas", test_schemas),
        ("Models", test_models),
        ("Services Structure", test_services_structure),
        ("Ambulance Service", test_distance_calculation),
        ("FastAPI Application", test_fastapi_app),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n✗ {test_name} FAILED with exception: {e}")
            import traceback
            traceback.print_exc()
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "-" * 60)
    print(f"Total: {passed}/{total} tests passed")
    print("-" * 60)
    
    if passed == total:
        print("\n✓ ALL TESTS PASSED - System is ready for deployment!")
        return 0
    else:
        print(f"\n✗ {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
