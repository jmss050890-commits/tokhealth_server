"""
TokHealth API Tests - New Features (Iteration 2)
Tests for: User Profile/Baseline, Back to Green Interventions, Medical Export data
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tokhealth-kpa.preview.emergentagent.com').rstrip('/')


class TestUserProfileAPI:
    """User Profile/Baseline module tests"""
    
    def test_get_profile_no_existing(self):
        """Test fetching profile (may return null if none set)"""
        response = requests.get(f"{BASE_URL}/api/profile/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        # Data can be null if no profile exists
        assert "data" in data
    
    def test_create_profile_with_validation(self):
        """Test creating user profile with all fields"""
        payload = {
            "name": "TEST_User",
            "age": 35,
            "gender": "male",
            "height_cm": 175.0,
            "weight_kg": 75.0,
            "activity_level": "moderate",
            "blood_type": "O+",
            "health_goals": ["weight_management", "increase_energy"],
            "medical_conditions": []
        }
        response = requests.post(
            f"{BASE_URL}/api/profile/",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Verify profile data saved correctly
        profile = data.get("data", {})
        assert profile.get("name") == "TEST_User"
        assert profile.get("age") == 35
        assert profile.get("gender") == "male"
        assert profile.get("height_cm") == 175.0
        assert profile.get("weight_kg") == 75.0
        assert profile.get("activity_level") == "moderate"
        
        # Verify calculated targets
        targets = profile.get("targets", {})
        assert "bmr" in targets
        assert "tdee" in targets
        assert "bmi" in targets
        assert "recommended_calories" in targets
        assert "recommended_protein_g" in targets
        assert "recommended_steps" in targets
        assert "recommended_water_ml" in targets
        assert "max_heart_rate" in targets
        
        # Verify BMI calculation is reasonable
        bmi = targets.get("bmi")
        assert bmi is not None
        assert 15 <= bmi <= 50  # Reasonable BMI range
    
    def test_get_profile_after_creation(self):
        """Test fetching profile after creation"""
        response = requests.get(f"{BASE_URL}/api/profile/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Profile should exist now
        profile = data.get("data")
        if profile:  # May be null in fresh DB
            assert "name" in profile
            assert "targets" in profile
    
    def test_get_personalized_targets(self):
        """Test fetching personalized health targets"""
        response = requests.get(f"{BASE_URL}/api/profile/targets")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        targets = data.get("data", {})
        # Should have default or personalized targets
        assert "recommended_calories" in targets or targets is None
        if targets:
            assert "recommended_protein_g" in targets
            assert "recommended_steps" in targets
    
    def test_update_profile(self):
        """Test updating existing profile"""
        payload = {
            "name": "TEST_User_Updated",
            "age": 36,
            "gender": "male",
            "height_cm": 175.0,
            "weight_kg": 74.0,  # Changed weight
            "activity_level": "active",  # Changed activity level
            "blood_type": "O+",
            "health_goals": ["weight_management"],
            "medical_conditions": []
        }
        response = requests.post(
            f"{BASE_URL}/api/profile/",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        profile = data.get("data", {})
        assert profile.get("name") == "TEST_User_Updated"
        assert profile.get("weight_kg") == 74.0
        assert profile.get("activity_level") == "active"


class TestBackToGreenAPI:
    """Back to Green interventions API tests"""
    
    def test_get_interventions_yellow_zone(self):
        """Test getting interventions for yellow zone"""
        response = requests.get(f"{BASE_URL}/api/health-coach/back-to-green?current_zone=yellow")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        intervention_data = data.get("data", {})
        assert "current_zone" in intervention_data
        assert intervention_data.get("current_zone") == "yellow"
        assert "message" in intervention_data
        assert "interventions" in intervention_data
        assert "total_interventions" in intervention_data
        
        interventions = intervention_data.get("interventions", {})
        # Should have intervention categories
        assert "immediate" in interventions
        assert "mindfulness" in interventions
        assert "physical" in interventions
        
        # For yellow zone, should have interventions
        assert len(interventions.get("immediate", [])) > 0
        
        # Verify intervention structure
        immediate = interventions.get("immediate", [])
        if immediate:
            first_intervention = immediate[0]
            assert "id" in first_intervention
            assert "name" in first_intervention
            assert "description" in first_intervention
            assert "duration_min" in first_intervention
            assert "icon" in first_intervention
            assert "type" in first_intervention
    
    def test_get_interventions_red_zone(self):
        """Test getting interventions for red zone - should have more interventions"""
        response = requests.get(f"{BASE_URL}/api/health-coach/back-to-green?current_zone=red")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        intervention_data = data.get("data", {})
        assert intervention_data.get("current_zone") == "red"
        
        interventions = intervention_data.get("interventions", {})
        
        # Red zone should have PAUSE intervention at top
        immediate = interventions.get("immediate", [])
        if immediate:
            # First intervention should be PAUSE for red zone
            first = immediate[0]
            assert first.get("id") == "pause"
            assert first.get("priority") == "high"
        
        # Should have short_term interventions for red zone
        short_term = interventions.get("short_term", [])
        assert len(short_term) > 0
        
        # Total interventions should be more than yellow
        assert intervention_data.get("total_interventions", 0) > 5
    
    def test_get_interventions_green_zone(self):
        """Test getting interventions for green zone - maintenance mode"""
        response = requests.get(f"{BASE_URL}/api/health-coach/back-to-green?current_zone=green")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        intervention_data = data.get("data", {})
        assert intervention_data.get("current_zone") == "green"
        # Green zone may have fewer or no interventions (maintenance)
        assert "interventions" in intervention_data
    
    def test_intervention_breathing_present(self):
        """Test that breathing exercise is present in yellow/red zones"""
        response = requests.get(f"{BASE_URL}/api/health-coach/back-to-green?current_zone=yellow")
        data = response.json()
        
        interventions = data.get("data", {}).get("interventions", {})
        immediate = interventions.get("immediate", [])
        
        # Check for 4-7-8 breathing
        breathing_found = any(i.get("id") == "breathing_478" for i in immediate)
        assert breathing_found, "4-7-8 Breathing exercise should be in immediate interventions"
    
    def test_intervention_hydration_present(self):
        """Test that hydration intervention is present"""
        response = requests.get(f"{BASE_URL}/api/health-coach/back-to-green?current_zone=yellow")
        data = response.json()
        
        interventions = data.get("data", {}).get("interventions", {})
        immediate = interventions.get("immediate", [])
        
        # Check for hydration
        hydration_found = any(i.get("id") == "hydration" for i in immediate)
        assert hydration_found, "Hydration intervention should be present"


class TestMedicalExportDataAPIs:
    """Tests for APIs used by Medical Export feature"""
    
    def test_profile_for_export(self):
        """Test profile API returns data needed for medical export"""
        response = requests.get(f"{BASE_URL}/api/profile/")
        assert response.status_code == 200
        # Export needs: name, age, gender, height, weight, blood_type, medical_conditions
    
    def test_biometrics_today_for_export(self):
        """Test biometrics today API returns data for export"""
        response = requests.get(f"{BASE_URL}/api/biometrics/today")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        # Export needs: heart_rate_bpm, blood_pressure, blood_oxygen_spo2, body_temp, steps
    
    def test_prescriptions_for_export(self):
        """Test prescriptions API returns data for export"""
        response = requests.get(f"{BASE_URL}/api/prescriptions/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        # Export needs: medication_name, dosage, frequency
    
    def test_emergency_contacts_for_export(self):
        """Test emergency contacts API returns data for export"""
        response = requests.get(f"{BASE_URL}/api/emergency-contacts/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        # Export needs: name, relationship, phone


# Pytest configuration
@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
