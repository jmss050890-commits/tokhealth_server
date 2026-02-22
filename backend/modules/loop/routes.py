from fastapi import APIRouter, HTTPException, Depends
from datetime import date
import logging

from core.database import get_database
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

@router.get("/status", response_model=dict)
async def get_loop_status(db=Depends(get_database)):
    """Get The Loop - current health status visualization"""
    try:
        today = date.today().isoformat()
        
        # Get today's health metrics
        metrics = await db.health_metrics.find_one(
            {"user_id": TEMP_USER_ID, "date": today},
            {"_id": 0}
        )
        
        if not metrics:
            # Return default/empty metrics
            return success_response(
                data={
                    "date": today,
                    "status": "No data for today",
                    "message": "Start tracking your health to see The Loop!"
                },
                message="No health metrics for today"
            )
        
        return success_response(
            data=metrics,
            message="The Loop status retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting Loop status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends", response_model=dict)
async def get_health_trends(
    days: int = 7,
    db=Depends(get_database)
):
    """Get health trends over time"""
    try:
        metrics = await db.health_metrics.find(
            {"user_id": TEMP_USER_ID},
            {"_id": 0}
        ).sort("date", -1).limit(days).to_list(days)
        
        return success_response(
            data=metrics,
            message=f"Retrieved {len(metrics)} days of health trends"
        )
    except Exception as e:
        logger.error(f"Error getting trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))