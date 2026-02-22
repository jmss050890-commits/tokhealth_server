from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Optional
from models.base import BaseDBModel

class PersonalizedTargets(BaseModel):
    bmr: float = 0  # Basal Metabolic Rate
    tdee: float = 0  # Total Daily Energy Expenditure
    recommended_calories: float = 2000
    recommended_protein_g: float = 120
    recommended_carbs_g: float = 250
    recommended_fat_g: float = 65
    recommended_water_ml: float = 2500
    recommended_sleep_hours: float = 8
    recommended_steps: int = 10000

class CustomThreshold(BaseModel):
    yellow: float = 10  # percentage
    red: float = 20  # percentage

class User(BaseDBModel):
    email: EmailStr
    name: str
    age: int
    gender: str  # male/female/other
    height_cm: float
    weight_kg: float
    activity_level: str = "moderate"  # sedentary/light/moderate/active/very_active
    health_goals: List[str] = []
    dietary_preferences: List[str] = []
    allergies: List[str] = []
    
    personalized_targets: PersonalizedTargets = Field(default_factory=PersonalizedTargets)
    custom_thresholds: Dict[str, CustomThreshold] = Field(default_factory=dict)

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    activity_level: str = "moderate"
    health_goals: List[str] = []
    dietary_preferences: List[str] = []
    allergies: List[str] = []