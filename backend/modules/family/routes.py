from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone
import logging
import secrets

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

class FamilyInvite(BaseModel):
    email: EmailStr

class InviteResponse(BaseModel):
    action: str  # accept or decline

@router.get("/members", response_model=dict)
async def get_family_members(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get all linked family members for current user"""
    try:
        user_id = await get_current_user_id(authorization, db)
        
        # Get all accepted family links where user is either sender or receiver
        links = await db.family_links.find({
            "$or": [
                {"from_user_id": user_id, "status": "accepted"},
                {"to_user_id": user_id, "status": "accepted"}
            ]
        }).to_list(100)
        
        # Collect all linked user IDs
        linked_user_ids = set()
        for link in links:
            if link["from_user_id"] == user_id:
                linked_user_ids.add(link["to_user_id"])
            else:
                linked_user_ids.add(link["from_user_id"])
        
        # Get user details for linked members
        members = []
        for linked_id in linked_user_ids:
            user = await db.users.find_one(
                {"user_id": linked_id},
                {"_id": 0, "password_hash": 0, "token": 0}
            )
            if user:
                # Get their latest loop status
                loop_status = await db.loop_daily.find_one(
                    {"user_id": linked_id},
                    {"_id": 0},
                    sort=[("date", -1)]
                )
                
                zone = "gray"
                if loop_status:
                    zone = loop_status.get("status_summary", {}).get("overall_zone", "gray")
                
                # Get their profile for additional info
                profile = await db.user_profiles.find_one(
                    {"user_id": linked_id},
                    {"_id": 0}
                )
                
                members.append({
                    "user_id": user["user_id"],
                    "name": user["name"],
                    "email": user["email"],
                    "health_zone": zone,
                    "profile": profile
                })
        
        return success_response(
            data=members,
            message=f"Found {len(members)} family members"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting family members: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invite", response_model=dict)
async def send_family_invite(
    invite: FamilyInvite,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Send a family link invitation to another user"""
    try:
        current_user = await get_current_user(authorization, db)
        
        # Can't invite yourself
        if invite.email.lower() == current_user["email"]:
            raise HTTPException(status_code=400, detail="You cannot invite yourself")
        
        # Check if target user exists
        target_user = await db.users.find_one({"email": invite.email.lower()})
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found. They need to create an account first.")
        
        # Check if link already exists
        existing = await db.family_links.find_one({
            "$or": [
                {"from_user_id": current_user["user_id"], "to_user_id": target_user["user_id"]},
                {"from_user_id": target_user["user_id"], "to_user_id": current_user["user_id"]}
            ]
        })
        
        if existing:
            if existing["status"] == "accepted":
                raise HTTPException(status_code=400, detail="You are already linked with this user")
            elif existing["status"] == "pending":
                raise HTTPException(status_code=400, detail="An invitation is already pending")
        
        # Create the invitation
        link_id = f"link_{datetime.now(timezone.utc).timestamp()}_{secrets.token_hex(4)}"
        link_doc = {
            "link_id": link_id,
            "from_user_id": current_user["user_id"],
            "from_user_name": current_user["name"],
            "from_user_email": current_user["email"],
            "to_user_id": target_user["user_id"],
            "to_user_name": target_user["name"],
            "to_user_email": target_user["email"],
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.family_links.insert_one(link_doc)
        link_doc.pop("_id", None)
        
        logger.info(f"Family invite sent from {current_user['email']} to {invite.email}")
        return success_response(
            data=link_doc,
            message=f"Invitation sent to {target_user['name']}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending invite: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/invites/pending", response_model=dict)
async def get_pending_invites(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get pending family invitations for current user"""
    try:
        user_id = await get_current_user_id(authorization, db)
        
        # Get invites received (pending)
        received = await db.family_links.find(
            {"to_user_id": user_id, "status": "pending"},
            {"_id": 0}
        ).to_list(100)
        
        # Get invites sent (pending)
        sent = await db.family_links.find(
            {"from_user_id": user_id, "status": "pending"},
            {"_id": 0}
        ).to_list(100)
        
        return success_response(
            data={
                "received": received,
                "sent": sent
            },
            message=f"{len(received)} pending invites"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting pending invites: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invites/{link_id}/respond", response_model=dict)
async def respond_to_invite(
    link_id: str,
    response: InviteResponse,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Accept or decline a family invitation"""
    try:
        user_id = await get_current_user_id(authorization, db)
        
        # Find the invite
        invite = await db.family_links.find_one({
            "link_id": link_id,
            "to_user_id": user_id,
            "status": "pending"
        })
        
        if not invite:
            raise HTTPException(status_code=404, detail="Invitation not found")
        
        new_status = "accepted" if response.action == "accept" else "declined"
        
        await db.family_links.update_one(
            {"link_id": link_id},
            {
                "$set": {
                    "status": new_status,
                    "responded_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        action_msg = "accepted" if response.action == "accept" else "declined"
        logger.info(f"Family invite {link_id} {action_msg} by {user_id}")
        
        return success_response(
            data={"link_id": link_id, "status": new_status},
            message=f"You have {action_msg} the family invitation"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error responding to invite: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/members/{target_user_id}", response_model=dict)
async def remove_family_member(
    target_user_id: str,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Remove a family link"""
    try:
        user_id = await get_current_user_id(authorization, db)
        
        result = await db.family_links.delete_one({
            "$or": [
                {"from_user_id": user_id, "to_user_id": target_user_id},
                {"from_user_id": target_user_id, "to_user_id": user_id}
            ],
            "status": "accepted"
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Family link not found")
        
        return success_response(
            data={"removed_user_id": target_user_id},
            message="Family member removed"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing family member: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard", response_model=dict)
async def get_family_dashboard(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get family dashboard with all linked members' health status"""
    try:
        current_user = await get_current_user(authorization, db)
        user_id = current_user["user_id"]
        
        # Get current user's loop status
        my_loop = await db.loop_daily.find_one(
            {"user_id": user_id},
            {"_id": 0},
            sort=[("date", -1)]
        )
        my_zone = "gray"
        if my_loop:
            my_zone = my_loop.get("status_summary", {}).get("overall_zone", "gray")
        
        dashboard_data = [{
            "user_id": user_id,
            "name": current_user["name"] + " (You)",
            "email": current_user["email"],
            "health_zone": my_zone,
            "is_self": True
        }]
        
        # Get all accepted family links
        links = await db.family_links.find({
            "$or": [
                {"from_user_id": user_id, "status": "accepted"},
                {"to_user_id": user_id, "status": "accepted"}
            ]
        }).to_list(100)
        
        # Get each linked member's status
        for link in links:
            linked_id = link["to_user_id"] if link["from_user_id"] == user_id else link["from_user_id"]
            
            user = await db.users.find_one(
                {"user_id": linked_id},
                {"_id": 0, "password_hash": 0, "token": 0}
            )
            
            if user:
                loop_status = await db.loop_daily.find_one(
                    {"user_id": linked_id},
                    {"_id": 0},
                    sort=[("date", -1)]
                )
                
                zone = "gray"
                if loop_status:
                    zone = loop_status.get("status_summary", {}).get("overall_zone", "gray")
                
                dashboard_data.append({
                    "user_id": user["user_id"],
                    "name": user["name"],
                    "email": user["email"],
                    "health_zone": zone,
                    "is_self": False
                })
        
        return success_response(
            data={
                "total_members": len(dashboard_data),
                "members": dashboard_data
            },
            message="Family dashboard retrieved"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting family dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))
