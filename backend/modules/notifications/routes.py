from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
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


class PushSubscription(BaseModel):
    endpoint: str
    keys: dict


@router.post("/subscribe", response_model=dict)
async def subscribe_push(
    subscription: PushSubscription,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Save push notification subscription"""
    try:
        user_id = await get_user_id(authorization, db)

        await db.push_subscriptions.update_one(
            {"user_id": user_id},
            {"$set": {
                "user_id": user_id,
                "endpoint": subscription.endpoint,
                "keys": subscription.keys,
                "subscribed_at": datetime.now(timezone.utc).isoformat(),
                "active": True
            }},
            upsert=True
        )

        return success_response(
            data={"subscribed": True},
            message="Push notifications enabled"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Push subscribe error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status", response_model=dict)
async def get_notification_status(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get notification status for current user"""
    try:
        user_id = await get_user_id(authorization, db)

        sub = await db.push_subscriptions.find_one(
            {"user_id": user_id, "active": True},
            {"_id": 0}
        )

        reminders = await db.reminders.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(50)

        return success_response(
            data={
                "push_enabled": sub is not None,
                "subscribed_at": sub.get("subscribed_at") if sub else None,
                "active_reminders": len(reminders),
                "reminders": reminders
            },
            message="Notification status"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Notification status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ReminderCreate(BaseModel):
    type: str  # medication, hydration, exercise, custom
    title: str
    time: str  # HH:MM
    days: list = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    enabled: bool = True


@router.post("/reminders", response_model=dict)
async def create_reminder(
    reminder: ReminderCreate,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Create a new reminder"""
    try:
        import uuid
        user_id = await get_user_id(authorization, db)

        reminder_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": reminder.type,
            "title": reminder.title,
            "time": reminder.time,
            "days": reminder.days,
            "enabled": reminder.enabled,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        await db.reminders.insert_one(reminder_doc)
        reminder_doc.pop("_id", None)

        return success_response(
            data=reminder_doc,
            message="Reminder created"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reminder create error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/reminders/{reminder_id}", response_model=dict)
async def delete_reminder(
    reminder_id: str,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Delete a reminder"""
    try:
        user_id = await get_user_id(authorization, db)

        result = await db.reminders.delete_one({
            "id": reminder_id,
            "user_id": user_id
        })

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Reminder not found")

        return success_response(
            data={"deleted": True},
            message="Reminder deleted"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reminder delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
