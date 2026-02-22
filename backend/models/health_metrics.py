from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, date
from models.base import BaseDBModel

class StatusSummary(BaseModel):
    overall_zone: str = "green"  # green/yellow/red
    red_metrics: List[str] = []
    yellow_metrics: List[str] = []
    green_metrics: List[str] = []
    needs_intervention: bool = False

class CoachInteraction(BaseModel):
    message_sent: bool = False
    message_id: Optional[str] = None
    user_responded: bool = False

class LoopInsights(BaseModel):
    strengths: List[str] = []
    improvements: List[str] = []
    trend: str = "stable"  # improving/stable/declining

class HealthMetrics(BaseDBModel):
    user_id: str
    date: date
    weight_kg: Optional[float] = None
    calories_consumed: float = 0
    calories_target: float = 2000
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    water_intake_ml: float = 0
    steps: int = 0
    exercise_minutes: int = 0
    sleep_hours: float = 0
    mood: str = "neutral"  # excellent/good/neutral/poor
    energy_level: int = 5  # 1-10
    stress_level: int = 5  # 1-10
    loop_score: float = 0.0  # 0-100
    loop_insights: LoopInsights = Field(default_factory=LoopInsights)
    status_summary: StatusSummary = Field(default_factory=StatusSummary)
    coach_interaction: CoachInteraction = Field(default_factory=CoachInteraction)

class HealthMetricsCreate(BaseModel):
    date: date
    weight_kg: Optional[float] = None
    calories_consumed: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    water_intake_ml: float = 0
    steps: int = 0
    exercise_minutes: int = 0
    sleep_hours: float = 0
    mood: str = "neutral"
    energy_level: int = 5
    stress_level: int = 5