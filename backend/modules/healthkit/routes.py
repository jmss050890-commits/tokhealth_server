from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
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
async def get_healthkit_status(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get Apple HealthKit connection status"""
    try:
        user_id = await get_user_id(authorization, db)

        connection = await db.healthkit_connections.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )

        return success_response(
            data={
                "connected": connection is not None,
                "last_sync": connection.get("last_sync") if connection else None,
                "data_types": connection.get("data_types", []) if connection else [],
                "note": "Apple HealthKit requires an iOS device with Safari. Open this app on your iPhone to connect."
            },
            message="HealthKit status"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"HealthKit status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class HealthKitSyncData(BaseModel):
    steps: Optional[int] = None
    heart_rate: Optional[int] = None
    sleep_hours: Optional[float] = None
    active_calories: Optional[int] = None
    blood_oxygen: Optional[int] = None
    respiratory_rate: Optional[int] = None


@router.post("/sync", response_model=dict)
async def sync_healthkit_data(
    sync_data: HealthKitSyncData,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Receive synced data from Apple HealthKit (via frontend JS bridge)"""
    try:
        from datetime import datetime, timezone
        user_id = await get_user_id(authorization, db)

        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        update_data = {}

        if sync_data.steps is not None:
            update_data["steps"] = sync_data.steps
        if sync_data.heart_rate is not None:
            update_data["heart_rate_bpm"] = sync_data.heart_rate
        if sync_data.sleep_hours is not None:
            update_data["sleep_hours"] = sync_data.sleep_hours
        if sync_data.active_calories is not None:
            update_data["active_calories"] = sync_data.active_calories
        if sync_data.blood_oxygen is not None:
            update_data["blood_oxygen_spo2"] = sync_data.blood_oxygen

        if update_data:
            update_data["date"] = today
            update_data["user_id"] = user_id
            update_data["source"] = "apple_healthkit"
            update_data["synced_at"] = datetime.now(timezone.utc).isoformat()

            await db.biometrics_daily.update_one(
                {"user_id": user_id, "date": today},
                {"$set": update_data},
                upsert=True
            )

            await db.healthkit_connections.update_one(
                {"user_id": user_id},
                {"$set": {
                    "user_id": user_id,
                    "connected": True,
                    "last_sync": datetime.now(timezone.utc).isoformat(),
                    "data_types": list(update_data.keys())
                }},
                upsert=True
            )

        return success_response(
            data={"synced_fields": list(update_data.keys())},
            message="HealthKit data synced"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"HealthKit sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
