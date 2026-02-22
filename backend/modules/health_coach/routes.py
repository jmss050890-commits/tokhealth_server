from fastapi import APIRouter, HTTPException, Depends
import logging

from core.database import get_database
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

@router.get("/status", response_model=dict)
async def get_coach_status(db=Depends(get_database)):
    """Get current health status with zones"""
    try:
        # This will be implemented with zone calculation logic
        return success_response(
            data={
                "overall_zone": "green",
                "message": "You're doing great! Keep it up! 💪"
            },
            message="Health Coach status retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting coach status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/messages", response_model=dict)
async def get_coach_messages(
    days: int = 7,
    db=Depends(get_database)
):
    """Get recent coaching messages"""
    try:
        messages = await db.health_coach_messages.find(
            {"user_id": TEMP_USER_ID},
            {"_id": 0}
        ).sort("created_at", -1).limit(days).to_list(days)
        
        return success_response(
            data=messages,
            message=f"Retrieved {len(messages)} coaching messages"
        )
    except Exception as e:
        logger.error(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))