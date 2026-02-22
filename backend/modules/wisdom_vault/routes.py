from fastapi import APIRouter, HTTPException, Depends
import logging

from core.database import get_database
from models.wisdom_vault import WisdomVaultEntry, WisdomVaultEntryCreate
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

@router.post("/entries", response_model=dict)
async def create_entry(entry_data: WisdomVaultEntryCreate, db=Depends(get_database)):
    """Create new wisdom vault entry (journal, thought dump, etc.)"""
    try:
        from models.wisdom_vault import EntryContent, MoodInfo
        
        content = EntryContent(
            title=entry_data.title,
            body=entry_data.body,
            tags=entry_data.tags
        )
        
        mood = MoodInfo(before=entry_data.mood_before)
        
        entry = WisdomVaultEntry(
            user_id=TEMP_USER_ID,
            entry_type=entry_data.entry_type,
            content=content,
            mood=mood
        )
        
        await db.wisdom_vault_entries.insert_one(entry.to_dict())
        
        logger.info(f"Wisdom Vault entry created: {entry_data.entry_type}")
        return success_response(
            data=entry.model_dump(),
            message="Entry created successfully"
        )
    except Exception as e:
        logger.error(f"Error creating entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/entries", response_model=dict)
async def get_entries(
    entry_type: str = None,
    days: int = 30,
    db=Depends(get_database)
):
    """Get wisdom vault entries"""
    try:
        query = {"user_id": TEMP_USER_ID}
        if entry_type:
            query["entry_type"] = entry_type
        
        entries = await db.wisdom_vault_entries.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(days).to_list(days)
        
        return success_response(
            data=entries,
            message=f"Retrieved {len(entries)} entries"
        )
    except Exception as e:
        logger.error(f"Error retrieving entries: {e}")
        raise HTTPException(status_code=500, detail=str(e))