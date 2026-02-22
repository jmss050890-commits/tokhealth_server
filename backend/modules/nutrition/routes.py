from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, date
import logging

from core.database import get_database
from models.nutrition import NutritionLog, NutritionLogCreate
from utils.response import success_response, error_response

logger = logging.getLogger(__name__)
router = APIRouter()

# Temporary user_id for MVP (will add auth later)
TEMP_USER_ID = "demo-user-001"

@router.post("/log", response_model=dict)
async def log_meal(meal_data: NutritionLogCreate, db=Depends(get_database)):
    """Log a meal with nutrition information"""
    try:
        # Calculate totals
        total_calories = sum(item.calories for item in meal_data.food_items)
        total_protein = sum(item.protein_g for item in meal_data.food_items)
        total_carbs = sum(item.carbs_g for item in meal_data.food_items)
        total_fat = sum(item.fat_g for item in meal_data.food_items)
        total_fiber = sum(item.fiber_g for item in meal_data.food_items)
        
        # Create nutrition log as plain dict
        nutrition_log = {
            "id": str(__import__('uuid').uuid4()),
            "user_id": TEMP_USER_ID,
            "meal_type": meal_data.meal_type,
            "food_items": [item.model_dump() for item in meal_data.food_items],
            "total_calories": total_calories,
            "total_protein_g": total_protein,
            "total_carbs_g": total_carbs,
            "total_fat_g": total_fat,
            "total_fiber_g": total_fiber,
            "meal_time": meal_data.meal_time.isoformat() if hasattr(meal_data.meal_time, 'isoformat') else str(meal_data.meal_time),
            "notes": meal_data.notes,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Save to database
        await db.nutrition_logs.insert_one(nutrition_log)
        
        # Remove _id for response
        if '_id' in nutrition_log:
            del nutrition_log['_id']
        
        logger.info(f"Meal logged: {meal_data.meal_type} - {total_calories} calories")
        return success_response(
            data=nutrition_log,
            message="Meal logged successfully"
        )
    except Exception as e:
        logger.error(f"Error logging meal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs", response_model=dict)
async def get_nutrition_logs(
    days: int = 7,
    db=Depends(get_database)
):
    """Get nutrition logs for the last N days"""
    try:
        logs = await db.nutrition_logs.find(
            {"user_id": TEMP_USER_ID},
            {"_id": 0}
        ).sort("meal_time", -1).limit(days * 4).to_list(100)  # Assume max 4 meals/day
        
        return success_response(
            data=logs,
            message=f"Retrieved {len(logs)} nutrition logs"
        )
    except Exception as e:
        logger.error(f"Error retrieving logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/today", response_model=dict)
async def get_today_nutrition(db=Depends(get_database)):
    """Get today's nutrition summary"""
    try:
        today = date.today().isoformat()
        
        logs = await db.nutrition_logs.find(
            {
                "user_id": TEMP_USER_ID,
                "meal_time": {"$regex": f"^{today}"}
            },
            {"_id": 0}
        ).to_list(20)
        
        # Calculate totals
        total_calories = sum(log.get("total_calories", 0) for log in logs)
        total_protein = sum(log.get("total_protein_g", 0) for log in logs)
        total_carbs = sum(log.get("total_carbs_g", 0) for log in logs)
        total_fat = sum(log.get("total_fat_g", 0) for log in logs)
        
        return success_response(
            data={
                "date": today,
                "meals": logs,
                "totals": {
                    "calories": total_calories,
                    "protein_g": total_protein,
                    "carbs_g": total_carbs,
                    "fat_g": total_fat
                }
            },
            message="Today's nutrition retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting today's nutrition: {e}")
        raise HTTPException(status_code=500, detail=str(e))