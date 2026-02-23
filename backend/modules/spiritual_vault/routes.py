from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging
import uuid

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

class SpiritualEntry(BaseModel):
    entry_type: str  # prayer, gratitude, reflection, scripture, meditation
    title: Optional[str] = ""
    content: str
    mood: Optional[str] = "peaceful"  # peaceful, grateful, seeking, troubled, joyful
    tags: Optional[List[str]] = []

class PrayerRequest(BaseModel):
    request: str
    for_whom: Optional[str] = "self"
    answered: Optional[bool] = False

async def get_user_id(authorization: str, db) -> str:
    """Get user_id from auth or fallback to temp"""
    if authorization:
        try:
            return await get_current_user_id(authorization, db)
        except:
            pass
    return TEMP_USER_ID

@router.post("/entry", response_model=dict)
async def create_entry(
    entry: SpiritualEntry,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Create a spiritual journal entry"""
    try:
        user_id = await get_user_id(authorization, db)
        
        entry_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "entry_type": entry.entry_type,
            "title": entry.title,
            "content": entry.content,
            "mood": entry.mood,
            "tags": entry.tags,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
        }
        
        await db.spiritual_entries.insert_one(entry_doc)
        entry_doc.pop("_id", None)
        
        logger.info(f"Spiritual entry created for {user_id}")
        return success_response(
            data=entry_doc,
            message="Entry saved to your Spiritual Vault"
        )
    except Exception as e:
        logger.error(f"Error creating spiritual entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/entries", response_model=dict)
async def get_entries(
    entry_type: Optional[str] = None,
    limit: int = 20,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get spiritual journal entries"""
    try:
        user_id = await get_user_id(authorization, db)
        
        query = {"user_id": user_id}
        if entry_type:
            query["entry_type"] = entry_type
        
        entries = await db.spiritual_entries.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return success_response(
            data=entries,
            message=f"Retrieved {len(entries)} entries"
        )
    except Exception as e:
        logger.error(f"Error getting spiritual entries: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/prayer", response_model=dict)
async def add_prayer_request(
    prayer: PrayerRequest,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Add a prayer request"""
    try:
        user_id = await get_user_id(authorization, db)
        
        prayer_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "request": prayer.request,
            "for_whom": prayer.for_whom,
            "answered": prayer.answered,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "answered_at": None
        }
        
        await db.prayer_requests.insert_one(prayer_doc)
        prayer_doc.pop("_id", None)
        
        return success_response(
            data=prayer_doc,
            message="Prayer request added"
        )
    except Exception as e:
        logger.error(f"Error adding prayer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/prayers", response_model=dict)
async def get_prayer_requests(
    answered: Optional[bool] = None,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get prayer requests"""
    try:
        user_id = await get_user_id(authorization, db)
        
        query = {"user_id": user_id}
        if answered is not None:
            query["answered"] = answered
        
        prayers = await db.prayer_requests.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).to_list(50)
        
        return success_response(
            data=prayers,
            message=f"Retrieved {len(prayers)} prayer requests"
        )
    except Exception as e:
        logger.error(f"Error getting prayers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/prayer/{prayer_id}/answered", response_model=dict)
async def mark_prayer_answered(
    prayer_id: str,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Mark a prayer as answered"""
    try:
        user_id = await get_user_id(authorization, db)
        
        result = await db.prayer_requests.update_one(
            {"id": prayer_id, "user_id": user_id},
            {"$set": {
                "answered": True,
                "answered_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Prayer request not found")
        
        return success_response(
            data={"id": prayer_id, "answered": True},
            message="Prayer marked as answered! 🙏"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking prayer answered: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/entry/{entry_id}", response_model=dict)
async def delete_entry(
    entry_id: str,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Delete a spiritual entry"""
    try:
        user_id = await get_user_id(authorization, db)
        
        result = await db.spiritual_entries.delete_one({
            "id": entry_id,
            "user_id": user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")
        
        return success_response(
            data=None,
            message="Entry deleted"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=dict)
async def get_spiritual_stats(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get spiritual practice statistics"""
    try:
        user_id = await get_user_id(authorization, db)
        
        # Count entries by type
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": "$entry_type", "count": {"$sum": 1}}}
        ]
        
        entry_counts = await db.spiritual_entries.aggregate(pipeline).to_list(10)
        
        # Count prayers
        total_prayers = await db.prayer_requests.count_documents({"user_id": user_id})
        answered_prayers = await db.prayer_requests.count_documents({"user_id": user_id, "answered": True})
        
        stats = {
            "entries_by_type": {item["_id"]: item["count"] for item in entry_counts},
            "total_entries": sum(item["count"] for item in entry_counts),
            "total_prayers": total_prayers,
            "answered_prayers": answered_prayers
        }
        
        return success_response(
            data=stats,
            message="Spiritual stats retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
