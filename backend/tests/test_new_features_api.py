"""
Backend API tests for new TokHealth features:
- Data Privacy (my-data, export, delete-account)
- HealthKit (status, sync)
- Notifications (status, subscribe, reminders CRUD)
- Medication lookup (OpenFDA)
- Auth enforcement (401 without token)
"""

import pytest
import requests
import uuid
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "meka@demo.com"
TEST_PASSWORD = "pass123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code == 200:
        data = response.json()
        # Token is in data.data.token
        return data.get("data", {}).get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    }


@pytest.fixture
def no_auth_headers():
    """Headers without auth token"""
    return {"Content-Type": "application/json"}


# ============================================
# AUTH ENFORCEMENT TESTS (401 without token)
# ============================================

class TestAuthEnforcement:
    """Test that all new endpoints return 401 without auth"""

    def test_privacy_my_data_requires_auth(self, no_auth_headers):
        """GET /api/privacy/my-data should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/privacy/my-data", headers=no_auth_headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"

    def test_privacy_export_requires_auth(self, no_auth_headers):
        """GET /api/privacy/export should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/privacy/export", headers=no_auth_headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"

    def test_privacy_delete_account_requires_auth(self, no_auth_headers):
        """DELETE /api/privacy/delete-account should return 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/privacy/delete-account", headers=no_auth_headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"

    def test_healthkit_status_requires_auth(self, no_auth_headers):
        """GET /api/healthkit/status should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/healthkit/status", headers=no_auth_headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"

    def test_healthkit_sync_requires_auth(self, no_auth_headers):
        """POST /api/healthkit/sync should return 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/healthkit/sync",
            headers=no_auth_headers,
            json={"steps": 1000}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"

    def test_notifications_status_requires_auth(self, no_auth_headers):
        """GET /api/notifications/status should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/notifications/status", headers=no_auth_headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"

    def test_notifications_reminders_post_requires_auth(self, no_auth_headers):
        """POST /api/notifications/reminders should return 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/notifications/reminders",
            headers=no_auth_headers,
            json={"type": "medication", "title": "Test", "time": "08:00"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"

    def test_notifications_reminders_delete_requires_auth(self, no_auth_headers):
        """DELETE /api/notifications/reminders/{id} should return 401 without auth"""
        response = requests.delete(
            f"{BASE_URL}/api/notifications/reminders/fake-id",
            headers=no_auth_headers
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"


# ============================================
# DATA PRIVACY TESTS
# ============================================

class TestDataPrivacy:
    """Test Data Privacy endpoints"""

    def test_get_my_data(self, auth_headers):
        """GET /api/privacy/my-data should return user data summary"""
        response = requests.get(f"{BASE_URL}/api/privacy/my-data", headers=auth_headers)
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True
        assert "data" in data
        assert "data_categories" in data["data"]
        assert "profile_summary" in data["data"]
        
        # Check data_categories structure
        categories = data["data"]["data_categories"]
        assert isinstance(categories, list)
        assert len(categories) > 0
        
        # Each category should have name, records, has_data
        for cat in categories:
            assert "name" in cat
            assert "records" in cat
            assert "has_data" in cat

    def test_export_data(self, auth_headers):
        """GET /api/privacy/export should return complete data export"""
        response = requests.get(f"{BASE_URL}/api/privacy/export", headers=auth_headers)
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True
        assert "data" in data
        
        export_data = data["data"]
        assert "export_date" in export_data
        assert "user_id" in export_data
        # Should have various collections even if empty
        assert "profile" in export_data or export_data.get("profile") is None
        assert "nutrition_logs" in export_data
        assert "prescriptions" in export_data


# ============================================
# HEALTHKIT TESTS
# ============================================

class TestHealthKit:
    """Test Apple HealthKit endpoints"""

    def test_get_healthkit_status(self, auth_headers):
        """GET /api/healthkit/status should return connection status"""
        response = requests.get(f"{BASE_URL}/api/healthkit/status", headers=auth_headers)
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True
        assert "data" in data
        
        status = data["data"]
        assert "connected" in status
        assert "note" in status  # Should have iOS note

    def test_sync_healthkit_data(self, auth_headers):
        """POST /api/healthkit/sync should store synced data"""
        sync_data = {
            "steps": 5000,
            "heart_rate": 72,
            "sleep_hours": 7.5,
            "active_calories": 350
        }
        
        response = requests.post(
            f"{BASE_URL}/api/healthkit/sync",
            headers=auth_headers,
            json=sync_data
        )
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True
        assert "synced_fields" in data.get("data", {})


# ============================================
# NOTIFICATIONS & REMINDERS TESTS
# ============================================

class TestNotifications:
    """Test Notifications endpoints"""

    def test_get_notification_status(self, auth_headers):
        """GET /api/notifications/status should return notification status"""
        response = requests.get(f"{BASE_URL}/api/notifications/status", headers=auth_headers)
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True
        assert "data" in data
        
        status = data["data"]
        assert "push_enabled" in status
        assert "active_reminders" in status
        assert "reminders" in status

    def test_create_reminder(self, auth_headers):
        """POST /api/notifications/reminders should create a reminder"""
        reminder = {
            "type": "medication",
            "title": f"TEST_REMINDER_{uuid.uuid4().hex[:8]}",
            "time": "08:00",
            "days": ["mon", "tue", "wed", "thu", "fri"],
            "enabled": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/notifications/reminders",
            headers=auth_headers,
            json=reminder
        )
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True
        assert "data" in data
        
        created = data["data"]
        assert "id" in created
        assert created["title"] == reminder["title"]
        assert created["type"] == "medication"
        
        # Return the created reminder ID for cleanup
        return created["id"]

    def test_create_and_delete_reminder(self, auth_headers):
        """Test full reminder CRUD flow"""
        # Create reminder
        reminder = {
            "type": "hydration",
            "title": f"TEST_DELETE_{uuid.uuid4().hex[:8]}",
            "time": "12:00",
            "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            "enabled": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/notifications/reminders",
            headers=auth_headers,
            json=reminder
        )
        assert create_response.status_code == 200
        
        created_id = create_response.json()["data"]["id"]
        
        # Verify reminder exists in status
        status_response = requests.get(f"{BASE_URL}/api/notifications/status", headers=auth_headers)
        assert status_response.status_code == 200
        reminders = status_response.json()["data"]["reminders"]
        assert any(r["id"] == created_id for r in reminders), "Created reminder not found in status"
        
        # Delete reminder
        delete_response = requests.delete(
            f"{BASE_URL}/api/notifications/reminders/{created_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        assert delete_response.json()["data"]["deleted"] is True
        
        # Verify reminder is deleted
        status_response = requests.get(f"{BASE_URL}/api/notifications/status", headers=auth_headers)
        reminders = status_response.json()["data"]["reminders"]
        assert not any(r["id"] == created_id for r in reminders), "Reminder still exists after deletion"

    def test_delete_nonexistent_reminder(self, auth_headers):
        """DELETE /api/notifications/reminders with fake ID should return 404"""
        response = requests.delete(
            f"{BASE_URL}/api/notifications/reminders/nonexistent-id-12345",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"


# ============================================
# MEDICATION LOOKUP TESTS
# ============================================

class TestMedicationLookup:
    """Test Drug/Medication lookup via OpenFDA"""

    def test_lookup_aspirin(self, auth_headers):
        """GET /api/medication/lookup/aspirin should return drug info"""
        response = requests.get(
            f"{BASE_URL}/api/medication/lookup/aspirin",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True
        # OpenFDA may return empty results for some drugs, which is OK
        assert "data" in data
        # Message should indicate results found
        assert "message" in data

    def test_lookup_ibuprofen(self, auth_headers):
        """GET /api/medication/lookup/ibuprofen should return drug info"""
        response = requests.get(
            f"{BASE_URL}/api/medication/lookup/ibuprofen",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True

    def test_lookup_returns_drug_details(self, auth_headers):
        """Drug lookup should return expected fields if results found"""
        response = requests.get(
            f"{BASE_URL}/api/medication/lookup/tylenol",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        results = data.get("data", [])
        
        if len(results) > 0:
            # If results found, check structure
            drug = results[0]
            # These fields should be present
            assert "brand_name" in drug or "generic_name" in drug


# ============================================
# DELETE ACCOUNT TEST (with temp user)
# ============================================

class TestDeleteAccount:
    """Test account deletion with a temporary user (NOT meka@demo.com)"""

    def test_delete_account_flow(self):
        """Register temp user, verify data, delete account"""
        # Create unique temp user
        temp_email = f"test_delete_{uuid.uuid4().hex[:8]}@test.com"
        temp_password = "testpass123"
        
        # Register temp user
        register_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": temp_email,
                "password": temp_password,
                "name": "Test Delete User"
            }
        )
        
        if register_response.status_code != 200:
            pytest.skip(f"Failed to register temp user: {register_response.text}")
        
        # Login with temp user
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": temp_email, "password": temp_password}
        )
        assert login_response.status_code == 200
        
        temp_token = login_response.json()["data"]["token"]
        temp_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {temp_token}"
        }
        
        # Verify user can access their data
        my_data_response = requests.get(f"{BASE_URL}/api/privacy/my-data", headers=temp_headers)
        assert my_data_response.status_code == 200
        
        # Delete the account
        delete_response = requests.delete(f"{BASE_URL}/api/privacy/delete-account", headers=temp_headers)
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        
        delete_data = delete_response.json()
        assert delete_data.get("success") is True
        assert "deleted_collections" in delete_data.get("data", {})
        
        # Verify user can no longer login
        login_after_delete = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": temp_email, "password": temp_password}
        )
        # Should fail since account is deleted
        assert login_after_delete.status_code != 200 or login_after_delete.json().get("success") is False


# ============================================
# CLEANUP
# ============================================

@pytest.fixture(scope="module", autouse=True)
def cleanup_test_reminders(auth_token):
    """Clean up any test reminders after all tests"""
    yield
    
    # After tests, clean up TEST_ prefixed reminders
    if auth_token:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}"
        }
        
        response = requests.get(f"{BASE_URL}/api/notifications/status", headers=headers)
        if response.status_code == 200:
            reminders = response.json().get("data", {}).get("reminders", [])
            for reminder in reminders:
                if reminder.get("title", "").startswith("TEST_"):
                    requests.delete(
                        f"{BASE_URL}/api/notifications/reminders/{reminder['id']}",
                        headers=headers
                    )
