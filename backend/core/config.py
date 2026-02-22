from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "TokHealth"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "tokhealth_db")
    
    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    
    # AI Services
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    EMERGENT_LLM_KEY: str = os.getenv("EMERGENT_LLM_KEY", "")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "your-encryption-key-32-chars-long")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()