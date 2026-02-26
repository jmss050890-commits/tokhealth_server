from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, date
import logging
import csv
import io

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter()

class ManualHealthEntry(BaseModel):
    date: str  # YYYY-MM-DD
    steps: Optional[int] = None
    heart_rate: Optional[int] = None
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    sleep_hours: Optional[float] = None
    weight_kg: Optional[float] = None
    calories: Optional[int] = None
    water_ml: Optional[int] = None

async def get_user_id(authorization: str, db) -> str:
    """Get user_id from auth token - requires authentication"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)

@router.post("/manual", response_model=dict)
async def log_manual_entry(
    entry: ManualHealthEntry,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Log a manual health data entry"""
    try:
        user_id = await get_user_id(authorization, db)
        
        # Build update data
        update_data = {
            "user_id": user_id,
            "date": entry.date,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if entry.steps is not None:
            update_data["steps"] = entry.steps
        if entry.heart_rate is not None:
            update_data["heart_rate_bpm"] = entry.heart_rate
        if entry.blood_pressure_systolic is not None:
            update_data["blood_pressure_systolic"] = entry.blood_pressure_systolic
        if entry.blood_pressure_diastolic is not None:
            update_data["blood_pressure_diastolic"] = entry.blood_pressure_diastolic
        if entry.sleep_hours is not None:
            update_data["sleep_hours"] = entry.sleep_hours
        if entry.weight_kg is not None:
            update_data["weight_kg"] = entry.weight_kg
        if entry.calories is not None:
            update_data["calories_consumed"] = entry.calories
        if entry.water_ml is not None:
            update_data["water_intake_ml"] = entry.water_ml
        
        # Upsert the record
        await db.health_metrics.update_one(
            {"user_id": user_id, "date": entry.date},
            {"$set": update_data},
            upsert=True
        )
        
        logger.info(f"Manual entry logged for {user_id} on {entry.date}")
        return success_response(
            data=update_data,
            message="Health data saved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging manual entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import/csv", response_model=dict)
async def import_csv_data(
    file: UploadFile = File(...),
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """
    Import health data from CSV file.
    Expected columns: date, steps, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, sleep_hours, weight_kg, calories, water_ml
    Date format: YYYY-MM-DD
    """
    try:
        user_id = await get_user_id(authorization, db)
        
        # Read and parse CSV
        content = await file.read()
        text_content = content.decode('utf-8')
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(text_content))
        
        imported_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Get date (required)
                date_str = row.get('date', '').strip()
                if not date_str:
                    errors.append(f"Row {row_num}: Missing date")
                    continue
                
                # Validate date format
                try:
                    datetime.strptime(date_str, '%Y-%m-%d')
                except ValueError:
                    errors.append(f"Row {row_num}: Invalid date format (use YYYY-MM-DD)")
                    continue
                
                # Build update data
                update_data = {
                    "user_id": user_id,
                    "date": date_str,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "source": "csv_import"
                }
                
                # Parse optional fields
                if row.get('steps'):
                    update_data["steps"] = int(row['steps'])
                if row.get('heart_rate'):
                    update_data["heart_rate_bpm"] = int(row['heart_rate'])
                if row.get('blood_pressure_systolic'):
                    update_data["blood_pressure_systolic"] = int(row['blood_pressure_systolic'])
                if row.get('blood_pressure_diastolic'):
                    update_data["blood_pressure_diastolic"] = int(row['blood_pressure_diastolic'])
                if row.get('sleep_hours'):
                    update_data["sleep_hours"] = float(row['sleep_hours'])
                if row.get('weight_kg'):
                    update_data["weight_kg"] = float(row['weight_kg'])
                if row.get('calories'):
                    update_data["calories_consumed"] = int(row['calories'])
                if row.get('water_ml'):
                    update_data["water_intake_ml"] = int(row['water_ml'])
                
                # Upsert the record
                await db.health_metrics.update_one(
                    {"user_id": user_id, "date": date_str},
                    {"$set": update_data},
                    upsert=True
                )
                imported_count += 1
                
            except Exception as row_error:
                errors.append(f"Row {row_num}: {str(row_error)}")
        
        logger.info(f"CSV import: {imported_count} records for {user_id}")
        
        return success_response(
            data={
                "imported_count": imported_count,
                "errors": errors[:10] if errors else []  # Return first 10 errors
            },
            message=f"Imported {imported_count} records" + (f" with {len(errors)} errors" if errors else "")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing CSV: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/template", response_model=dict)
async def get_csv_template():
    """Get CSV template for health data import"""
    template = """date,steps,heart_rate,blood_pressure_systolic,blood_pressure_diastolic,sleep_hours,weight_kg,calories,water_ml
2026-02-23,8500,72,120,80,7.5,70.5,2000,2500
2026-02-22,10000,68,118,78,8,70.3,1800,2200"""
    
    return success_response(
        data={
            "template": template,
            "columns": [
                {"name": "date", "required": True, "format": "YYYY-MM-DD"},
                {"name": "steps", "required": False, "format": "integer"},
                {"name": "heart_rate", "required": False, "format": "integer (bpm)"},
                {"name": "blood_pressure_systolic", "required": False, "format": "integer"},
                {"name": "blood_pressure_diastolic", "required": False, "format": "integer"},
                {"name": "sleep_hours", "required": False, "format": "decimal"},
                {"name": "weight_kg", "required": False, "format": "decimal"},
                {"name": "calories", "required": False, "format": "integer"},
                {"name": "water_ml", "required": False, "format": "integer"}
            ]
        },
        message="CSV template"
    )

@router.get("/history", response_model=dict)
async def get_health_history(
    days: int = 30,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get health data history for the past N days"""
    try:
        user_id = await get_user_id(authorization, db)
        
        # Get recent records
        records = await db.health_metrics.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("date", -1).limit(days).to_list(days)
        
        return success_response(
            data=records,
            message=f"Retrieved {len(records)} records"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
