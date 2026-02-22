"""
TokHealth API Backend Tests
Tests for: Health check, Biometrics, Nutrition, Loop Status, Health Coach
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tokhealth-mobile.preview.emergentagent.com').rstrip('/')

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data.get("status") == "healthy"
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        assert data.get("app") == "TokHealth"


class TestBiometricsAPI:
    """Biometrics module tests - vitals tracking"""
    
    def test_get_today_biometrics(self):
        """Test fetching today's biometrics"""
        response = requests.get(f"{BASE_URL}/api/biometrics/today")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        # Validate structure
        bio_data = data["data"]
        assert "date" in bio_data
        assert "heart_rate_bpm" in bio_data
        assert "blood_pressure_systolic" in bio_data
        assert "steps" in bio_data
    
    def test_log_biometrics(self):
        """Test logging biometric readings"""
        payload = {
            "heart_rate_bpm": 72,
            "blood_pressure_systolic": 118,
            "blood_pressure_diastolic": 78,
            "blood_oxygen_spo2": 98,
            "steps": 3000
        }
        response = requests.post(
            f"{BASE_URL}/api/biometrics/log",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        # Verify logged data
        logged_data = data.get("data", {})
        assert logged_data.get("heart_rate_bpm") == 72
        assert logged_data.get("blood_pressure_systolic") == 118
    
    def test_biometric_zones(self):
        """Test biometric zones calculation"""
        response = requests.get(f"{BASE_URL}/api/biometrics/zones")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        zones_data = data.get("data", {})
        assert "zones" in zones_data
        assert "overall" in zones_data
        # Overall should be green, yellow, or red
        assert zones_data["overall"] in ["green", "yellow", "red"]
    
    def test_biometric_history(self):
        """Test fetching biometric history"""
        response = requests.get(f"{BASE_URL}/api/biometrics/history?days=7")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


class TestNutritionAPI:
    """Nutrition tracking module tests"""
    
    def test_get_today_nutrition(self):
        """Test fetching today's nutrition data"""
        response = requests.get(f"{BASE_URL}/api/nutrition/today")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        nutrition_data = data["data"]
        assert "date" in nutrition_data
        assert "meals" in nutrition_data
        assert "totals" in nutrition_data
    
    def test_log_meal(self):
        """Test logging a meal"""
        payload = {
            "meal_type": "lunch",
            "food_items": [
                {
                    "name": "TEST_Grilled Chicken",
                    "quantity": 1.0,
                    "unit": "portion",
                    "calories": 250.0,
                    "protein_g": 30.0,
                    "carbs_g": 0.0,
                    "fat_g": 12.0,
                    "fiber_g": 0.0
                }
            ],
            "meal_time": datetime.now().isoformat(),
            "notes": "Test meal from automated testing"
        }
        response = requests.post(
            f"{BASE_URL}/api/nutrition/log",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


class TestLoopAPI:
    """The Loop - health status visualization tests"""
    
    def test_get_loop_status(self):
        """Test fetching Loop status with Green/Yellow/Red zones"""
        response = requests.get(f"{BASE_URL}/api/loop/status")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        loop_data = data.get("data", {})
        # Validate Loop data structure
        assert "date" in loop_data
        assert "status_summary" in loop_data
        status = loop_data.get("status_summary", {})
        assert "overall_zone" in status
        # Zone should be green, yellow, or red
        assert status["overall_zone"] in ["green", "yellow", "red"]


class TestHealthCoachAPI:
    """AI Health Coach with GPT-5.2 integration tests"""
    
    def test_get_coach_status(self):
        """Test fetching coach status"""
        response = requests.get(f"{BASE_URL}/api/health-coach/status")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        coach_data = data.get("data", {})
        assert "overall_zone" in coach_data
        assert "message" in coach_data
    
    def test_chat_with_coach(self):
        """Test AI Health Coach chat with GPT-5.2"""
        payload = {
            "message": "What should I eat for more energy?",
            "session_id": f"test_session_{datetime.now().timestamp()}"
        }
        response = requests.post(
            f"{BASE_URL}/api/health-coach/chat",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        chat_data = data.get("data", {})
        assert "response" in chat_data
        # Verify AI response is not empty
        assert len(chat_data.get("response", "")) > 10
        assert "session_id" in chat_data
    
    def test_get_coach_messages(self):
        """Test fetching coaching message history"""
        response = requests.get(f"{BASE_URL}/api/health-coach/messages?days=7")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


class TestEmergencyContactsAPI:
    """Emergency contacts module tests"""
    
    def test_get_emergency_contacts(self):
        """Test fetching emergency contacts"""
        response = requests.get(f"{BASE_URL}/api/emergency-contacts/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


class TestPrescriptionsAPI:
    """Prescription tracker module tests"""
    
    def test_get_prescriptions(self):
        """Test fetching prescriptions"""
        response = requests.get(f"{BASE_URL}/api/prescriptions/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


class TestHydrationAPI:
    """Hydration tracking module tests"""
    
    def test_get_today_hydration(self):
        """Test fetching today's hydration"""
        response = requests.get(f"{BASE_URL}/api/hydration/today")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


class TestWisdomVaultAPI:
    """Wisdom Vault (journal/mental wellness) module tests"""
    
    def test_get_wisdom_entries(self):
        """Test fetching wisdom vault entries"""
        response = requests.get(f"{BASE_URL}/api/wisdom-vault/entries")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


# Pytest configuration
@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
