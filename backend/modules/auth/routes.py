from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging
import hashlib
import secrets

from core.database import get_database
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

# Simple token storage (in production, use JWT with proper secret)
def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = "tokhealth_salt_2024"
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def generate_token() -> str:
    """Generate a secure token"""
    return secrets.token_urlsafe(32)

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    token: str

@router.post("/register", response_model=dict)
async def register(user_data: UserRegister, db=Depends(get_database)):
    """Register a new user"""
    try:
        # Check if email already exists
        existing = await db.users.find_one({"email": user_data.email.lower()})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = f"user_{datetime.now(timezone.utc).timestamp()}_{secrets.token_hex(4)}"
        token = generate_token()
        
        user_doc = {
            "user_id": user_id,
            "email": user_data.email.lower(),
            "password_hash": hash_password(user_data.password),
            "name": user_data.name,
            "token": token,
            "token_expires": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user_doc)
        
        logger.info(f"New user registered: {user_data.email}")
        return success_response(
            data={
                "user_id": user_id,
                "email": user_data.email.lower(),
                "name": user_data.name,
                "token": token
            },
            message="Registration successful"
        )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=dict)
async def login(credentials: UserLogin, db=Depends(get_database)):
    """Login and get token"""
    try:
        user = await db.users.find_one({"email": credentials.email.lower()})
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if user["password_hash"] != hash_password(credentials.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Generate new token
        token = generate_token()
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$set": {
                    "token": token,
                    "token_expires": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        logger.info(f"User logged in: {credentials.email}")
        return success_response(
            data={
                "user_id": user["user_id"],
                "email": user["email"],
                "name": user["name"],
                "token": token
            },
            message="Login successful"
        )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=dict)
async def get_current_user(token: str, db=Depends(get_database)):
    """Get current user from token"""
    try:
        user = await db.users.find_one({"token": token}, {"_id": 0, "password_hash": 0})
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return success_response(
            data=user,
            message="User retrieved"
        )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logout", response_model=dict)
async def logout(token: str, db=Depends(get_database)):
    """Logout and invalidate token"""
    try:
        result = await db.users.update_one(
            {"token": token},
            {"$set": {"token": None}}
        )
        
        return success_response(
            data=None,
            message="Logged out successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
