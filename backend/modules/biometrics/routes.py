from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from datetime import date, datetime, timezone
import logging
import uuid

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

class BiometricReading(BaseModel):
    heart_rate_bpm: Optional[int] = None
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    blood_oxygen_spo2: Optional[int] = None
    body_temp_celsius: Optional[float] = None
    resting_heart_rate: Optional[int] = None
    steps: Optional[int] = None

async def get_user_id(authorization: str, db) -> str:
    """Get user_id from auth token - requires authentication"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)

@router.post("/log", response_model=dict)
async def log_biometrics(
    reading: BiometricReading,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Log biometric readings"""
    try:
        user_id = await get_user_id(authorization, db)
        today = date.today().isoformat()
        
        # Get or create today's health metrics
        metrics = await db.health_metrics.find_one({
            "user_id": user_id,
            "date": today
        })
        
        if not metrics:
            # Create new metrics entry
            new_doc = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "date": today,
                "calories_consumed": 0,
                "calories_target": 2000,
                "protein_g": 0,
                "carbs_g": 0,
                "fat_g": 0,
                "water_intake_ml": 0,
                "steps": 0,
                "exercise_minutes": 0,
                "sleep_hours": 0,
                "mood": "neutral",
                "energy_level": 5,
                "stress_level": 5,
                "loop_score": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            new_doc.update(reading.model_dump(exclude_none=True))
            await db.health_metrics.insert_one(new_doc)
        else:
            # Update existing metrics
            update_data = reading.model_dump(exclude_none=True)
            if update_data:
                update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
                await db.health_metrics.update_one(
                    {"user_id": user_id, "date": today},
                    {"$set": update_data}
                )
        
        # Log as separate reading for history
        log_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        log_entry.update(reading.model_dump(exclude_none=True))
        
        await db.biometric_readings.insert_one(log_entry)
        
        # Remove _id from response if it exists
        if '_id' in log_entry:
            del log_entry['_id']
        
        logger.info(f"Biometrics logged for {user_id} on {today}")
        return success_response(
            data=log_entry,
            message="Biometric reading logged successfully"
        )
    except Exception as e:
        logger.error(f"Error logging biometrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/today", response_model=dict)
async def get_today_biometrics(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get today's biometric readings"""
    try:
        user_id = await get_user_id(authorization, db)
        today = date.today().isoformat()
        
        metrics = await db.health_metrics.find_one(
            {"user_id": user_id, "date": today},
            {"_id": 0}
        )
        
        if not metrics:
            return success_response(
                data={
                    "date": today,
                    "heart_rate_bpm": None,
                    "blood_pressure_systolic": None,
                    "blood_pressure_diastolic": None,
                    "blood_oxygen_spo2": None,
                    "steps": 0
                },
                message="No biometric data for today"
            )
        
        biometric_data = {
            "date": today,
            "heart_rate_bpm": metrics.get("heart_rate_bpm"),
            "blood_pressure_systolic": metrics.get("blood_pressure_systolic"),
            "blood_pressure_diastolic": metrics.get("blood_pressure_diastolic"),
            "blood_oxygen_spo2": metrics.get("blood_oxygen_spo2"),
            "body_temp_celsius": metrics.get("body_temp_celsius"),
            "resting_heart_rate": metrics.get("resting_heart_rate"),
            "steps": metrics.get("steps", 0)
        }
        
        return success_response(
            data=biometric_data,
            message="Today's biometrics retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting biometrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=dict)
async def get_biometric_history(
    days: int = 7,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get biometric reading history"""
    try:
        user_id = await get_user_id(authorization, db)
        
        readings = await db.biometric_readings.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(days * 10).to_list(100)
        
        return success_response(
            data=readings,
            message=f"Retrieved {len(readings)} biometric readings"
        )
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/zones", response_model=dict)
async def get_biometric_zones(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get health zones for biometric readings"""
    try:
        user_id = await get_user_id(authorization, db)
        today = date.today().isoformat()
        
        metrics = await db.health_metrics.find_one(
            {"user_id": user_id, "date": today},
            {"_id": 0}
        )
        
        if not metrics:
            return success_response(
                data={"zones": {}, "overall": "green"},
                message="No data to analyze"
            )
        
        zones = {}
        
        # Heart Rate Zones (60-100 normal)
        hr = metrics.get("heart_rate_bpm")
        if hr:
            if 60 <= hr <= 100:
                zones["heart_rate"] = {"value": hr, "zone": "green", "status": "Normal"}
            elif 50 <= hr < 60 or 100 < hr <= 120:
                zones["heart_rate"] = {"value": hr, "zone": "yellow", "status": "Monitor"}
            else:
                zones["heart_rate"] = {"value": hr, "zone": "red", "status": "Consult Doctor"}
        
        # Blood Pressure Zones
        sys = metrics.get("blood_pressure_systolic")
        dia = metrics.get("blood_pressure_diastolic")
        if sys and dia:
            if sys < 120 and dia < 80:
                zones["blood_pressure"] = {"systolic": sys, "diastolic": dia, "zone": "green", "status": "Normal"}
            elif sys < 130 and dia < 80:
                zones["blood_pressure"] = {"systolic": sys, "diastolic": dia, "zone": "yellow", "status": "Elevated"}
            elif sys < 140 or dia < 90:
                zones["blood_pressure"] = {"systolic": sys, "diastolic": dia, "zone": "yellow", "status": "Stage 1 Hypertension"}
            else:
                zones["blood_pressure"] = {"systolic": sys, "diastolic": dia, "zone": "red", "status": "Stage 2 Hypertension"}
        
        # Blood Oxygen (95-100 normal)
        spo2 = metrics.get("blood_oxygen_spo2")
        if spo2:
            if spo2 >= 95:
                zones["blood_oxygen"] = {"value": spo2, "zone": "green", "status": "Normal"}
            elif spo2 >= 90:
                zones["blood_oxygen"] = {"value": spo2, "zone": "yellow", "status": "Low"}
            else:
                zones["blood_oxygen"] = {"value": spo2, "zone": "red", "status": "Very Low - Seek Medical Attention"}
        
        # Steps (10,000 target)
        steps = metrics.get("steps", 0)
        if steps >= 8000:
            zones["steps"] = {"value": steps, "zone": "green", "status": "Great!"}
        elif steps >= 5000:
            zones["steps"] = {"value": steps, "zone": "yellow", "status": "Keep Going"}
        else:
            zones["steps"] = {"value": steps, "zone": "yellow", "status": "More Activity Needed"}
        
        # Overall zone (worst zone determines overall)
        red_count = sum(1 for z in zones.values() if z.get("zone") == "red")
        yellow_count = sum(1 for z in zones.values() if z.get("zone") == "yellow")
        
        if red_count > 0:
            overall = "red"
        elif yellow_count > 0:
            overall = "yellow"
        else:
            overall = "green"
        
        return success_response(
            data={"zones": zones, "overall": overall},
            message="Biometric zones calculated"
        )
    except Exception as e:
        logger.error(f"Error calculating zones: {e}")
        raise HTTPException(status_code=500, detail=str(e))
