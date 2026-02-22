from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
import uuid
from typing import Optional

class BaseDBModel(BaseModel):
    """Base model with common fields for all database models"""
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        """Convert model to dict with ISO formatted datetimes"""
        data = self.model_dump()
        if 'created_at' in data:
            data['created_at'] = data['created_at'].isoformat()
        if 'updated_at' in data:
            data['updated_at'] = data['updated_at'].isoformat()
        return data