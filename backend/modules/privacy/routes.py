from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import datetime, timezone
import logging

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter()


async def get_user_id(authorization: str, db) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)


@router.get("/my-data", response_model=dict)
async def get_my_data(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get summary of all data stored for the current user"""
    try:
        user_id = await get_user_id(authorization, db)

        profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
        nutrition_count = await db.nutrition_logs.count_documents({"user_id": user_id})
        biometrics_count = await db.biometrics_daily.count_documents({"user_id": user_id})
        prescriptions = await db.prescriptions.find({"user_id": user_id}, {"_id": 0}).to_list(100)
        contacts = await db.emergency_contacts.find({"user_id": user_id}, {"_id": 0}).to_list(50)
        hydration_count = await db.hydration_logs.count_documents({"user_id": user_id})
        wisdom_count = await db.wisdom_vault.count_documents({"user_id": user_id})
        spiritual_count = await db.spiritual_vault.count_documents({"user_id": user_id})
        lab_count = await db.lab_results.count_documents({"user_id": user_id})
        coach_count = await db.health_coach_messages.count_documents({"user_id": user_id})

        return success_response(
            data={
                "user_id": user_id,
                "data_categories": [
                    {"name": "Profile & Baseline", "records": 1 if profile else 0, "has_data": profile is not None},
                    {"name": "Nutrition Logs", "records": nutrition_count, "has_data": nutrition_count > 0},
                    {"name": "Biometrics", "records": biometrics_count, "has_data": biometrics_count > 0},
                    {"name": "Prescriptions", "records": len(prescriptions), "has_data": len(prescriptions) > 0},
                    {"name": "Emergency Contacts", "records": len(contacts), "has_data": len(contacts) > 0},
                    {"name": "Hydration Logs", "records": hydration_count, "has_data": hydration_count > 0},
                    {"name": "Wisdom Vault Entries", "records": wisdom_count, "has_data": wisdom_count > 0},
                    {"name": "Spiritual Vault Entries", "records": spiritual_count, "has_data": spiritual_count > 0},
                    {"name": "Lab Results", "records": lab_count, "has_data": lab_count > 0},
                    {"name": "Health Coach Messages", "records": coach_count, "has_data": coach_count > 0}
                ],
                "profile_summary": {
                    "name": profile.get("name", "N/A") if profile else "N/A",
                    "allergies": profile.get("allergies", []) if profile else [],
                    "food_tolerances": profile.get("food_tolerances", []) if profile else [],
                    "spiritual_preference": profile.get("spiritual_preference", "") if profile else ""
                }
            },
            message="Your data summary"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export", response_model=dict)
async def export_all_data(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Export all user data as JSON"""
    try:
        user_id = await get_user_id(authorization, db)

        profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
        nutrition = await db.nutrition_logs.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
        biometrics = await db.biometrics_daily.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
        prescriptions = await db.prescriptions.find({"user_id": user_id}, {"_id": 0}).to_list(100)
        contacts = await db.emergency_contacts.find({"user_id": user_id}, {"_id": 0}).to_list(50)
        hydration = await db.hydration_logs.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
        wisdom = await db.wisdom_vault.find({"user_id": user_id}, {"_id": 0}).to_list(500)
        spiritual = await db.spiritual_vault.find({"user_id": user_id}, {"_id": 0}).to_list(500)
        labs = await db.lab_results.find({"user_id": user_id}, {"_id": 0}).to_list(100)
        coach = await db.health_coach_messages.find({"user_id": user_id}, {"_id": 0}).to_list(500)

        return success_response(
            data={
                "export_date": datetime.now(timezone.utc).isoformat(),
                "user_id": user_id,
                "profile": profile,
                "nutrition_logs": nutrition,
                "biometrics": biometrics,
                "prescriptions": prescriptions,
                "emergency_contacts": contacts,
                "hydration_logs": hydration,
                "wisdom_vault_entries": wisdom,
                "spiritual_vault_entries": spiritual,
                "lab_results": labs,
                "health_coach_messages": coach
            },
            message="Complete data export"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete-account", response_model=dict)
async def delete_account(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Permanently delete user account and ALL associated data"""
    try:
        user_id = await get_user_id(authorization, db)

        collections = [
            "user_profiles", "nutrition_logs", "biometrics_daily",
            "prescriptions", "emergency_contacts", "hydration_logs",
            "wisdom_vault", "spiritual_vault", "lab_results",
            "health_coach_messages", "loop_daily", "health_metrics",
            "reminders", "family_invites", "family_links"
        ]

        deleted_counts = {}
        for col_name in collections:
            col = db[col_name]
            result = await col.delete_many({"user_id": user_id})
            if result.deleted_count > 0:
                deleted_counts[col_name] = result.deleted_count

        # Delete from family links where user is either member
        await db.family_links.delete_many({"$or": [{"user1_id": user_id}, {"user2_id": user_id}]})

        # Delete the user account itself
        await db.users.delete_one({"user_id": user_id})

        return success_response(
            data={"deleted_collections": deleted_counts},
            message="Account and all data permanently deleted"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting account: {e}")
        raise HTTPException(status_code=500, detail=str(e))
