"""
Test Suite for TokHealth Auth and Family Features
- User registration, login, me endpoint, logout
- Family invite system, pending invites, accept/decline, dashboard
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials
TEST_USER_1 = {"email": "meka@demo.com", "password": "pass123", "name": "Meka"}
TEST_USER_2 = {"email": "jj@demo.com", "password": "pass123", "name": "JJ"}

class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_1["email"], "password": TEST_USER_1["password"]}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert "token" in data["data"]
        assert data["data"]["email"] == TEST_USER_1["email"]
        assert data["data"]["name"] == TEST_USER_1["name"]
        assert len(data["data"]["token"]) > 0
        print(f"✓ Login successful for {TEST_USER_1['email']}")
    
    def test_login_invalid_password(self):
        """Test login with wrong password returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_1["email"], "password": "wrongpassword"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("✓ Invalid password correctly returns 401")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@example.com", "password": "test"}
        )
        assert response.status_code == 401
        print("✓ Non-existent user correctly returns 401")
    
    def test_get_current_user_me(self):
        """Test GET /api/auth/me with valid token"""
        # First login to get fresh token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_1["email"], "password": TEST_USER_1["password"]}
        )
        token = login_response.json()["data"]["token"]
        
        # Get user info
        response = requests.get(f"{BASE_URL}/api/auth/me?token={token}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["data"]["email"] == TEST_USER_1["email"]
        assert "password_hash" not in data["data"]  # Ensure password not exposed
        print("✓ GET /api/auth/me returns user data correctly")
    
    def test_get_current_user_invalid_token(self):
        """Test GET /api/auth/me with invalid token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me?token=invalid_token_12345")
        assert response.status_code == 401
        print("✓ Invalid token correctly returns 401")
    
    def test_register_duplicate_email(self):
        """Test registration with existing email returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": TEST_USER_1["email"],
                "password": "newpassword",
                "name": "Duplicate User"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data["detail"].lower() or "detail" in data
        print("✓ Duplicate email registration correctly returns 400")
    
    def test_register_new_user_and_cleanup(self):
        """Test registration of new user"""
        unique_email = f"test_user_{int(time.time())}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": unique_email,
                "password": "testpass123",
                "name": "Test User"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["data"]["email"] == unique_email.lower()
        assert "token" in data["data"]
        print(f"✓ New user registration successful: {unique_email}")
    
    def test_logout(self):
        """Test logout invalidates token"""
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_1["email"], "password": TEST_USER_1["password"]}
        )
        token = login_response.json()["data"]["token"]
        
        # Logout
        logout_response = requests.post(f"{BASE_URL}/api/auth/logout?token={token}")
        assert logout_response.status_code == 200
        
        # Verify token is now invalid
        me_response = requests.get(f"{BASE_URL}/api/auth/me?token={token}")
        assert me_response.status_code == 401
        print("✓ Logout successfully invalidates token")


class TestFamilyEndpoints:
    """Family linking system tests"""
    
    @pytest.fixture
    def meka_token(self):
        """Get fresh token for Meka"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_1["email"], "password": TEST_USER_1["password"]}
        )
        return response.json()["data"]["token"]
    
    @pytest.fixture
    def jj_token(self):
        """Get fresh token for JJ"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_2["email"], "password": TEST_USER_2["password"]}
        )
        return response.json()["data"]["token"]
    
    def test_get_family_members(self, meka_token):
        """Test GET /api/family/members returns linked members"""
        response = requests.get(
            f"{BASE_URL}/api/family/members",
            headers={"Authorization": f"Bearer {meka_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert isinstance(data["data"], list)
        print(f"✓ Family members retrieved: {len(data['data'])} members")
    
    def test_get_family_members_no_auth(self):
        """Test family members endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/family/members")
        assert response.status_code == 401
        print("✓ Family members endpoint correctly requires auth")
    
    def test_get_pending_invites(self, meka_token):
        """Test GET /api/family/invites/pending returns invites"""
        response = requests.get(
            f"{BASE_URL}/api/family/invites/pending",
            headers={"Authorization": f"Bearer {meka_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "received" in data["data"]
        assert "sent" in data["data"]
        print(f"✓ Pending invites: {len(data['data']['received'])} received, {len(data['data']['sent'])} sent")
    
    def test_send_invite_to_self_fails(self, meka_token):
        """Test cannot invite yourself"""
        response = requests.post(
            f"{BASE_URL}/api/family/invite",
            headers={
                "Authorization": f"Bearer {meka_token}",
                "Content-Type": "application/json"
            },
            json={"email": TEST_USER_1["email"]}
        )
        assert response.status_code == 400
        assert "yourself" in response.json()["detail"].lower()
        print("✓ Cannot invite yourself - correctly returns 400")
    
    def test_send_invite_nonexistent_user(self, meka_token):
        """Test invite to non-existent user returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/family/invite",
            headers={
                "Authorization": f"Bearer {meka_token}",
                "Content-Type": "application/json"
            },
            json={"email": "nonexistent_user_xyz@test.com"}
        )
        assert response.status_code == 404
        print("✓ Invite to non-existent user correctly returns 404")
    
    def test_get_family_dashboard(self, meka_token):
        """Test GET /api/family/dashboard returns dashboard data"""
        response = requests.get(
            f"{BASE_URL}/api/family/dashboard",
            headers={"Authorization": f"Bearer {meka_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "total_members" in data["data"]
        assert "members" in data["data"]
        # First member should be self
        members = data["data"]["members"]
        assert len(members) > 0
        self_member = [m for m in members if m.get("is_self")]
        assert len(self_member) == 1
        assert self_member[0]["name"].endswith("(You)")
        print(f"✓ Family dashboard: {data['data']['total_members']} total members")
    
    def test_family_dashboard_shows_health_zone(self, meka_token):
        """Test dashboard includes health zone for each member"""
        response = requests.get(
            f"{BASE_URL}/api/family/dashboard",
            headers={"Authorization": f"Bearer {meka_token}"}
        )
        data = response.json()
        for member in data["data"]["members"]:
            assert "health_zone" in member
            assert member["health_zone"] in ["green", "yellow", "red", "gray"]
        print("✓ All family members have health_zone field")
    
    def test_remove_family_member_not_linked(self, meka_token):
        """Test removing non-linked member returns 404"""
        response = requests.delete(
            f"{BASE_URL}/api/family/members/nonexistent_user_id",
            headers={"Authorization": f"Bearer {meka_token}"}
        )
        assert response.status_code == 404
        print("✓ Remove non-linked member correctly returns 404")
    
    def test_respond_to_nonexistent_invite(self, jj_token):
        """Test responding to non-existent invite returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/family/invites/nonexistent_link_id/respond",
            headers={
                "Authorization": f"Bearer {jj_token}",
                "Content-Type": "application/json"
            },
            json={"action": "accept"}
        )
        assert response.status_code == 404
        print("✓ Respond to non-existent invite correctly returns 404")


class TestProfileWithAuth:
    """Profile endpoints with auth"""
    
    @pytest.fixture
    def meka_token(self):
        """Get fresh token for Meka"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_1["email"], "password": TEST_USER_1["password"]}
        )
        return response.json()["data"]["token"]
    
    def test_create_profile_with_auth(self, meka_token):
        """Test POST /api/profile/ with auth token"""
        response = requests.post(
            f"{BASE_URL}/api/profile/",
            headers={
                "Authorization": f"Bearer {meka_token}",
                "Content-Type": "application/json"
            },
            json={
                "name": "Meka Test",
                "age": 35,
                "gender": "female",
                "height_cm": 165,
                "weight_kg": 60,
                "activity_level": "moderate",
                "blood_type": "A+"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Profile created/updated with auth token")
    
    def test_get_profile_with_auth(self, meka_token):
        """Test GET /api/profile/ with auth token"""
        response = requests.get(
            f"{BASE_URL}/api/profile/",
            headers={"Authorization": f"Bearer {meka_token}"}
        )
        # May return 200 with profile or 404 if no profile
        assert response.status_code in [200, 404]
        print(f"✓ GET profile returned status {response.status_code}")


class TestBiometricsWithAuth:
    """Biometrics endpoints with auth"""
    
    @pytest.fixture
    def jj_token(self):
        """Get fresh token for JJ"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_2["email"], "password": TEST_USER_2["password"]}
        )
        return response.json()["data"]["token"]
    
    def test_log_biometrics_with_auth(self, jj_token):
        """Test POST /api/biometrics/log with auth"""
        response = requests.post(
            f"{BASE_URL}/api/biometrics/log",
            headers={
                "Authorization": f"Bearer {jj_token}",
                "Content-Type": "application/json"
            },
            json={
                "heart_rate": 72,
                "blood_pressure_systolic": 120,
                "blood_pressure_diastolic": 80,
                "temperature": 98.6,
                "spo2": 98
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Biometrics logged with auth token")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
