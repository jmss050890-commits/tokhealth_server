from fastapi import APIRouter, Depends, Header
from core.database import get_database
from utils.auth import get_current_user_id
from datetime import date, datetime, timezone, timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

BADGES = [
    {"id": "first_meal", "name": "First Bite", "desc": "Log your first meal", "icon": "utensils", "threshold": 1, "type": "meals"},
    {"id": "hydration_hero", "name": "Hydration Hero", "desc": "Hit your water goal", "icon": "droplets", "threshold": 2500, "type": "hydration_ml"},
    {"id": "step_starter", "name": "Step Starter", "desc": "Log 1,000+ steps", "icon": "footprints", "threshold": 1000, "type": "steps"},
    {"id": "vitals_check", "name": "Vitals Check", "desc": "Log biometrics", "icon": "heart-pulse", "threshold": 1, "type": "biometrics"},
    {"id": "week_warrior", "name": "Week Warrior", "desc": "7-day streak", "icon": "flame", "threshold": 7, "type": "streak"},
    {"id": "month_master", "name": "Month Master", "desc": "30-day streak", "icon": "trophy", "threshold": 30, "type": "streak"},
    {"id": "journal_keeper", "name": "Journal Keeper", "desc": "Write 5 journal entries", "icon": "book-open", "threshold": 5, "type": "journal"},
    {"id": "prayer_warrior", "name": "Prayer Warrior", "desc": "Log 10 prayers", "icon": "sparkles", "threshold": 10, "type": "prayers"},
    {"id": "meal_master", "name": "Meal Master", "desc": "Log 50 meals", "icon": "chef-hat", "threshold": 50, "type": "meals"},
    {"id": "centurion", "name": "Centurion", "desc": "100-day streak", "icon": "crown", "threshold": 100, "type": "streak"},
]


async def _get_user_id(authorization: str = Header(None), db=Depends(get_database)):
    return await get_current_user_id(authorization, db)


@router.get("/streaks")
async def get_streaks(
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    """Get user's current streak and best streak"""
    streak = await db.streaks.find_one({"user_id": user_id}, {"_id": 0})
    if not streak:
        streak = {
            "user_id": user_id,
            "current_streak": 0,
            "best_streak": 0,
            "last_active_date": None
        }
    return {"success": True, "data": streak}


@router.post("/check-in")
async def daily_check_in(
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    """Record daily check-in and update streak"""
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    streak = await db.streaks.find_one({"user_id": user_id})

    if not streak:
        await db.streaks.insert_one({
            "user_id": user_id,
            "current_streak": 1,
            "best_streak": 1,
            "last_active_date": today,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"success": True, "data": {"current_streak": 1, "best_streak": 1, "new_badge": None}}

    last_active = streak.get("last_active_date", "")

    if last_active == today:
        return {
            "success": True,
            "data": {
                "current_streak": streak["current_streak"],
                "best_streak": streak["best_streak"],
                "new_badge": None,
                "message": "Already checked in today"
            }
        }

    if last_active == yesterday:
        new_streak = streak["current_streak"] + 1
    else:
        new_streak = 1

    best = max(streak.get("best_streak", 0), new_streak)

    await db.streaks.update_one(
        {"user_id": user_id},
        {"$set": {
            "current_streak": new_streak,
            "best_streak": best,
            "last_active_date": today
        }}
    )

    new_badge = None
    for b in BADGES:
        if b["type"] == "streak" and new_streak == b["threshold"]:
            new_badge = b
            await _award_badge(db, user_id, b["id"])
            break

    return {
        "success": True,
        "data": {
            "current_streak": new_streak,
            "best_streak": best,
            "new_badge": new_badge
        }
    }


@router.get("/badges")
async def get_badges(
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    """Get all badges and which ones user has earned"""
    earned = await db.badges.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(100)
    earned_ids = {b["badge_id"] for b in earned}

    # Calculate progress for each badge
    today = date.today().isoformat()
    streak = await db.streaks.find_one({"user_id": user_id}, {"_id": 0})
    current_streak = streak.get("current_streak", 0) if streak else 0

    total_meals = await db.nutrition_logs.count_documents({"user_id": user_id})
    total_journal = await db.wisdom_entries.count_documents({"user_id": user_id})
    total_prayers = await db.spiritual_entries.count_documents({"user_id": user_id, "type": "prayer"})

    hydration_today = await db.hydration_logs.find({"user_id": user_id, "date": today}).to_list(50)
    total_water = sum(h.get("amount_ml", 0) for h in hydration_today)

    bio = await db.biometric_logs.find_one({"user_id": user_id, "date": today}, {"_id": 0})
    total_bio = 1 if bio else 0
    total_steps = bio.get("steps", 0) if bio else 0

    progress_map = {
        "meals": total_meals,
        "hydration_ml": total_water,
        "steps": total_steps,
        "biometrics": total_bio,
        "streak": current_streak,
        "journal": total_journal,
        "prayers": total_prayers,
    }

    badges_with_status = []
    for b in BADGES:
        progress = progress_map.get(b["type"], 0)
        badges_with_status.append({
            **b,
            "earned": b["id"] in earned_ids,
            "progress": min(progress, b["threshold"]),
            "earned_date": next((e.get("earned_at") for e in earned if e["badge_id"] == b["id"]), None)
        })

    return {"success": True, "data": badges_with_status}


@router.post("/check-badges")
async def check_and_award_badges(
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    """Check all badge conditions and award any newly earned ones"""
    today = date.today().isoformat()
    earned = await db.badges.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    earned_ids = {b["badge_id"] for b in earned}

    streak = await db.streaks.find_one({"user_id": user_id}, {"_id": 0})
    current_streak = streak.get("current_streak", 0) if streak else 0

    total_meals = await db.nutrition_logs.count_documents({"user_id": user_id})
    total_journal = await db.wisdom_entries.count_documents({"user_id": user_id})
    total_prayers = await db.spiritual_entries.count_documents({"user_id": user_id, "type": "prayer"})

    hydration_today = await db.hydration_logs.find({"user_id": user_id, "date": today}).to_list(50)
    total_water = sum(h.get("amount_ml", 0) for h in hydration_today)

    bio = await db.biometric_logs.find_one({"user_id": user_id, "date": today}, {"_id": 0})
    total_bio = 1 if bio else 0
    total_steps = bio.get("steps", 0) if bio else 0

    progress_map = {
        "meals": total_meals,
        "hydration_ml": total_water,
        "steps": total_steps,
        "biometrics": total_bio,
        "streak": current_streak,
        "journal": total_journal,
        "prayers": total_prayers,
    }

    new_badges = []
    for b in BADGES:
        if b["id"] not in earned_ids and progress_map.get(b["type"], 0) >= b["threshold"]:
            await _award_badge(db, user_id, b["id"])
            new_badges.append(b)

    return {"success": True, "data": {"new_badges": new_badges}}


async def _award_badge(db, user_id: str, badge_id: str):
    existing = await db.badges.find_one({"user_id": user_id, "badge_id": badge_id})
    if not existing:
        await db.badges.insert_one({
            "user_id": user_id,
            "badge_id": badge_id,
            "earned_at": datetime.now(timezone.utc).isoformat()
        })
