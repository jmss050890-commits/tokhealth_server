"""
Test cases for new Gamification and Share Progress APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
TEST_USER = {"email": "meka@demo.com", "password": "pass123"}


@pytest.fixture
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
    if response.status_code == 200:
        return response.json().get("data", {}).get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


class TestShareHealthSummaryAPI:
    """Tests for /api/share/health-summary endpoint"""

    def test_get_health_summary_success(self, auth_headers):
        """Test getting health summary returns expected structure"""
        response = requests.get(f"{BASE_URL}/api/share/health-summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        
        summary = data["data"]
        # Check all required fields
        assert "name" in summary
        assert "date" in summary
        assert "zone" in summary
        assert "nutrition" in summary
        assert "hydration_ml" in summary
        assert "steps" in summary
        assert "heart_rate" in summary
        assert "streak_days" in summary
        assert "meals_logged" in summary

    def test_health_summary_nutrition_structure(self, auth_headers):
        """Test that nutrition data has correct structure"""
        response = requests.get(f"{BASE_URL}/api/share/health-summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        nutrition = data["data"]["nutrition"]
        assert "calories" in nutrition
        assert "protein_g" in nutrition
        assert isinstance(nutrition["calories"], (int, float))
        assert isinstance(nutrition["protein_g"], (int, float))

    def test_health_summary_zone_valid(self, auth_headers):
        """Test that zone is one of valid values"""
        response = requests.get(f"{BASE_URL}/api/share/health-summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        zone = data["data"]["zone"]
        assert zone in ["green", "yellow", "red", "grey"]

    def test_health_summary_requires_auth(self):
        """Test that endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/share/health-summary")
        assert response.status_code in [401, 422]


class TestGamificationStreaksAPI:
    """Tests for /api/gamification/streaks endpoint"""

    def test_get_streaks_success(self, auth_headers):
        """Test getting user streaks"""
        response = requests.get(f"{BASE_URL}/api/gamification/streaks", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        streak_data = data["data"]
        assert "current_streak" in streak_data
        assert "best_streak" in streak_data
        assert isinstance(streak_data["current_streak"], int)
        assert isinstance(streak_data["best_streak"], int)

    def test_streaks_requires_auth(self):
        """Test that endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/gamification/streaks")
        assert response.status_code in [401, 422]


class TestGamificationCheckInAPI:
    """Tests for /api/gamification/check-in endpoint"""

    def test_check_in_success(self, auth_headers):
        """Test daily check-in"""
        response = requests.post(f"{BASE_URL}/api/gamification/check-in", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        check_in_data = data["data"]
        assert "current_streak" in check_in_data
        assert "best_streak" in check_in_data
        assert isinstance(check_in_data["current_streak"], int)
        assert check_in_data["current_streak"] >= 1

    def test_check_in_idempotent_same_day(self, auth_headers):
        """Test that multiple check-ins same day don't increase streak"""
        # First check-in
        response1 = requests.post(f"{BASE_URL}/api/gamification/check-in", headers=auth_headers)
        streak1 = response1.json()["data"]["current_streak"]
        
        # Second check-in same day
        response2 = requests.post(f"{BASE_URL}/api/gamification/check-in", headers=auth_headers)
        streak2 = response2.json()["data"]["current_streak"]
        
        # Streak should be same (or message says already checked in)
        assert streak1 == streak2

    def test_check_in_requires_auth(self):
        """Test that endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/gamification/check-in")
        assert response.status_code in [401, 422]


class TestGamificationBadgesAPI:
    """Tests for /api/gamification/badges endpoint"""

    def test_get_badges_returns_10(self, auth_headers):
        """Test that badges endpoint returns all 10 badges"""
        response = requests.get(f"{BASE_URL}/api/gamification/badges", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        badges = data["data"]
        assert len(badges) == 10

    def test_badges_have_required_fields(self, auth_headers):
        """Test each badge has required fields"""
        response = requests.get(f"{BASE_URL}/api/gamification/badges", headers=auth_headers)
        badges = response.json()["data"]
        
        for badge in badges:
            assert "id" in badge
            assert "name" in badge
            assert "desc" in badge
            assert "icon" in badge
            assert "threshold" in badge
            assert "type" in badge
            assert "earned" in badge
            assert "progress" in badge

    def test_badges_include_expected_types(self, auth_headers):
        """Test that badges include the expected badge IDs"""
        response = requests.get(f"{BASE_URL}/api/gamification/badges", headers=auth_headers)
        badges = response.json()["data"]
        
        badge_ids = [b["id"] for b in badges]
        expected_badges = [
            "first_meal", "hydration_hero", "step_starter", "vitals_check",
            "week_warrior", "month_master", "journal_keeper", "prayer_warrior",
            "meal_master", "centurion"
        ]
        
        for expected in expected_badges:
            assert expected in badge_ids, f"Missing badge: {expected}"

    def test_badges_requires_auth(self):
        """Test that endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/gamification/badges")
        assert response.status_code in [401, 422]


class TestGamificationCheckBadgesAPI:
    """Tests for /api/gamification/check-badges endpoint"""

    def test_check_badges_success(self, auth_headers):
        """Test checking for new badges"""
        response = requests.post(f"{BASE_URL}/api/gamification/check-badges", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "new_badges" in data["data"]
        assert isinstance(data["data"]["new_badges"], list)

    def test_check_badges_requires_auth(self):
        """Test that endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/gamification/check-badges")
        assert response.status_code in [401, 422]
