from fastapi import APIRouter, HTTPException, Depends
from datetime import date
import logging

from core.database import get_database
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

@router.post("/log", response_model=dict)
async def log_water(
    amount_ml: int = 250,
    beverage_type: str = "water",
    db=Depends(get_database)
):
    """Log water/hydration intake"""
    try:
        from utils.datetime_utils import now_utc, today_date
        
        # Get today's total
        today = today_date().isoformat()
        today_logs = await db.hydration_logs.find(
            {"user_id": TEMP_USER_ID, "date": today}
        ).to_list(100)
        
        daily_total = sum(log.get("amount_ml", 0) for log in today_logs) + amount_ml
        
        # Create log entry
        log_entry = {
            "id": str(__import__('uuid').uuid4()),
            "user_id": TEMP_USER_ID,
            "date": today,
            "time": now_utc().isoformat(),
            "amount_ml": amount_ml,
            "beverage_type": beverage_type,
            "daily_total_ml": daily_total,
            "daily_target_ml": 2500,
            "progress_pct": (daily_total / 2500) * 100,
            "created_at": now_utc().isoformat()
        }
        
        await db.hydration_logs.insert_one(log_entry)
        
        logger.info(f"Hydration logged: {amount_ml}ml, total: {daily_total}ml")
        return success_response(
            data=log_entry,
            message="Hydration logged successfully"
        )
    except Exception as e:
        logger.error(f"Error logging hydration: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/today", response_model=dict)
async def get_today_hydration(db=Depends(get_database)):
    """Get today's hydration summary"""
    try:
        today = date.today().isoformat()
        
        logs = await db.hydration_logs.find(
            {"user_id": TEMP_USER_ID, "date": today},
            {"_id": 0}
        ).to_list(100)
        
        total_ml = sum(log.get("amount_ml", 0) for log in logs)
        target_ml = 2500
        
        return success_response(
            data={
                "date": today,
                "total_ml": total_ml,
                "target_ml": target_ml,
                "progress_pct": (total_ml / target_ml) * 100,
                "logs": logs
            },
            message="Today's hydration retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting hydration: {e}")
        raise HTTPException(status_code=500, detail=str(e))