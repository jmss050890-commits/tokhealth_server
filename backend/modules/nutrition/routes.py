from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timezone
import logging
import os
import json
from dotenv import load_dotenv

from core.database import get_database
from models.nutrition import NutritionLog, NutritionLogCreate
from utils.response import success_response, error_response
from utils.auth import get_current_user_id

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter()


async def get_user_id(authorization: str, db) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)

class PhotoAnalysisRequest(BaseModel):
    image_base64: str
    meal_type: str = "meal"

@router.post("/analyze-photo", response_model=dict)
async def analyze_food_photo(request: PhotoAnalysisRequest, db=Depends(get_database)):
    """Analyze a food photo using AI vision to identify foods and estimate nutrition"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # Create vision chat
        chat = LlmChat(
            api_key=api_key,
            session_id=f"food_analysis_{datetime.now(timezone.utc).timestamp()}",
            system_message="""You are a nutrition expert AI. Analyze food photos and identify:
1. All food items visible
2. Estimated portion sizes
3. Estimated calories and macros for each item

ALWAYS respond in this exact JSON format:
{
  "foods": [
    {
      "name": "food name",
      "quantity": 1.0,
      "unit": "serving/cup/piece/etc",
      "calories": 200,
      "protein_g": 10,
      "carbs_g": 25,
      "fat_g": 8,
      "fiber_g": 3
    }
  ],
  "total_calories": 400,
  "meal_description": "Brief description of the meal",
  "health_notes": "Any health tips about this meal"
}

Be realistic with estimates. If you cannot identify a food, make your best guess based on appearance."""
        ).with_model("openai", "gpt-4o")
        
        # Create image content
        image_content = ImageContent(image_base64=request.image_base64)
        
        # Send for analysis
        user_message = UserMessage(
            text="Analyze this food photo. Identify all foods and estimate their nutritional content. Respond ONLY with valid JSON.",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        try:
            # Clean the response (remove markdown code blocks if present)
            clean_response = response.strip()
            if clean_response.startswith("```"):
                clean_response = clean_response.split("```")[1]
                if clean_response.startswith("json"):
                    clean_response = clean_response[4:]
            clean_response = clean_response.strip()
            
            analysis = json.loads(clean_response)
        except json.JSONDecodeError:
            # If JSON parsing fails, return a structured error
            analysis = {
                "foods": [],
                "total_calories": 0,
                "meal_description": "Could not analyze the image",
                "health_notes": response,
                "raw_response": response
            }
        
        return success_response(
            data=analysis,
            message="Food photo analyzed successfully"
        )
        
    except ImportError as e:
        logger.error(f"Import error: {e}")
        raise HTTPException(status_code=500, detail="AI vision not available")
    except Exception as e:
        logger.error(f"Error analyzing photo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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