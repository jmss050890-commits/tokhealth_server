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
        from datetime import datetime
        
        # Create entry as plain dict
        entry = {
            "id": str(__import__('uuid').uuid4()),
            "user_id": TEMP_USER_ID,
            "entry_type": entry_data.entry_type,
            "content": {
                "title": entry_data.title,
                "body": entry_data.body,
                "encrypted": True,
                "tags": entry_data.tags
            },
            "mood": {
                "before": entry_data.mood_before,
                "after": None,
                "intensity": 5
            },
            "privacy": {
                "visible_to_user_only": True,
                "include_in_exports": False,
                "ai_analysis_enabled": entry_data.ai_analysis_enabled
            },
            "ai_response": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await db.wisdom_vault_entries.insert_one(entry)
        
        # Remove _id for response
        if '_id' in entry:
            del entry['_id']
        
        logger.info(f"Wisdom Vault entry created: {entry_data.entry_type}")
        return success_response(
            data=entry,
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