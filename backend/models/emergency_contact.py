from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict
from datetime import datetime
from models.base import BaseDBModel

class NotificationPreferences(BaseModel):
    sms: bool = True
    call: bool = True
    email: bool = False

class EmergencyContact(BaseDBModel):
    user_id: str
    name: str
    relationship: str  # spouse/parent/sibling/friend/doctor/etc
    phone_primary: str
    phone_secondary: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    is_primary_contact: bool = False
    medical_info: Optional[str] = None
    priority_order: int = 1
    notification_preferences: NotificationPreferences = Field(default_factory=NotificationPreferences)
    last_contacted: Optional[datetime] = None

class EmergencyContactCreate(BaseModel):
    name: str
    relationship: str
    phone_primary: str
    phone_secondary: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    is_primary_contact: bool = False
    medical_info: Optional[str] = None
    priority_order: int = 1