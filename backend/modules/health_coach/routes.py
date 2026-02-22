from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import logging
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

from core.database import get_database
from utils.response import success_response

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter()

TEMP_USER_ID = "demo-user-001"

class ChatMessage(BaseModel):
    message: str
    session_id: str = "default"

class CoachResponse(BaseModel):
    response: str
    zone: str = "green"

# Store chat sessions in memory (in production, use Redis/DB)
chat_sessions = {}

@router.get("/status", response_model=dict)
async def get_coach_status(db=Depends(get_database)):
    """Get current health status with zones"""
    try:
        # Get today's loop status
        loop_status = await db.loop_daily.find_one(
            {"user_id": TEMP_USER_ID},
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
async def chat_with_coach(chat_message: ChatMessage, db=Depends(get_database)):
    """Chat with AI Health Coach using GPT-5.2"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        session_id = f"{TEMP_USER_ID}_{chat_message.session_id}"
        
        # Get user's health context
        loop_status = await db.loop_daily.find_one(
            {"user_id": TEMP_USER_ID},
            {"_id": 0},
            sort=[("date", -1)]
        )
        
        biometrics = await db.biometrics_daily.find_one(
            {"user_id": TEMP_USER_ID},
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
            "user_id": TEMP_USER_ID,
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
    db=Depends(get_database)
):
    """Get recent coaching messages"""
    try:
        messages = await db.health_coach_messages.find(
            {"user_id": TEMP_USER_ID},
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