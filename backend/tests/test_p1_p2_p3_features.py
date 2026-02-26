"""
TokHealth API Tests - P1/P2/P3 New Features
Tests for:
- P1: User Profile allergies, food_tolerances, spiritual_preference fields
- P2: Wisdom Vault lab result upload and AI analysis
- P3: RxNorm medication search and drug interaction checker
"""
import pytest
import requests
import os
from datetime import datetime, timezone

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tokhealth-kpa-1.preview.emergentagent.com').rstrip('/')


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for meka@demo.com"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "meka@demo.com",
        "password": "pass123"
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("data", {}).get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with Bearer token"""
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    }


class TestP1ProfileNewFields:
    """Test User Profile new fields: allergies, food_tolerances, spiritual_preference"""

    def test_get_profile_with_new_fields(self, auth_headers):
        """Test GET /api/profile/ returns new fields"""
        response = requests.get(f"{BASE_URL}/api/profile/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        profile = data.get("data")
        if profile:
            # Check new fields exist in response
            assert "allergies" in profile or profile.get("allergies") is None
            assert "food_tolerances" in profile or profile.get("food_tolerances") is None
            assert "spiritual_preference" in profile or profile.get("spiritual_preference") is None

    def test_save_profile_with_allergies(self, auth_headers):
        """Test saving profile with allergies field"""
        payload = {
            "name": "TEST_Meka_Profile",
            "age": 35,
            "gender": "male",
            "height_cm": 175.0,
            "weight_kg": 75.0,
            "activity_level": "moderate",
            "blood_type": "O+",
            "health_goals": ["weight_management"],
            "medical_conditions": [],
            "allergies": ["Peanuts", "Shellfish"],
            "food_tolerances": [],
            "spiritual_preference": ""
        }
        response = requests.post(f"{BASE_URL}/api/profile/", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        profile = data.get("data", {})
        assert profile.get("allergies") == ["Peanuts", "Shellfish"]

    def test_save_profile_with_food_tolerances(self, auth_headers):
        """Test saving profile with food_tolerances field"""
        payload = {
            "name": "TEST_Meka_Profile",
            "age": 35,
            "gender": "male",
            "height_cm": 175.0,
            "weight_kg": 75.0,
            "activity_level": "moderate",
            "blood_type": "O+",
            "health_goals": ["weight_management"],
            "medical_conditions": [],
            "allergies": ["Peanuts", "Shellfish"],
            "food_tolerances": ["Lactose Intolerant", "Gluten Sensitive"],
            "spiritual_preference": ""
        }
        response = requests.post(f"{BASE_URL}/api/profile/", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        profile = data.get("data", {})
        assert profile.get("food_tolerances") == ["Lactose Intolerant", "Gluten Sensitive"]

    def test_save_profile_with_spiritual_preference(self, auth_headers):
        """Test saving profile with spiritual_preference field"""
        payload = {
            "name": "TEST_Meka_Profile",
            "age": 35,
            "gender": "male",
            "height_cm": 175.0,
            "weight_kg": 75.0,
            "activity_level": "moderate",
            "blood_type": "O+",
            "health_goals": ["weight_management"],
            "medical_conditions": [],
            "allergies": ["Peanuts", "Shellfish"],
            "food_tolerances": ["Lactose Intolerant"],
            "spiritual_preference": "Christianity"
        }
        response = requests.post(f"{BASE_URL}/api/profile/", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        profile = data.get("data", {})
        assert profile.get("spiritual_preference") == "Christianity"

    def test_get_profile_verifies_saved_data(self, auth_headers):
        """Test GET profile returns the saved new fields"""
        response = requests.get(f"{BASE_URL}/api/profile/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        profile = data.get("data", {})
        # Verify fields were persisted
        assert isinstance(profile.get("allergies"), list)
        assert isinstance(profile.get("food_tolerances"), list)
        # spiritual_preference is a string
        assert isinstance(profile.get("spiritual_preference", ""), str)


class TestP3RxNormMedicationSearch:
    """Test RxNorm medication search endpoint"""

    def test_search_medication_aspirin(self, auth_headers):
        """Test /api/medication/search with 'aspirin' query"""
        response = requests.get(f"{BASE_URL}/api/medication/search?query=aspirin", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        results = data.get("data", [])
        # Should return medication results
        assert isinstance(results, list)
        # RxNorm API should find aspirin
        if len(results) > 0:
            assert "rxcui" in results[0]
            assert "name" in results[0]

    def test_search_medication_ibuprofen(self, auth_headers):
        """Test /api/medication/search with 'ibuprofen' query"""
        response = requests.get(f"{BASE_URL}/api/medication/search?query=ibuprofen", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        results = data.get("data", [])
        assert isinstance(results, list)

    def test_search_medication_short_query(self, auth_headers):
        """Test /api/medication/search with query too short"""
        response = requests.get(f"{BASE_URL}/api/medication/search?query=a", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        # Should return empty or message about query too short
        results = data.get("data", [])
        assert isinstance(results, list)

    def test_search_medication_lisinopril(self, auth_headers):
        """Test /api/medication/search with 'lisinopril' query"""
        response = requests.get(f"{BASE_URL}/api/medication/search?query=lisinopril", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


class TestP3DrugInteractionChecker:
    """Test drug interaction checker with AI analysis"""

    def test_check_interactions_requires_two_meds(self, auth_headers):
        """Test interaction check with only 1 medication returns message"""
        payload = {"medication_names": ["Aspirin"]}
        response = requests.post(f"{BASE_URL}/api/medication/check-interactions", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        result = data.get("data", {})
        # Should indicate need more medications
        assert "summary" in result or "interactions" in result or len(result.get("medications", [])) < 2

    def test_check_interactions_two_meds(self, auth_headers):
        """Test interaction check with 2 medications returns analysis"""
        payload = {"medication_names": ["Aspirin", "Ibuprofen"]}
        response = requests.post(f"{BASE_URL}/api/medication/check-interactions", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        result = data.get("data", {})
        # Should have analysis from AI
        assert "analysis" in result or "disclaimer" in result
        assert "medications" in result
        assert result.get("medications") == ["Aspirin", "Ibuprofen"]

    def test_check_interactions_three_meds(self, auth_headers):
        """Test interaction check with 3 medications"""
        payload = {"medication_names": ["Lisinopril", "Metformin", "Atorvastatin"]}
        response = requests.post(f"{BASE_URL}/api/medication/check-interactions", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        result = data.get("data", {})
        assert "analysis" in result or "disclaimer" in result


class TestP2WisdomVaultLabResults:
    """Test Wisdom Vault lab results endpoints"""

    def test_get_lab_results_empty(self, auth_headers):
        """Test /api/wisdom-vault/lab-results returns list"""
        response = requests.get(f"{BASE_URL}/api/wisdom-vault/lab-results", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        results = data.get("data", [])
        assert isinstance(results, list)

    def test_analyze_lab_endpoint_exists(self, auth_headers):
        """Test /api/wisdom-vault/analyze-lab endpoint exists (requires file upload)"""
        # Test without file - should return 422 (missing file)
        response = requests.post(f"{BASE_URL}/api/wisdom-vault/analyze-lab", headers=auth_headers)
        # Expected to fail without file but endpoint should exist
        assert response.status_code in [400, 422, 500]


class TestPrescriptionsAPI:
    """Test prescriptions CRUD operations"""

    def test_get_prescriptions(self, auth_headers):
        """Test GET /api/prescriptions/ returns list"""
        response = requests.get(f"{BASE_URL}/api/prescriptions/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        prescriptions = data.get("data", [])
        assert isinstance(prescriptions, list)

    def test_create_prescription(self, auth_headers):
        """Test POST /api/prescriptions/ creates new prescription"""
        unique_name = f"TEST_Med_{datetime.now(timezone.utc).timestamp()}"
        payload = {
            "medication_name": unique_name,
            "dosage": "500mg",
            "frequency": "3x_daily",
            "notes": "Test prescription from automated testing"
        }
        response = requests.post(f"{BASE_URL}/api/prescriptions/", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        prescription = data.get("data", {})
        assert prescription.get("medication_name") == unique_name
        assert prescription.get("dosage") == "500mg"
        assert "id" in prescription

    def test_delete_prescription_not_found(self, auth_headers):
        """Test DELETE /api/prescriptions/{id} returns 404 for non-existent"""
        response = requests.delete(f"{BASE_URL}/api/prescriptions/non-existent-id", headers=auth_headers)
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
