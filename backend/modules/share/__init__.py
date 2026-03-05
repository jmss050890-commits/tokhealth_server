from fastapi import APIRouter, Depends, Header
from core.database import get_database
from utils.auth import get_current_user_id
from datetime import date, datetime, timezone
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


async def _get_user_id(authorization: str = Header(None), db=Depends(get_database)):
    return await get_current_user_id(authorization, db)


@router.get("/health-summary")
async def get_health_summary(
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    """Generate a shareable health progress summary card data"""
    today = date.today().isoformat()

    # Get user profile
    profile = await db.user_profiles.find_one(
        {"user_id": user_id}, {"_id": 0}
    )

    # Get today's nutrition
    meals_today = await db.nutrition_logs.find(
        {"user_id": user_id, "meal_time": {"$regex": f"^{today}"}}
    ).to_list(20)
    total_cal = sum(m.get("total_calories", 0) for m in meals_today)
    total_protein = sum(m.get("total_protein_g", 0) for m in meals_today)

    # Get today's hydration
    hydration_logs = await db.hydration_logs.find(
        {"user_id": user_id, "date": today}
    ).to_list(50)
    total_water = sum(h.get("amount_ml", 0) for h in hydration_logs)

    # Get today's biometrics
    bio = await db.biometric_logs.find_one(
        {"user_id": user_id, "date": today}, {"_id": 0}
    )
    steps = bio.get("steps", 0) if bio else 0
    heart_rate = bio.get("heart_rate", 0) if bio else 0

    # Get streak data
    streak_data = await db.streaks.find_one(
        {"user_id": user_id}, {"_id": 0}
    )
    current_streak = streak_data.get("current_streak", 0) if streak_data else 0

    # Determine zone
    zone = "green"
    if total_cal == 0 and total_water == 0 and steps == 0:
        zone = "grey"
    elif total_cal < 500 or total_water < 500:
        zone = "yellow"

    return {
        "success": True,
        "data": {
            "name": profile.get("name", "Health Warrior") if profile else "Health Warrior",
            "date": today,
            "zone": zone,
            "nutrition": {
                "calories": round(total_cal),
                "protein_g": round(total_protein)
            },
            "hydration_ml": round(total_water),
            "steps": steps,
            "heart_rate": heart_rate,
            "streak_days": current_streak,
            "meals_logged": len(meals_today)
        }
    }
