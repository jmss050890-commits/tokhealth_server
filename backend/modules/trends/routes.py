from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import logging

from core.database import get_database
from utils.response import success_response

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

@router.get("/summary", response_model=dict)
async def get_trends_summary(
    days: int = Query(default=7, ge=1, le=90),
    member_id: Optional[str] = None,
    db=Depends(get_database)
):
    """Get health trends summary for a time period"""
    try:
        user_id = member_id or TEMP_USER_ID
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Get biometrics history
        biometrics = await db.biometrics_daily.find(
            {
                "user_id": user_id,
                "created_at": {"$gte": start_date.isoformat()}
            },
            {"_id": 0}
        ).sort("date", 1).to_list(days)
        
        # Get nutrition history
        nutrition = await db.nutrition_logs.find(
            {
                "user_id": user_id,
                "meal_time": {"$gte": start_date.isoformat()}
            },
            {"_id": 0}
        ).sort("meal_time", 1).to_list(days * 5)
        
        # Calculate trends
        trends = {
            "period_days": days,
            "biometrics": {
                "data_points": len(biometrics),
                "heart_rate": calculate_metric_trend([b.get("heart_rate_bpm") for b in biometrics if b.get("heart_rate_bpm")]),
                "steps": calculate_metric_trend([b.get("steps") for b in biometrics if b.get("steps")]),
                "blood_pressure_systolic": calculate_metric_trend([b.get("blood_pressure_systolic") for b in biometrics if b.get("blood_pressure_systolic")]),
                "blood_oxygen": calculate_metric_trend([b.get("blood_oxygen_spo2") for b in biometrics if b.get("blood_oxygen_spo2")])
            },
            "nutrition": {
                "meals_logged": len(nutrition),
                "avg_daily_calories": calculate_daily_average(nutrition, "total_calories", days),
                "avg_daily_protein": calculate_daily_average(nutrition, "total_protein_g", days)
            },
            "charts": {
                "heart_rate": [{"date": b.get("date"), "value": b.get("heart_rate_bpm")} for b in biometrics if b.get("heart_rate_bpm")],
                "steps": [{"date": b.get("date"), "value": b.get("steps")} for b in biometrics if b.get("steps")],
                "blood_pressure": [{"date": b.get("date"), "systolic": b.get("blood_pressure_systolic"), "diastolic": b.get("blood_pressure_diastolic")} for b in biometrics if b.get("blood_pressure_systolic")]
            }
        }
        
        return success_response(
            data=trends,
            message=f"Trends for last {days} days"
        )
    except Exception as e:
        logger.error(f"Error getting trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights", response_model=dict)
async def get_ai_insights(
    days: int = Query(default=7, ge=1, le=30),
    member_id: Optional[str] = None,
    db=Depends(get_database)
):
    """Get AI-generated health insights"""
    try:
        user_id = member_id or TEMP_USER_ID
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Get recent data
        biometrics = await db.biometrics_daily.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("date", -1).limit(days).to_list(days)
        
        insights = []
        
        if biometrics:
            # Steps insight
            steps_data = [b.get("steps") for b in biometrics if b.get("steps")]
            if len(steps_data) >= 2:
                avg_steps = sum(steps_data) / len(steps_data)
                recent_steps = steps_data[0] if steps_data else 0
                if recent_steps > avg_steps * 1.1:
                    insights.append({
                        "type": "positive",
                        "category": "activity",
                        "message": f"Great job! Your recent steps ({recent_steps:,}) are above your average ({int(avg_steps):,})!",
                        "icon": "trending-up"
                    })
                elif recent_steps < avg_steps * 0.8:
                    insights.append({
                        "type": "attention",
                        "category": "activity",
                        "message": f"Your steps have dropped below average. Try a short walk today!",
                        "icon": "footprints"
                    })
            
            # Heart rate insight
            hr_data = [b.get("heart_rate_bpm") for b in biometrics if b.get("heart_rate_bpm")]
            if hr_data:
                avg_hr = sum(hr_data) / len(hr_data)
                if 60 <= avg_hr <= 80:
                    insights.append({
                        "type": "positive",
                        "category": "heart",
                        "message": f"Your resting heart rate ({int(avg_hr)} BPM) is in the healthy range!",
                        "icon": "heart"
                    })
                elif avg_hr > 100:
                    insights.append({
                        "type": "warning",
                        "category": "heart",
                        "message": "Your heart rate has been elevated. Consider relaxation techniques.",
                        "icon": "alert-triangle"
                    })
            
            # Blood pressure insight
            bp_data = [(b.get("blood_pressure_systolic"), b.get("blood_pressure_diastolic")) for b in biometrics if b.get("blood_pressure_systolic")]
            if bp_data:
                avg_sys = sum(bp[0] for bp in bp_data) / len(bp_data)
                avg_dia = sum(bp[1] for bp in bp_data) / len(bp_data)
                if avg_sys < 120 and avg_dia < 80:
                    insights.append({
                        "type": "positive",
                        "category": "blood_pressure",
                        "message": f"Blood pressure looking good at {int(avg_sys)}/{int(avg_dia)}!",
                        "icon": "activity"
                    })
                elif avg_sys >= 140 or avg_dia >= 90:
                    insights.append({
                        "type": "warning",
                        "category": "blood_pressure",
                        "message": "Your blood pressure is elevated. Consider consulting your doctor.",
                        "icon": "alert-triangle"
                    })
        
        # Consistency insight
        if len(biometrics) >= days * 0.7:
            insights.append({
                "type": "positive",
                "category": "consistency",
                "message": f"You've been consistent with tracking! Keep it up!",
                "icon": "check-circle"
            })
        elif len(biometrics) < days * 0.3 and days > 3:
            insights.append({
                "type": "attention",
                "category": "consistency",
                "message": "Try to log your health data more regularly for better insights.",
                "icon": "calendar"
            })
        
        # Default insight if none
        if not insights:
            insights.append({
                "type": "info",
                "category": "general",
                "message": "Keep tracking your health data to see personalized insights!",
                "icon": "info"
            })
        
        return success_response(
            data={
                "period_days": days,
                "insights": insights,
                "total_insights": len(insights)
            },
            message="Health insights generated"
        )
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/goals", response_model=dict)
async def get_goals_progress(
    member_id: Optional[str] = None,
    db=Depends(get_database)
):
    """Get progress towards health goals"""
    try:
        user_id = member_id or TEMP_USER_ID
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        # Get user profile for targets
        profile = await db.user_profiles.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        # Get today's data
        biometrics = await db.biometrics_daily.find_one(
            {"user_id": user_id, "date": today},
            {"_id": 0}
        )
        
        # Get today's nutrition
        nutrition = await db.nutrition_logs.find(
            {"user_id": user_id, "meal_time": {"$regex": f"^{today}"}},
            {"_id": 0}
        ).to_list(10)
        
        total_calories = sum(n.get("total_calories", 0) for n in nutrition)
        total_protein = sum(n.get("total_protein_g", 0) for n in nutrition)
        
        # Get hydration
        hydration = await db.hydration_logs.find(
            {"user_id": user_id, "date": today},
            {"_id": 0}
        ).to_list(20)
        total_water = sum(h.get("amount_ml", 0) for h in hydration)
        
        # Calculate goals
        targets = profile.get("targets", {}) if profile else {}
        
        goals = [
            {
                "name": "Daily Steps",
                "current": biometrics.get("steps", 0) if biometrics else 0,
                "target": targets.get("recommended_steps", 10000),
                "unit": "steps",
                "icon": "footprints"
            },
            {
                "name": "Calories",
                "current": int(total_calories),
                "target": targets.get("recommended_calories", 2000),
                "unit": "kcal",
                "icon": "flame"
            },
            {
                "name": "Protein",
                "current": int(total_protein),
                "target": targets.get("recommended_protein_g", 120),
                "unit": "g",
                "icon": "beef"
            },
            {
                "name": "Water",
                "current": total_water,
                "target": targets.get("recommended_water_ml", 2500),
                "unit": "ml",
                "icon": "droplets"
            }
        ]
        
        # Calculate completion percentage for each goal
        for goal in goals:
            goal["percentage"] = min(100, int((goal["current"] / goal["target"]) * 100)) if goal["target"] > 0 else 0
            goal["remaining"] = max(0, goal["target"] - goal["current"])
        
        return success_response(
            data={
                "date": today,
                "goals": goals,
                "overall_completion": sum(g["percentage"] for g in goals) // len(goals) if goals else 0
            },
            message="Goals progress retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting goals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def calculate_metric_trend(values: List) -> dict:
    """Calculate trend statistics for a metric"""
    if not values:
        return {"avg": None, "min": None, "max": None, "trend": "no_data"}
    
    avg = sum(values) / len(values)
    
    # Calculate trend direction
    trend = "stable"
    if len(values) >= 3:
        first_half = sum(values[:len(values)//2]) / (len(values)//2)
        second_half = sum(values[len(values)//2:]) / (len(values) - len(values)//2)
        if second_half > first_half * 1.05:
            trend = "increasing"
        elif second_half < first_half * 0.95:
            trend = "decreasing"
    
    return {
        "avg": round(avg, 1),
        "min": min(values),
        "max": max(values),
        "count": len(values),
        "trend": trend
    }

def calculate_daily_average(logs: List, field: str, days: int) -> float:
    """Calculate daily average for nutrition field"""
    total = sum(log.get(field, 0) for log in logs)
    return round(total / days, 1) if days > 0 else 0
