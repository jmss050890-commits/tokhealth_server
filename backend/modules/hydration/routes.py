from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, timezone
import logging
import uuid

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter()

class HydrationLog(BaseModel):
    amount_ml: int = 250
    beverage_type: str = "water"

async def get_user_id(authorization: str, db) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)

@router.post("/log", response_model=dict)
async def log_water(
    log_data: HydrationLog,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Log water/hydration intake"""
    try:
        user_id = await get_user_id(authorization, db)
        today = date.today().isoformat()
        
        # Get today's total
        today_logs = await db.hydration_logs.find(
            {"user_id": user_id, "date": today}
        ).to_list(100)
        
        daily_total = sum(log.get("amount_ml", 0) for log in today_logs) + log_data.amount_ml
        
        # Create log entry
        log_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "date": today,
            "time": datetime.now(timezone.utc).isoformat(),
            "amount_ml": log_data.amount_ml,
            "beverage_type": log_data.beverage_type,
            "daily_total_ml": daily_total,
            "daily_target_ml": 2500,
            "progress_pct": (daily_total / 2500) * 100,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.hydration_logs.insert_one(log_entry)
        log_entry.pop("_id", None)
        
        logger.info(f"Hydration logged: {log_data.amount_ml}ml, total: {daily_total}ml")
        return success_response(
            data=log_entry,
            message="Hydration logged successfully"
        )
    except Exception as e:
        logger.error(f"Error logging hydration: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/today", response_model=dict)
async def get_today_hydration(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get today's hydration data"""
    try:
        user_id = await get_user_id(authorization, db)
        today = date.today().isoformat()
        
        today_logs = await db.hydration_logs.find(
            {"user_id": user_id, "date": today},
            {"_id": 0}
        ).to_list(100)
        
        total_ml = sum(log.get("amount_ml", 0) for log in today_logs)
        target_ml = 2500
        
        return success_response(
            data={
                "date": today,
                "total_ml": total_ml,
                "target_ml": target_ml,
                "progress_pct": (total_ml / target_ml) * 100,
                "logs": today_logs
            },
            message="Today's hydration retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting hydration: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=dict)
async def get_hydration_history(
    days: int = 7,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get hydration history"""
    try:
        user_id = await get_user_id(authorization, db)
        
        logs = await db.hydration_logs.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(days * 10).to_list(100)
        
        return success_response(
            data=logs,
            message=f"Retrieved {len(logs)} hydration logs"
        )
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
