from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import date
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


@router.get("/status", response_model=dict)
async def get_loop_status(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get The Loop - current health status visualization"""
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
                    "status": "No data for today",
                    "message": "Start tracking your health to see The Loop!"
                },
                message="No health metrics for today"
            )

        return success_response(
            data=metrics,
            message="The Loop status retrieved"
        )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Loop status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends", response_model=dict)
async def get_health_trends(
    days: int = 7,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get health trends over time"""
    try:
        user_id = await get_user_id(authorization, db)

        metrics = await db.health_metrics.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("date", -1).limit(days).to_list(days)

        return success_response(
            data=metrics,
            message=f"Retrieved {len(metrics)} days of health trends"
        )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))
