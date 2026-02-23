from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Core imports
from core.config import settings
from core.database import connect_to_mongo, close_mongo_connection
from core.logging_config import setup_logging

# Module routes (will be imported as we build them)
from modules.nutrition.routes import router as nutrition_router
from modules.emergency_contacts.routes import router as emergency_router
from modules.loop.routes import router as loop_router
from modules.health_coach.routes import router as coach_router
from modules.wisdom_vault.routes import router as wisdom_router
from modules.reminders.routes import router as reminders_router
from modules.prescriptions.routes import router as prescriptions_router
from modules.hydration.routes import router as hydration_router
from modules.biometrics.routes import router as biometrics_router
from modules.user_profile.routes import router as profile_router
from modules.family.routes import router as family_router
from modules.trends.routes import router as trends_router
from modules.auth.routes import router as auth_router
from modules.import_data.routes import router as import_router

# Setup logging
logger = setup_logging()

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"🏥 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await connect_to_mongo()
    logger.info("✅ TokHealth API is ready!")
    yield
    # Shutdown
    logger.info("Shutting down TokHealth API...")
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-driven health tracking platform",
    lifespan=lifespan
)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "Welcome to TokHealth API",
        "version": settings.APP_VERSION,
        "status": "healthy"
    }

@api_router.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}

# Include module routers
api_router.include_router(nutrition_router, prefix="/nutrition", tags=["Nutrition"])
api_router.include_router(emergency_router, prefix="/emergency-contacts", tags=["Emergency Contacts"])
api_router.include_router(loop_router, prefix="/loop", tags=["The Loop"])
api_router.include_router(coach_router, prefix="/health-coach", tags=["Health Coach"])
api_router.include_router(wisdom_router, prefix="/wisdom-vault", tags=["Wisdom Vault"])
api_router.include_router(reminders_router, prefix="/reminders", tags=["Reminders"])
api_router.include_router(prescriptions_router, prefix="/prescriptions", tags=["Prescriptions"])
api_router.include_router(hydration_router, prefix="/hydration", tags=["Hydration"])
api_router.include_router(biometrics_router, prefix="/biometrics", tags=["Biometrics"])
api_router.include_router(profile_router, prefix="/profile", tags=["User Profile"])
api_router.include_router(family_router, prefix="/family", tags=["Family"])
api_router.include_router(trends_router, prefix="/trends", tags=["Health Trends"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(import_router, prefix="/import", tags=["Data Import"])

# Mount the API router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return {
        "success": False,
        "error": {
            "message": "An unexpected error occurred",
            "detail": str(exc) if settings.DEBUG else "Internal server error"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
