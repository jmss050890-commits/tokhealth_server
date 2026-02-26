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

class PrescriptionCreate(BaseModel):
    medication_name: str
    dosage: str
    frequency: Optional[str] = "As needed"
    notes: Optional[str] = ""

async def get_user_id(authorization: str, db) -> str:
    """Get user_id from auth token - requires authentication"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)

@router.get("/", response_model=dict)
async def get_prescriptions(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get all active prescriptions"""
    try:
        user_id = await get_user_id(authorization, db)
        
        prescriptions = await db.prescriptions.find(
            {"user_id": user_id, "tracking.active": True},
            {"_id": 0}
        ).to_list(50)
        
        return success_response(
            data=prescriptions,
            message=f"Retrieved {len(prescriptions)} prescriptions"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting prescriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=dict)
async def create_prescription(
    prescription: PrescriptionCreate,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Create a new prescription"""
    try:
        user_id = await get_user_id(authorization, db)
        
        prescription_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "medication_name": prescription.medication_name,
            "dosage": prescription.dosage,
            "frequency": prescription.frequency,
            "notes": prescription.notes,
            "tracking": {
                "active": True,
                "start_date": datetime.now(timezone.utc).isoformat()
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.prescriptions.insert_one(prescription_doc)
        prescription_doc.pop("_id", None)
        
        return success_response(
            data=prescription_doc,
            message="Prescription added"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{prescription_id}", response_model=dict)
async def delete_prescription(
    prescription_id: str,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Deactivate a prescription"""
    try:
        user_id = await get_user_id(authorization, db)
        
        result = await db.prescriptions.update_one(
            {"id": prescription_id, "user_id": user_id},
            {"$set": {"tracking.active": False}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        return success_response(
            data=None,
            message="Prescription removed"
        )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))
