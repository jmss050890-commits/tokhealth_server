from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from models.base import BaseDBModel

class MessageContent(BaseModel):
    title: str
    content: str
    health_suggestions: List[str] = []
    action_items: List[str] = []
    encouragement: str = ""

class EmergencyContactOffer(BaseModel):
    offered: bool = False
    reason: Optional[str] = None
    user_response: Optional[str] = None  # accepted/declined/null
    contact_initiated: bool = False
    contact_id: Optional[str] = None

class VoiceMessage(BaseModel):
    available: bool = False
    audio_url: Optional[str] = None
    duration_seconds: int = 0
    generated_at: Optional[datetime] = None

class Delivery(BaseModel):
    text: bool = True
    voice: bool = False
    push_notification: bool = False

class AIMetadata(BaseModel):
    model_used: str = "gemini-3-pro"
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class UserInteraction(BaseModel):
    viewed: bool = False
    viewed_at: Optional[datetime] = None
    acknowledged: bool = False
    feedback: Optional[str] = None  # helpful/not_helpful/ignored
    emergency_action_taken: Optional[bool] = None

class TriggeredBy(BaseModel):
    date: str
    status: str
    problem_areas: List[str] = []
    red_metrics: List[str] = []
    yellow_metrics: List[str] = []

class HealthCoachMessage(BaseDBModel):
    user_id: str
    message_type: str = "motivational"  # motivational/corrective/congratulatory/warning/red_alert
    tone: str = "friendly"  # friendly/encouraging/calm_supportive/urgent_calm
    triggered_by: TriggeredBy
    message: MessageContent
    emergency_contact_offer: EmergencyContactOffer = Field(default_factory=EmergencyContactOffer)
    voice_message: VoiceMessage = Field(default_factory=VoiceMessage)
    delivery: Delivery = Field(default_factory=Delivery)
    ai_metadata: AIMetadata = Field(default_factory=AIMetadata)
    user_interaction: UserInteraction = Field(default_factory=UserInteraction)