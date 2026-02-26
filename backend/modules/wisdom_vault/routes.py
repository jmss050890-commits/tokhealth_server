from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File, Form
from typing import Optional
import logging
import os
import uuid
import base64

from core.database import get_database
from models.wisdom_vault import WisdomVaultEntry, WisdomVaultEntryCreate
from utils.response import success_response
from utils.auth import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter()

async def get_user_id(authorization: str, db) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)

@router.post("/entries", response_model=dict)
async def create_entry(
    entry_data: WisdomVaultEntryCreate,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Create new wisdom vault entry (journal, thought dump, etc.)"""
    try:
        from datetime import datetime, timezone

        user_id = await get_user_id(authorization, db)
        
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


@router.post("/analyze-lab", response_model=dict)
async def analyze_lab_result(
    file: UploadFile = File(...),
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Upload and analyze a lab result image using AI Vision"""
    try:
        user_id = await get_user_id(authorization, db)

        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")

        b64_image = base64.b64encode(contents).decode("utf-8")
        content_type = file.content_type or "image/jpeg"

        from emergentintegrations.llm import chat, ChatMessage

        emergent_key = os.environ.get("EMERGENT_LLM_KEY")
        messages = [
            ChatMessage(
                role="system",
                content="You are a medical lab result analyst. Analyze the lab result image and provide: 1) What tests are shown 2) Key values and whether they are normal/high/low 3) A brief plain-English summary of what the results mean. Always note this is for informational purposes and the user should discuss results with their doctor."
            ),
            ChatMessage(
                role="user",
                content=[
                    {"type": "text", "text": "Please analyze this lab result image and explain the findings:"},
                    {"type": "image_url", "image_url": {"url": f"data:{content_type};base64,{b64_image}"}}
                ]
            )
        ]

        analysis = await chat(
            api_key=emergent_key,
            model="gpt-5.2",
            messages=messages
        )

        from datetime import datetime, timezone
        lab_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "lab_result",
            "filename": file.filename,
            "analysis": analysis,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        await db.lab_results.insert_one(lab_entry)
        lab_entry.pop("_id", None)

        return success_response(
            data=lab_entry,
            message="Lab result analyzed successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lab analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lab-results", response_model=dict)
async def get_lab_results(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get user's lab result analyses"""
    try:
        user_id = await get_user_id(authorization, db)
        results = await db.lab_results.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(50)

        return success_response(
            data=results,
            message=f"Retrieved {len(results)} lab results"
        )
    except Exception as e:
        logger.error(f"Error getting lab results: {e}")
        raise HTTPException(status_code=500, detail=str(e))