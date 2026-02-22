from fastapi import APIRouter, HTTPException, Depends
import logging

from core.database import get_database
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

@router.get("/", response_model=dict)
async def get_reminders(db=Depends(get_database)):
    """Get all active reminders"""
    try:
        reminders = await db.reminders.find(
            {"user_id": TEMP_USER_ID, "schedule.active": True},
            {"_id": 0}
        ).to_list(50)
        
        return success_response(
            data=reminders,
            message=f"Retrieved {len(reminders)} reminders"
        )
    except Exception as e:
        logger.error(f"Error getting reminders: {e}")
        raise HTTPException(status_code=500, detail=str(e))