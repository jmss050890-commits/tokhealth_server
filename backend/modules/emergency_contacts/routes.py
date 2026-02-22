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
        from datetime import datetime
        
        # Create contact as plain dict
        contact = {
            "id": str(__import__('uuid').uuid4()),
            "user_id": TEMP_USER_ID,
            "name": contact_data.name,
            "relationship": contact_data.relationship,
            "phone_primary": contact_data.phone_primary,
            "phone_secondary": contact_data.phone_secondary,
            "email": contact_data.email,
            "address": contact_data.address,
            "is_primary_contact": contact_data.is_primary_contact,
            "medical_info": contact_data.medical_info,
            "priority_order": contact_data.priority_order,
            "notification_preferences": {
                "sms": True,
                "call": True,
                "email": False
            },
            "last_contacted": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await db.emergency_contacts.insert_one(contact)
        
        # Remove _id for response
        if '_id' in contact:
            del contact['_id']
        
        logger.info(f"Emergency contact created: {contact_data.name}")
        return success_response(
            data=contact,
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