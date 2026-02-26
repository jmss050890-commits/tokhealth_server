from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
import logging
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter()


async def get_user_id(authorization: str, db) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return await get_current_user_id(authorization, db)

class ChatMessage(BaseModel):
    message: str
    session_id: str = "default"

class CoachResponse(BaseModel):
    response: str
    zone: str = "green"

# Store chat sessions in memory (in production, use Redis/DB)
chat_sessions = {}

@router.get("/status", response_model=dict)
async def get_coach_status(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get current health status with zones"""
    try:
        user_id = await get_user_id(authorization, db)

        loop_status = await db.loop_daily.find_one(
            {"user_id": user_id},
            {"_id": 0},
            sort=[("date", -1)]
        )
        
        if loop_status:
            overall_zone = loop_status.get("status_summary", {}).get("overall_zone", "green")
            if overall_zone == "green":
                message = "You're doing great! Keep it up!"
            elif overall_zone == "yellow":
                message = "Some areas need attention. Let's work on them together."
            else:
                message = "Important metrics need your attention. I'm here to help."
        else:
            overall_zone = "gray"
            message = "Start tracking to get personalized guidance!"
            
        return success_response(
            data={
                "overall_zone": overall_zone,
                "message": message
            },
            message="Health Coach status retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting coach status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=dict)
async def chat_with_coach(
    chat_message: ChatMessage,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Chat with AI Health Coach using GPT-5.2"""
    try:
        user_id = await get_user_id(authorization, db)
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        session_id = f"{user_id}_{chat_message.session_id}"
        
        loop_status = await db.loop_daily.find_one(
            {"user_id": user_id},
            {"_id": 0},
            sort=[("date", -1)]
        )
        
        biometrics = await db.biometrics_daily.find_one(
            {"user_id": user_id},
            {"_id": 0},
            sort=[("date", -1)]
        )
        
        # Build health context
        health_context = "User's current health data:\n"
        if loop_status:
            health_context += f"- Overall Zone: {loop_status.get('status_summary', {}).get('overall_zone', 'unknown')}\n"
            health_context += f"- Calories: {loop_status.get('calories_consumed', 0)}/{loop_status.get('calories_target', 2000)}\n"
            health_context += f"- Steps: {loop_status.get('steps', 0)}/10000\n"
        if biometrics:
            if biometrics.get('heart_rate_bpm'):
                health_context += f"- Heart Rate: {biometrics.get('heart_rate_bpm')} BPM\n"
            if biometrics.get('blood_pressure_systolic'):
                health_context += f"- Blood Pressure: {biometrics.get('blood_pressure_systolic')}/{biometrics.get('blood_pressure_diastolic')}\n"
            if biometrics.get('blood_oxygen_spo2'):
                health_context += f"- Blood Oxygen: {biometrics.get('blood_oxygen_spo2')}%\n"
        
        system_message = f"""You are a caring, knowledgeable AI Health Coach named for the TokHealth app - a "Keep People Alive" (KPA) system.

Your role:
- Provide personalized health guidance based on user data
- Be encouraging, supportive, and motivational
- Focus on practical, actionable advice
- Always recommend consulting healthcare providers for medical concerns
- Keep responses concise but warm (2-4 sentences typically)

{health_context}

Important: You are NOT a doctor. Always encourage professional medical consultation for serious health concerns."""

        # Create or get chat instance
        if session_id not in chat_sessions:
            chat = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", "gpt-5.2")
            chat_sessions[session_id] = chat
        else:
            chat = chat_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=chat_message.message)
        response = await chat.send_message(user_message)
        
        # Store message in database
        await db.health_coach_messages.insert_one({
            "user_id": user_id,
            "session_id": session_id,
            "user_message": chat_message.message,
            "coach_response": response,
            "created_at": datetime.now(timezone.utc)
        })
        
        return success_response(
            data={
                "response": response,
                "session_id": chat_message.session_id
            },
            message="Coach responded"
        )
        
    except ImportError as e:
        logger.error(f"Import error: {e}")
        raise HTTPException(status_code=500, detail="AI integration not available")
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/messages", response_model=dict)
async def get_coach_messages(
    days: int = 7,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get recent coaching messages"""
    try:
        user_id = await get_user_id(authorization, db)
        messages = await db.health_coach_messages.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(days).to_list(days)
        
        # Serialize datetime objects to ISO strings
        for msg in messages:
            if "created_at" in msg and hasattr(msg["created_at"], "isoformat"):
                msg["created_at"] = msg["created_at"].isoformat()
        
        return success_response(
            data=messages,
            message=f"Retrieved {len(messages)} coaching messages"
        )
    except Exception as e:
        logger.error(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/back-to-green", response_model=dict)
async def get_back_to_green_interventions(
    current_zone: str = "yellow",
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get interventions to help user get back to green zone"""
    try:
        user_id = await get_user_id(authorization, db)

        loop_status = await db.loop_daily.find_one(
            {"user_id": user_id},
            {"_id": 0},
            sort=[("date", -1)]
        )
        
        # Define interventions by zone
        interventions = {
            "immediate": [],
            "short_term": [],
            "mindfulness": [],
            "physical": []
        }
        
        if current_zone in ["yellow", "red"]:
            # Breathing exercises
            interventions["immediate"].append({
                "id": "breathing_478",
                "name": "4-7-8 Breathing",
                "description": "Breathe in for 4 seconds, hold for 7, exhale for 8. Repeat 4 times.",
                "duration_min": 3,
                "icon": "wind",
                "type": "breathing"
            })
            
            # Hydration
            interventions["immediate"].append({
                "id": "hydration",
                "name": "Hydration Boost",
                "description": "Drink a full glass of water right now. Dehydration affects mood and energy.",
                "duration_min": 1,
                "icon": "droplet",
                "type": "hydration"
            })
            
            # Gratitude
            interventions["mindfulness"].append({
                "id": "gratitude",
                "name": "Gratitude Moment",
                "description": "Name 3 things you're grateful for today. It shifts your mental state.",
                "duration_min": 2,
                "icon": "heart",
                "type": "gratitude"
            })
            
            # Quick walk
            interventions["physical"].append({
                "id": "quick_walk",
                "name": "5-Minute Walk",
                "description": "Step outside for a quick walk. Movement releases endorphins.",
                "duration_min": 5,
                "icon": "footprints",
                "type": "movement"
            })
            
            # Stretching
            interventions["physical"].append({
                "id": "stretch",
                "name": "Quick Stretch",
                "description": "Stand up and stretch your arms, neck, and back. Release tension.",
                "duration_min": 2,
                "icon": "activity",
                "type": "movement"
            })
            
            # Grounding
            interventions["mindfulness"].append({
                "id": "grounding_54321",
                "name": "5-4-3-2-1 Grounding",
                "description": "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.",
                "duration_min": 3,
                "icon": "eye",
                "type": "grounding"
            })
        
        if current_zone == "red":
            # More intense interventions for red zone
            interventions["immediate"].insert(0, {
                "id": "pause",
                "name": "STOP & Pause",
                "description": "Stop what you're doing. Take 3 deep breaths. You've got this.",
                "duration_min": 1,
                "icon": "pause",
                "type": "pause",
                "priority": "high"
            })
            
            interventions["short_term"].append({
                "id": "eat_something",
                "name": "Fuel Your Body",
                "description": "When did you last eat? Low blood sugar affects everything. Have a healthy snack.",
                "duration_min": 5,
                "icon": "utensils",
                "type": "nutrition"
            })
            
            interventions["mindfulness"].append({
                "id": "talk_someone",
                "name": "Reach Out",
                "description": "Call or text someone you trust. Connection heals.",
                "duration_min": 5,
                "icon": "phone",
                "type": "social"
            })
            
            interventions["physical"].append({
                "id": "cold_water",
                "name": "Cold Water Reset",
                "description": "Splash cold water on your face. It activates your diving reflex and calms you.",
                "duration_min": 1,
                "icon": "droplets",
                "type": "reset"
            })
        
        # Add motivational message based on zone
        if current_zone == "yellow":
            message = "You're in the yellow zone. Let's get you back to green with a few quick actions."
        elif current_zone == "red":
            message = "I see you're in the red zone. That's okay - let's work through this together. Start with one small step."
        else:
            message = "You're doing great! Here are some wellness activities to maintain your green zone."
        
        return success_response(
            data={
                "current_zone": current_zone,
                "message": message,
                "interventions": interventions,
                "total_interventions": sum(len(v) for v in interventions.values())
            },
            message="Back to Green interventions retrieved"
        )
    except Exception as e:
        logger.error(f"Error getting interventions: {e}")
        raise HTTPException(status_code=500, detail=str(e))