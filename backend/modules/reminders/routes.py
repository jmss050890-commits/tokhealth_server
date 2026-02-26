from fastapi import APIRouter, HTTPException, Depends, Header
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


@router.get("/", response_model=dict)
async def get_reminders(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get all active reminders"""
    try:
        user_id = await get_user_id(authorization, db)

        reminders = await db.reminders.find(
            {"user_id": user_id, "schedule.active": True},
            {"_id": 0}
        ).to_list(50)

        return success_response(
            data=reminders,
            message=f"Retrieved {len(reminders)} reminders"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting reminders: {e}")
        raise HTTPException(status_code=500, detail=str(e))
