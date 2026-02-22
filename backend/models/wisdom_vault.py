from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from models.base import BaseDBModel

class EntryContent(BaseModel):
    title: str
    body: str
    encrypted: bool = True
    tags: List[str] = []

class MoodInfo(BaseModel):
    before: Optional[str] = None
    after: Optional[str] = None
    intensity: int = 5  # 1-10

class PrivacySettings(BaseModel):
    visible_to_user_only: bool = True
    include_in_exports: bool = False
    ai_analysis_enabled: bool = True

class AIResponse(BaseModel):
    enabled: bool = True
    message: str = ""
    wellness_suggestions: List[str] = []

class WisdomVaultEntry(BaseDBModel):
    user_id: str
    entry_type: str  # journal/thought_dump/gratitude/worry/reflection
    content: EntryContent
    mood: MoodInfo = Field(default_factory=MoodInfo)
    privacy: PrivacySettings = Field(default_factory=PrivacySettings)
    ai_response: Optional[AIResponse] = None

class WisdomVaultEntryCreate(BaseModel):
    entry_type: str
    title: str
    body: str
    tags: List[str] = []
    mood_before: Optional[str] = None
    ai_analysis_enabled: bool = True