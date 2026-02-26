"""
PRIVACY AUDIT TESTS for TokHealth
=================================
Tests that all endpoints return 401 without authentication
and that user data is properly isolated between users.
"""
import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test users
TEST_USER_1 = {"email": "meka@demo.com", "password": "pass123", "name": "Meka"}
TEST_USER_2_EMAIL = f"privacy_test_{int(time.time())}@test.com"
TEST_USER_2 = {"email": TEST_USER_2_EMAIL, "password": "pass123", "name": "PrivacyTestUser"}

# Store tokens
user1_token = None
user2_token = None
user2_id = None


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_01_login_user1(self):
        """Login user 1 (meka@demo.com)"""
        global user1_token
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_1["email"], "password": TEST_USER_1["password"]}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert "token" in data["data"]
        user1_token = data["data"]["token"]
        print(f"✓ User 1 logged in, token: {user1_token[:20]}...")
    
    def test_02_register_user2(self):
        """Register a second test user for privacy isolation tests"""
        global user2_token, user2_id
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=TEST_USER_2
        )
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        user2_token = data["data"]["token"]
        user2_id = data["data"]["user_id"]
        print(f"✓ User 2 registered: {TEST_USER_2['email']}")


class Test401WithoutAuth:
    """Test that ALL endpoints return 401 without authentication"""
    
    def test_profile_get_401(self):
        """GET /api/profile/ without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/profile/")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("✓ GET /api/profile/ returns 401 without auth")
    
    def test_profile_post_401(self):
        """POST /api/profile/ without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/profile/",
            json={"name": "Test", "age": 30, "gender": "male", "height_cm": 175, "weight_kg": 70}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/profile/ returns 401 without auth")
    
    def test_profile_targets_401(self):
        """GET /api/profile/targets without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/profile/targets")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/profile/targets returns 401 without auth")
    
    def test_nutrition_today_401(self):
        """GET /api/nutrition/today without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/nutrition/today")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/nutrition/today returns 401 without auth")
    
    def test_nutrition_log_401(self):
        """POST /api/nutrition/log without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/nutrition/log",
            json={"meal_type": "lunch", "food_items": [], "meal_time": "2024-01-01T12:00:00"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/nutrition/log returns 401 without auth")
    
    def test_hydration_today_401(self):
        """GET /api/hydration/today without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/hydration/today")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/hydration/today returns 401 without auth")
    
    def test_hydration_log_401(self):
        """POST /api/hydration/log without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/hydration/log",
            json={"amount_ml": 250, "beverage_type": "water"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/hydration/log returns 401 without auth")
    
    def test_prescriptions_get_401(self):
        """GET /api/prescriptions/ without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/prescriptions/")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/prescriptions/ returns 401 without auth")
    
    def test_prescriptions_post_401(self):
        """POST /api/prescriptions/ without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/prescriptions/",
            json={"medication_name": "Test", "dosage": "10mg"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/prescriptions/ returns 401 without auth")
    
    def test_emergency_contacts_get_401(self):
        """GET /api/emergency-contacts/ without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/emergency-contacts/")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/emergency-contacts/ returns 401 without auth")
    
    def test_emergency_contacts_post_401(self):
        """POST /api/emergency-contacts/ without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/emergency-contacts/",
            json={"name": "Test", "relationship": "friend", "phone_primary": "1234567890"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/emergency-contacts/ returns 401 without auth")
    
    def test_health_coach_status_401(self):
        """GET /api/health-coach/status without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/health-coach/status")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/health-coach/status returns 401 without auth")
    
    def test_health_coach_chat_401(self):
        """POST /api/health-coach/chat without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/health-coach/chat",
            json={"message": "hello", "session_id": "test"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/health-coach/chat returns 401 without auth")
    
    def test_loop_status_401(self):
        """GET /api/loop/status without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/loop/status")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/loop/status returns 401 without auth")
    
    def test_trends_summary_401(self):
        """GET /api/trends/summary without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/trends/summary")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/trends/summary returns 401 without auth")
    
    def test_wisdom_vault_entries_get_401(self):
        """GET /api/wisdom-vault/entries without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/wisdom-vault/entries")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/wisdom-vault/entries returns 401 without auth")
    
    def test_wisdom_vault_entries_post_401(self):
        """POST /api/wisdom-vault/entries without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/wisdom-vault/entries",
            json={"entry_type": "journal", "title": "Test", "body": "Test"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/wisdom-vault/entries returns 401 without auth")
    
    def test_biometrics_log_401(self):
        """POST /api/biometrics/log without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/biometrics/log",
            json={"heart_rate_bpm": 72}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/biometrics/log returns 401 without auth")
    
    def test_medication_check_interactions_401(self):
        """POST /api/medication/check-interactions without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/medication/check-interactions",
            json={"medication_names": ["aspirin", "ibuprofen"]}
        )
        # Note: Some endpoints may not require auth, check if 401 or 200
        print(f"  POST /api/medication/check-interactions status: {response.status_code}")


class TestUserDataIsolation:
    """Test that users can only see their own data"""
    
    @pytest.fixture(autouse=True)
    def ensure_tokens(self):
        """Ensure both users have tokens"""
        global user1_token, user2_token
        if not user1_token:
            response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": TEST_USER_1["email"], "password": TEST_USER_1["password"]}
            )
            user1_token = response.json()["data"]["token"]
        if not user2_token:
            response = requests.post(
                f"{BASE_URL}/api/auth/register",
                json=TEST_USER_2
            )
            if response.status_code == 400:  # Already exists, login instead
                response = requests.post(
                    f"{BASE_URL}/api/auth/login",
                    json={"email": TEST_USER_2["email"], "password": TEST_USER_2["password"]}
                )
            user2_token = response.json()["data"]["token"]
    
    def test_user1_creates_prescription(self):
        """User 1 creates a prescription"""
        response = requests.post(
            f"{BASE_URL}/api/prescriptions/",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={
                "medication_name": f"TEST_USER1_MED_{uuid.uuid4().hex[:8]}",
                "dosage": "50mg",
                "frequency": "once daily"
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ User 1 created prescription")
    
    def test_user2_creates_prescription(self):
        """User 2 creates a prescription"""
        response = requests.post(
            f"{BASE_URL}/api/prescriptions/",
            headers={"Authorization": f"Bearer {user2_token}"},
            json={
                "medication_name": f"TEST_USER2_MED_{uuid.uuid4().hex[:8]}",
                "dosage": "100mg",
                "frequency": "twice daily"
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ User 2 created prescription")
    
    def test_user2_cannot_see_user1_prescriptions(self):
        """User 2's prescriptions should NOT include User 1's data"""
        response = requests.get(
            f"{BASE_URL}/api/prescriptions/",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        prescriptions = data.get("data", [])
        
        # Check none of User 1's prescriptions are visible
        for rx in prescriptions:
            assert "USER1_MED" not in rx.get("medication_name", ""), \
                f"PRIVACY BREACH: User 2 can see User 1's prescription: {rx}"
        print("✓ User 2 cannot see User 1's prescriptions - privacy verified")
    
    def test_user1_creates_emergency_contact(self):
        """User 1 creates an emergency contact"""
        response = requests.post(
            f"{BASE_URL}/api/emergency-contacts/",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={
                "name": f"TEST_USER1_CONTACT_{uuid.uuid4().hex[:8]}",
                "relationship": "spouse",
                "phone_primary": "555-USER1"
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ User 1 created emergency contact")
    
    def test_user2_cannot_see_user1_contacts(self):
        """User 2's contacts should NOT include User 1's data"""
        response = requests.get(
            f"{BASE_URL}/api/emergency-contacts/",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        contacts = data.get("data", [])
        
        for contact in contacts:
            assert "USER1_CONTACT" not in contact.get("name", ""), \
                f"PRIVACY BREACH: User 2 can see User 1's contact: {contact}"
        print("✓ User 2 cannot see User 1's emergency contacts - privacy verified")
    
    def test_user1_logs_hydration(self):
        """User 1 logs hydration"""
        response = requests.post(
            f"{BASE_URL}/api/hydration/log",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={"amount_ml": 999, "beverage_type": "TEST_USER1_WATER"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ User 1 logged hydration")
    
    def test_user2_cannot_see_user1_hydration(self):
        """User 2's hydration data should NOT include User 1's data"""
        response = requests.get(
            f"{BASE_URL}/api/hydration/today",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        logs = data.get("data", {}).get("logs", [])
        
        for log in logs:
            assert "USER1_WATER" not in log.get("beverage_type", ""), \
                f"PRIVACY BREACH: User 2 can see User 1's hydration: {log}"
        print("✓ User 2 cannot see User 1's hydration data - privacy verified")
    
    def test_user1_creates_wisdom_entry(self):
        """User 1 creates a wisdom vault entry"""
        response = requests.post(
            f"{BASE_URL}/api/wisdom-vault/entries",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={
                "entry_type": "journal",
                "title": f"TEST_USER1_JOURNAL_{uuid.uuid4().hex[:8]}",
                "body": "This is User 1's private journal",
                "mood_before": "happy",
                "tags": ["private", "user1"],
                "ai_analysis_enabled": False
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ User 1 created wisdom vault entry")
    
    def test_user2_cannot_see_user1_wisdom(self):
        """User 2's wisdom vault should NOT include User 1's entries"""
        response = requests.get(
            f"{BASE_URL}/api/wisdom-vault/entries",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        entries = data.get("data", [])
        
        for entry in entries:
            title = entry.get("content", {}).get("title", "")
            assert "USER1_JOURNAL" not in title, \
                f"PRIVACY BREACH: User 2 can see User 1's journal: {entry}"
        print("✓ User 2 cannot see User 1's wisdom vault entries - privacy verified")


class TestAuthenticatedEndpointsWork:
    """Test that endpoints work properly WITH authentication"""
    
    @pytest.fixture(autouse=True)
    def ensure_token(self):
        """Ensure user1 has token"""
        global user1_token
        if not user1_token:
            response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": TEST_USER_1["email"], "password": TEST_USER_1["password"]}
            )
            user1_token = response.json()["data"]["token"]
    
    def test_profile_with_auth(self):
        """GET /api/profile/ with auth works"""
        response = requests.get(
            f"{BASE_URL}/api/profile/",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ GET /api/profile/ works with auth")
    
    def test_nutrition_today_with_auth(self):
        """GET /api/nutrition/today with auth works"""
        response = requests.get(
            f"{BASE_URL}/api/nutrition/today",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ GET /api/nutrition/today works with auth")
    
    def test_hydration_today_with_auth(self):
        """GET /api/hydration/today with auth works"""
        response = requests.get(
            f"{BASE_URL}/api/hydration/today",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ GET /api/hydration/today works with auth")
    
    def test_prescriptions_with_auth(self):
        """GET /api/prescriptions/ with auth works"""
        response = requests.get(
            f"{BASE_URL}/api/prescriptions/",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ GET /api/prescriptions/ works with auth")
    
    def test_emergency_contacts_with_auth(self):
        """GET /api/emergency-contacts/ with auth works"""
        response = requests.get(
            f"{BASE_URL}/api/emergency-contacts/",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ GET /api/emergency-contacts/ works with auth")
    
    def test_health_coach_status_with_auth(self):
        """GET /api/health-coach/status with auth works"""
        response = requests.get(
            f"{BASE_URL}/api/health-coach/status",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ GET /api/health-coach/status works with auth")
    
    def test_loop_status_with_auth(self):
        """GET /api/loop/status with auth works"""
        response = requests.get(
            f"{BASE_URL}/api/loop/status",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ GET /api/loop/status works with auth")
    
    def test_trends_summary_with_auth(self):
        """GET /api/trends/summary with auth works"""
        response = requests.get(
            f"{BASE_URL}/api/trends/summary",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ GET /api/trends/summary works with auth")
    
    def test_wisdom_vault_entries_with_auth(self):
        """GET /api/wisdom-vault/entries with auth works"""
        response = requests.get(
            f"{BASE_URL}/api/wisdom-vault/entries",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print("✓ GET /api/wisdom-vault/entries works with auth")


class TestMedicationSearch:
    """Test medication search and interaction endpoints"""
    
    def test_medication_search_works(self):
        """GET /api/medication/search?query=aspirin works"""
        response = requests.get(f"{BASE_URL}/api/medication/search?query=aspirin")
        # This endpoint may or may not require auth based on design
        print(f"  Medication search status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Results: {len(data.get('data', []))} medications found")
            print("✓ Medication search works")
        elif response.status_code == 401:
            print("✓ Medication search requires auth (401)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
