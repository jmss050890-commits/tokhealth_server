from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter()


async def get_user_id(authorization: str, db) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)

class UserProfileCreate(BaseModel):
    name: str
    age: int
    gender: str  # male/female/other
    height_cm: float
    weight_kg: float
    activity_level: str = "moderate"  # sedentary/light/moderate/active/very_active
    health_goals: List[str] = []
    medical_conditions: List[str] = []
    blood_type: Optional[str] = None
    allergies: List[str] = []
    food_tolerances: List[str] = []
    spiritual_preference: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    health_goals: Optional[List[str]] = None
    medical_conditions: Optional[List[str]] = None
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    food_tolerances: Optional[List[str]] = None
    spiritual_preference: Optional[str] = None

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """Calculate Basal Metabolic Rate using Mifflin-St Jeor equation"""
    if gender.lower() == "male":
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

def calculate_tdee(bmr: float, activity_level: str) -> float:
    """Calculate Total Daily Energy Expenditure"""
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }
    return bmr * multipliers.get(activity_level, 1.55)

def calculate_targets(weight_kg: float, height_cm: float, age: int, gender: str, activity_level: str) -> dict:
    """Calculate personalized health targets based on baseline"""
    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = calculate_tdee(bmr, activity_level)
    
    # Protein: 0.8-1g per pound of body weight for active individuals
    weight_lbs = weight_kg * 2.205
    protein_g = round(weight_lbs * 0.8)
    
    # Carbs: 45-65% of calories
    carbs_calories = tdee * 0.50
    carbs_g = round(carbs_calories / 4)
    
    # Fat: 20-35% of calories
    fat_calories = tdee * 0.30
    fat_g = round(fat_calories / 9)
    
    # Water: ~30-35ml per kg body weight
    water_ml = round(weight_kg * 33)
    
    # Steps: base 10k, adjust for activity
    steps_target = {
        "sedentary": 7500,
        "light": 8500,
        "moderate": 10000,
        "active": 12000,
        "very_active": 15000
    }.get(activity_level, 10000)
    
    # Heart rate zones (based on age)
    max_hr = 220 - age
    
    # BMI calculation
    height_m = height_cm / 100
    bmi = round(weight_kg / (height_m ** 2), 1)
    
    return {
        "bmr": round(bmr),
        "tdee": round(tdee),
        "recommended_calories": round(tdee),
        "recommended_protein_g": protein_g,
        "recommended_carbs_g": carbs_g,
        "recommended_fat_g": fat_g,
        "recommended_water_ml": water_ml,
        "recommended_steps": steps_target,
        "max_heart_rate": max_hr,
        "target_hr_zone": {
            "fat_burn": {"min": round(max_hr * 0.5), "max": round(max_hr * 0.7)},
            "cardio": {"min": round(max_hr * 0.7), "max": round(max_hr * 0.85)},
            "peak": {"min": round(max_hr * 0.85), "max": max_hr}
        },
        "bmi": bmi,
        "bmi_category": (
            "Underweight" if bmi < 18.5 else
            "Normal" if bmi < 25 else
            "Overweight" if bmi < 30 else
            "Obese"
        )
    }

@router.post("/", response_model=dict)
async def create_or_update_profile(
    profile_data: UserProfileCreate,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Create or update user baseline profile"""
    try:
        user_id = await get_user_id(authorization, db)
        
        # Calculate personalized targets
        targets = calculate_targets(
            profile_data.weight_kg,
            profile_data.height_cm,
            profile_data.age,
            profile_data.gender,
            profile_data.activity_level
        )
        
        profile = {
            "user_id": user_id,
            "name": profile_data.name,
            "age": profile_data.age,
            "gender": profile_data.gender,
            "height_cm": profile_data.height_cm,
            "weight_kg": profile_data.weight_kg,
            "activity_level": profile_data.activity_level,
            "health_goals": profile_data.health_goals,
            "medical_conditions": profile_data.medical_conditions,
            "blood_type": profile_data.blood_type,
            "allergies": profile_data.allergies,
            "food_tolerances": profile_data.food_tolerances,
            "spiritual_preference": profile_data.spiritual_preference,
            "targets": targets,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Upsert - update if exists, insert if not
        await db.user_profiles.update_one(
            {"user_id": user_id},
            {"$set": profile},
            upsert=True
        )
        
        logger.info(f"User profile saved: {profile_data.name}")
        return success_response(
            data=profile,
            message="Profile saved successfully"
        )
    except Exception as e:
        logger.error(f"Error saving profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=dict)
async def get_profile(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get user baseline profile"""
    try:
        # Get user_id from auth token, fallback to temp for backward compatibility
        if authorization:
            user_id = await get_current_user_id(authorization, db)
        else:
            user_id = TEMP_USER_ID
            
        profile = await db.user_profiles.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        if not profile:
            return success_response(
                data=None,
                message="No profile found - please set up your baseline"
            )
        
        return success_response(
            data=profile,
            message="Profile retrieved"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/targets", response_model=dict)
async def get_personalized_targets(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get personalized health targets based on baseline"""
    try:
        # Get user_id from auth token, fallback to temp for backward compatibility
        if authorization:
            user_id = await get_current_user_id(authorization, db)
        else:
            user_id = TEMP_USER_ID
            
        profile = await db.user_profiles.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        if not profile:
            # Return defaults if no profile
            return success_response(
                data={
                    "recommended_calories": 2000,
                    "recommended_protein_g": 120,
                    "recommended_carbs_g": 250,
                    "recommended_fat_g": 65,
                    "recommended_water_ml": 2500,
                    "recommended_steps": 10000,
                    "max_heart_rate": 180,
                    "has_profile": False
                },
                message="Using default targets - set up profile for personalized targets"
            )
        
        targets = profile.get("targets", {})
        targets["has_profile"] = True
        targets["name"] = profile.get("name", "User")
        
        return success_response(
            data=targets,
            message="Personalized targets retrieved"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting targets: {e}")
        raise HTTPException(status_code=500, detail=str(e))
