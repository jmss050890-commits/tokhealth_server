from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from models.base import BaseDBModel

class FoodItem(BaseModel):
    name: str
    quantity: float
    unit: str
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0

class AIInsights(BaseModel):
    generated_at: datetime
    summary: str
    recommendations: List[str] = []
    health_score: float = 0.0  # 0-10 scale

class NutritionLog(BaseDBModel):
    user_id: str
    meal_type: str  # breakfast/lunch/dinner/snack
    food_items: List[FoodItem]
    total_calories: float = 0
    total_protein_g: float = 0
    total_carbs_g: float = 0
    total_fat_g: float = 0
    total_fiber_g: float = 0
    meal_time: datetime
    notes: Optional[str] = None
    ai_insights: Optional[AIInsights] = None

class NutritionLogCreate(BaseModel):
    meal_type: str
    food_items: List[FoodItem]
    meal_time: datetime
    notes: Optional[str] = None