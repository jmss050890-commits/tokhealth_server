from fastapi import APIRouter, HTTPException, Depends
from typing import List
import logging

from core.database import get_database
from models.emergency_contact import EmergencyContact, EmergencyContactCreate
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

@router.post("/", response_model=dict)
async def create_contact(contact_data: EmergencyContactCreate, db=Depends(get_database)):
    """Create new emergency contact"""
    try:
        contact = EmergencyContact(
            user_id=TEMP_USER_ID,
            **contact_data.model_dump()
        )
        
        await db.emergency_contacts.insert_one(contact.to_dict())
        
        logger.info(f"Emergency contact created: {contact.name}")
        return success_response(
            data=contact.model_dump(),
            message="Emergency contact created successfully"
        )
    except Exception as e:
        logger.error(f"Error creating contact: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=dict)
async def get_contacts(db=Depends(get_database)):
    """Get all emergency contacts"""
    try:
        contacts = await db.emergency_contacts.find(
            {"user_id": TEMP_USER_ID},
            {"_id": 0}
        ).sort("priority_order", 1).to_list(50)
        
        return success_response(
            data=contacts,
            message=f"Retrieved {len(contacts)} emergency contacts"
        )
    except Exception as e:
        logger.error(f"Error retrieving contacts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{contact_id}", response_model=dict)
async def delete_contact(contact_id: str, db=Depends(get_database)):
    """Delete emergency contact"""
    try:
        result = await db.emergency_contacts.delete_one({
            "id": contact_id,
            "user_id": TEMP_USER_ID
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Contact not found")
        
        logger.info(f"Emergency contact deleted: {contact_id}")
        return success_response(message="Contact deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting contact: {e}")
        raise HTTPException(status_code=500, detail=str(e))