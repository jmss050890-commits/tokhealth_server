from fastapi import APIRouter, Depends, Header, HTTPException
from core.database import get_database
from utils.auth import get_current_user_id
from datetime import date, datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
import logging
import secrets

router = APIRouter()
logger = logging.getLogger(__name__)


class ChallengeCreate(BaseModel):
    title: str
    description: str
    duration_days: int  # 7 or 30
    goal_type: str  # hydration, steps, meals, streaks, custom
    daily_target: float
    target_unit: str  # ml, steps, meals, days, etc.
    prize_name: Optional[str] = None
    prize_description: Optional[str] = None
    prize_url: Optional[str] = None


async def _get_user_id(authorization: str = Header(None), db=Depends(get_database)):
    return await get_current_user_id(authorization, db)


@router.post("/create")
async def create_challenge(
    challenge: ChallengeCreate,
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    invite_code = secrets.token_urlsafe(8)
    now = datetime.now(timezone.utc).isoformat()
    start_date = date.today().isoformat()
    end_date = (date.today() + timedelta(days=challenge.duration_days)).isoformat()

    # Get creator name
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "name": 1})
    creator_name = user.get("name", "Anonymous") if user else "Anonymous"

    doc = {
        "creator_id": user_id,
        "creator_name": creator_name,
        "title": challenge.title,
        "description": challenge.description,
        "duration_days": challenge.duration_days,
        "goal_type": challenge.goal_type,
        "daily_target": challenge.daily_target,
        "target_unit": challenge.target_unit,
        "prize_name": challenge.prize_name,
        "prize_description": challenge.prize_description,
        "prize_url": challenge.prize_url,
        "invite_code": invite_code,
        "start_date": start_date,
        "end_date": end_date,
        "participants": [{"user_id": user_id, "name": creator_name, "joined_at": now}],
        "status": "active",
        "created_at": now
    }
    await db.challenges.insert_one(doc)

    return {
        "success": True,
        "data": {
            "invite_code": invite_code,
            "title": challenge.title,
            "start_date": start_date,
            "end_date": end_date,
            "duration_days": challenge.duration_days
        }
    }


@router.post("/join/{invite_code}")
async def join_challenge(
    invite_code: str,
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    challenge = await db.challenges.find_one({"invite_code": invite_code})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    if challenge.get("status") != "active":
        raise HTTPException(status_code=400, detail="Challenge is no longer active")

    # Check if already joined
    participants = challenge.get("participants", [])
    if any(p["user_id"] == user_id for p in participants):
        return {"success": True, "message": "Already joined this challenge"}

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "name": 1})
    name = user.get("name", "Anonymous") if user else "Anonymous"

    await db.challenges.update_one(
        {"invite_code": invite_code},
        {"$push": {"participants": {
            "user_id": user_id,
            "name": name,
            "joined_at": datetime.now(timezone.utc).isoformat()
        }}}
    )

    return {
        "success": True,
        "data": {
            "title": challenge["title"],
            "goal_type": challenge["goal_type"],
            "daily_target": challenge["daily_target"],
            "end_date": challenge["end_date"]
        }
    }


@router.get("/my-challenges")
async def get_my_challenges(
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    challenges = await db.challenges.find(
        {"participants.user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)

    today = date.today().isoformat()
    result = []
    for c in challenges:
        # Get my progress
        progress = await db.challenge_progress.find(
            {"challenge_code": c["invite_code"], "user_id": user_id}
        ).to_list(100)
        days_completed = len(progress)

        result.append({
            "invite_code": c["invite_code"],
            "title": c["title"],
            "description": c["description"],
            "goal_type": c["goal_type"],
            "daily_target": c["daily_target"],
            "target_unit": c["target_unit"],
            "duration_days": c["duration_days"],
            "start_date": c["start_date"],
            "end_date": c["end_date"],
            "status": c["status"],
            "prize_name": c.get("prize_name"),
            "prize_description": c.get("prize_description"),
            "prize_url": c.get("prize_url"),
            "participant_count": len(c.get("participants", [])),
            "my_days_completed": days_completed,
            "creator_name": c.get("creator_name", ""),
            "is_creator": c["creator_id"] == user_id
        })

    return {"success": True, "data": result}


@router.post("/log-progress/{invite_code}")
async def log_challenge_progress(
    invite_code: str,
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    challenge = await db.challenges.find_one({"invite_code": invite_code})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    if not any(p["user_id"] == user_id for p in challenge.get("participants", [])):
        raise HTTPException(status_code=403, detail="Not a participant")

    today = date.today().isoformat()

    existing = await db.challenge_progress.find_one({
        "challenge_code": invite_code,
        "user_id": user_id,
        "date": today
    })
    if existing:
        return {"success": True, "message": "Already logged today", "data": {"days_completed": 0}}

    await db.challenge_progress.insert_one({
        "challenge_code": invite_code,
        "user_id": user_id,
        "date": today,
        "logged_at": datetime.now(timezone.utc).isoformat()
    })

    total = await db.challenge_progress.count_documents({
        "challenge_code": invite_code,
        "user_id": user_id
    })

    return {
        "success": True,
        "data": {"days_completed": total, "duration_days": challenge["duration_days"]}
    }


@router.get("/leaderboard/{invite_code}")
async def get_leaderboard(
    invite_code: str,
    user_id: str = Depends(_get_user_id),
    db=Depends(get_database)
):
    challenge = await db.challenges.find_one(
        {"invite_code": invite_code}, {"_id": 0}
    )
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    participants = challenge.get("participants", [])
    leaderboard = []

    for p in participants:
        count = await db.challenge_progress.count_documents({
            "challenge_code": invite_code,
            "user_id": p["user_id"]
        })
        leaderboard.append({
            "name": p["name"],
            "user_id": p["user_id"],
            "days_completed": count,
            "is_me": p["user_id"] == user_id
        })

    leaderboard.sort(key=lambda x: x["days_completed"], reverse=True)

    return {
        "success": True,
        "data": {
            "challenge": {
                "title": challenge["title"],
                "description": challenge["description"],
                "goal_type": challenge["goal_type"],
                "daily_target": challenge["daily_target"],
                "target_unit": challenge["target_unit"],
                "duration_days": challenge["duration_days"],
                "start_date": challenge["start_date"],
                "end_date": challenge["end_date"],
                "prize_name": challenge.get("prize_name"),
                "prize_description": challenge.get("prize_description"),
                "prize_url": challenge.get("prize_url"),
                "status": challenge["status"]
            },
            "leaderboard": leaderboard
        }
    }
