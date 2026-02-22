from fastapi import APIRouter, HTTPException, Depends
import logging

from core.database import get_database
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

@router.get("/", response_model=dict)
async def get_prescriptions(db=Depends(get_database)):
    """Get all active prescriptions"""
    try:
        prescriptions = await db.prescriptions.find(
            {"user_id": TEMP_USER_ID, "tracking.active": True},
            {"_id": 0}
        ).to_list(50)
        
        return success_response(
            data=prescriptions,
            message=f"Retrieved {len(prescriptions)} prescriptions"
        )
    except Exception as e:
        logger.error(f"Error getting prescriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))