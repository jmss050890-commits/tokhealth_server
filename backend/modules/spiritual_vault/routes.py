from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging
import uuid
import os

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id

# Import emergent integrations for AI
try:
    from emergentintegrations.llm.chat import chat, LlmMessage
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False

logger = logging.getLogger(__name__)
router = APIRouter()

EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "")

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

class SpiritualGuidanceRequest(BaseModel):
    message: str
    context: Optional[str] = "general"  # general, comfort, gratitude, scripture, meditation

async def get_user_id(authorization: str, db) -> str:
    """Get user_id from auth token - requires authentication"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)

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
    except HTTPException:
        raise
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
    except HTTPException:
        raise
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
    except HTTPException:
        raise
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
    except HTTPException:
        raise
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/guidance", response_model=dict)
async def get_spiritual_guidance(
    request: SpiritualGuidanceRequest,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get AI spiritual guidance and encouragement"""
    try:
        if not AI_AVAILABLE or not EMERGENT_LLM_KEY:
            return success_response(
                data={"response": "The Lord is my shepherd; I shall not want. Take comfort in knowing you are loved and guided."},
                message="Guidance provided"
            )
        
        user_id = await get_user_id(authorization, db)
        
        # Get user's recent spiritual entries for context
        recent_entries = await db.spiritual_entries.find(
            {"user_id": user_id},
            {"_id": 0, "content": 1, "entry_type": 1, "mood": 1}
        ).sort("created_at", -1).limit(3).to_list(3)
        
        context_info = ""
        if recent_entries:
            context_info = "Recent spiritual journal entries: " + "; ".join([
                f"{e.get('entry_type', 'entry')}: {e.get('content', '')[:100]}" 
                for e in recent_entries
            ])
        
        # Build system prompt based on context
        context_prompts = {
            "general": "You are a compassionate spiritual guide offering wisdom, encouragement, and biblical insights.",
            "comfort": "You are providing comfort and peace during difficult times, offering hope and reassurance from scripture.",
            "gratitude": "You are helping cultivate gratitude and thanksgiving, highlighting blessings and God's goodness.",
            "scripture": "You are sharing relevant scripture verses with brief, meaningful reflections.",
            "meditation": "You are guiding peaceful meditation and reflection, helping find inner peace and connection with God."
        }
        
        system_prompt = f"""You are a loving, faith-based spiritual guide within TokHealth's Spiritual Vault. 
{context_prompts.get(request.context, context_prompts['general'])}

Guidelines:
- Be warm, compassionate, and encouraging
- Share relevant scripture when appropriate (include the reference)
- Keep responses concise but meaningful (2-4 sentences)
- Respect all faith backgrounds while being rooted in Christian wisdom
- Offer practical spiritual encouragement
- Never give medical advice - only spiritual support

{context_info}"""

        messages = [
            LlmMessage(role="system", content=system_prompt),
            LlmMessage(role="user", content=request.message)
        ]
        
        response = await chat(
            api_key=EMERGENT_LLM_KEY,
            messages=messages,
            model="gpt-5.2"
        )
        
        ai_response = response.content if hasattr(response, 'content') else str(response)
        
        # Save the interaction
        interaction = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "user_message": request.message,
            "ai_response": ai_response,
            "context": request.context,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.spiritual_guidance.insert_one(interaction)
        
        return success_response(
            data={"response": ai_response},
            message="Spiritual guidance provided"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting spiritual guidance: {e}")
        # Fallback response
        return success_response(
            data={"response": "Be still and know that I am God. (Psalm 46:10) Take a moment to breathe and feel His presence with you."},
            message="Guidance provided"
        )

