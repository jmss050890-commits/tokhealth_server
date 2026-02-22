from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

from core.database import get_database
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

class FamilyMemberCreate(BaseModel):
    name: str
    age: int
    gender: str
    relationship: str  # self, spouse, child, parent, other
    avatar_color: str = "#0ea5e9"  # Default sky blue
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    blood_type: Optional[str] = None

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    relationship: Optional[str] = None
    avatar_color: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    blood_type: Optional[str] = None

# For MVP, we use a single family ID
FAMILY_ID = "family-001"

@router.get("/members", response_model=dict)
async def get_family_members(db=Depends(get_database)):
    """Get all family members"""
    try:
        members = await db.family_members.find(
            {"family_id": FAMILY_ID},
            {"_id": 0}
        ).sort("created_at", 1).to_list(100)
        
        return success_response(
            data=members,
            message=f"Found {len(members)} family members"
        )
    except Exception as e:
        logger.error(f"Error getting family members: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/members", response_model=dict)
async def add_family_member(member: FamilyMemberCreate, db=Depends(get_database)):
    """Add a new family member"""
    try:
        member_id = f"member_{datetime.now(timezone.utc).timestamp()}"
        
        member_doc = {
            "member_id": member_id,
            "family_id": FAMILY_ID,
            "name": member.name,
            "age": member.age,
            "gender": member.gender,
            "relationship": member.relationship,
            "avatar_color": member.avatar_color,
            "height_cm": member.height_cm,
            "weight_kg": member.weight_kg,
            "blood_type": member.blood_type,
            "is_active": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.family_members.insert_one(member_doc)
        
        # Remove _id before returning
        member_doc.pop("_id", None)
        
        logger.info(f"Added family member: {member.name}")
        return success_response(
            data=member_doc,
            message=f"{member.name} added to family"
        )
    except Exception as e:
        logger.error(f"Error adding family member: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/members/{member_id}", response_model=dict)
async def update_family_member(member_id: str, member: FamilyMemberUpdate, db=Depends(get_database)):
    """Update a family member"""
    try:
        update_data = {k: v for k, v in member.dict().items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.family_members.update_one(
            {"member_id": member_id, "family_id": FAMILY_ID},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Family member not found")
        
        updated = await db.family_members.find_one(
            {"member_id": member_id},
            {"_id": 0}
        )
        
        return success_response(
            data=updated,
            message="Family member updated"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating family member: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/members/{member_id}", response_model=dict)
async def remove_family_member(member_id: str, db=Depends(get_database)):
    """Remove a family member"""
    try:
        result = await db.family_members.delete_one(
            {"member_id": member_id, "family_id": FAMILY_ID}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Family member not found")
        
        return success_response(
            data={"member_id": member_id},
            message="Family member removed"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing family member: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/members/{member_id}/activate", response_model=dict)
async def set_active_member(member_id: str, db=Depends(get_database)):
    """Set the active family member (the one currently being tracked)"""
    try:
        # Deactivate all members first
        await db.family_members.update_many(
            {"family_id": FAMILY_ID},
            {"$set": {"is_active": False}}
        )
        
        # Activate the selected member
        result = await db.family_members.update_one(
            {"member_id": member_id, "family_id": FAMILY_ID},
            {"$set": {"is_active": True}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Family member not found")
        
        member = await db.family_members.find_one(
            {"member_id": member_id},
            {"_id": 0}
        )
        
        return success_response(
            data=member,
            message=f"Now tracking {member['name']}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting active member: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active", response_model=dict)
async def get_active_member(db=Depends(get_database)):
    """Get the currently active family member"""
    try:
        member = await db.family_members.find_one(
            {"family_id": FAMILY_ID, "is_active": True},
            {"_id": 0}
        )
        
        if not member:
            # Return first member or None
            member = await db.family_members.find_one(
                {"family_id": FAMILY_ID},
                {"_id": 0}
            )
        
        return success_response(
            data=member,
            message="Active member retrieved" if member else "No family members yet"
        )
    except Exception as e:
        logger.error(f"Error getting active member: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard", response_model=dict)
async def get_family_dashboard(db=Depends(get_database)):
    """Get family dashboard with all members' health status"""
    try:
        members = await db.family_members.find(
            {"family_id": FAMILY_ID},
            {"_id": 0}
        ).to_list(100)
        
        dashboard_data = []
        
        for member in members:
            member_id = member["member_id"]
            
            # Get latest biometrics for this member
            biometrics = await db.biometrics_daily.find_one(
                {"user_id": member_id},
                {"_id": 0},
                sort=[("date", -1)]
            )
            
            # Get latest loop status
            loop_status = await db.loop_daily.find_one(
                {"user_id": member_id},
                {"_id": 0},
                sort=[("date", -1)]
            )
            
            # Determine health zone
            zone = "gray"  # No data
            if loop_status:
                zone = loop_status.get("status_summary", {}).get("overall_zone", "gray")
            elif biometrics:
                # Simple zone calculation from biometrics
                hr = biometrics.get("heart_rate_bpm")
                if hr:
                    if 60 <= hr <= 100:
                        zone = "green"
                    elif 50 <= hr <= 120:
                        zone = "yellow"
                    else:
                        zone = "red"
            
            dashboard_data.append({
                "member_id": member_id,
                "name": member["name"],
                "relationship": member["relationship"],
                "avatar_color": member.get("avatar_color", "#0ea5e9"),
                "is_active": member.get("is_active", False),
                "health_zone": zone,
                "last_activity": biometrics.get("date") if biometrics else None,
                "quick_stats": {
                    "heart_rate": biometrics.get("heart_rate_bpm") if biometrics else None,
                    "steps": biometrics.get("steps") if biometrics else None,
                    "blood_pressure": f"{biometrics.get('blood_pressure_systolic')}/{biometrics.get('blood_pressure_diastolic')}" if biometrics and biometrics.get("blood_pressure_systolic") else None
                }
            })
        
        return success_response(
            data={
                "family_id": FAMILY_ID,
                "total_members": len(members),
                "members": dashboard_data
            },
            message="Family dashboard retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting family dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))
