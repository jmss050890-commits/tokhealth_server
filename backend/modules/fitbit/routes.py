from fastapi import APIRouter, HTTPException, Depends, Header, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging
import httpx
import base64
import os

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter()

# Fitbit OAuth2 configuration
FITBIT_CLIENT_ID = os.getenv("FITBIT_CLIENT_ID")
FITBIT_CLIENT_SECRET = os.getenv("FITBIT_CLIENT_SECRET")
FITBIT_REDIRECT_URI = os.getenv("FITBIT_REDIRECT_URI")
FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize"
FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token"
FITBIT_API_URL = "https://api.fitbit.com"

# Scopes for data access
FITBIT_SCOPES = "activity heartrate sleep profile"

@router.get("/auth/url", response_model=dict)
async def get_fitbit_auth_url(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get Fitbit OAuth2 authorization URL"""
    try:
        # Get user_id to store in state for callback
        if authorization:
            user_id = await get_current_user_id(authorization, db)
        else:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Build authorization URL
        auth_url = (
            f"{FITBIT_AUTH_URL}?"
            f"response_type=code&"
            f"client_id={FITBIT_CLIENT_ID}&"
            f"redirect_uri={FITBIT_REDIRECT_URI}&"
            f"scope={FITBIT_SCOPES.replace(' ', '%20')}&"
            f"state={user_id}&"
            f"expires_in=604800"
        )
        
        return success_response(
            data={"authorization_url": auth_url},
            message="Redirect user to this URL to authorize Fitbit"
        )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating Fitbit auth URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/callback")
async def fitbit_callback(
    code: str = None,
    state: str = None,
    error: str = None,
    db=Depends(get_database)
):
    """Handle Fitbit OAuth2 callback"""
    try:
        if error:
            logger.error(f"Fitbit auth error: {error}")
            return RedirectResponse(
                url=f"https://tokhealth-dev.preview.emergentagent.com?fitbit_error={error}",
                status_code=302
            )
        
        if not code:
            raise HTTPException(status_code=400, detail="No authorization code provided")
        
        user_id = state  # User ID passed in state parameter
        
        # Exchange code for tokens
        basic_auth = base64.b64encode(
            f"{FITBIT_CLIENT_ID}:{FITBIT_CLIENT_SECRET}".encode()
        ).decode()
        
        headers = {
            "Authorization": f"Basic {basic_auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "client_id": FITBIT_CLIENT_ID,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": FITBIT_REDIRECT_URI
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(FITBIT_TOKEN_URL, headers=headers, data=data)
            
            if response.status_code != 200:
                logger.error(f"Fitbit token exchange failed: {response.text}")
                return RedirectResponse(
                    url="https://tokhealth-dev.preview.emergentagent.com?fitbit_error=token_exchange_failed",
                    status_code=302
                )
            
            tokens = response.json()
            
            # Store tokens in database
            fitbit_data = {
                "user_id": user_id,
                "fitbit_user_id": tokens.get("user_id"),
                "access_token": tokens.get("access_token"),
                "refresh_token": tokens.get("refresh_token"),
                "expires_at": (datetime.now(timezone.utc) + timedelta(seconds=tokens.get("expires_in", 28800))).isoformat(),
                "scope": tokens.get("scope"),
                "connected_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.fitbit_connections.update_one(
                {"user_id": user_id},
                {"$set": fitbit_data},
                upsert=True
            )
            
            logger.info(f"Fitbit connected for user {user_id}")
            
            # Redirect back to app with success
            return RedirectResponse(
                url="https://tokhealth-dev.preview.emergentagent.com?fitbit_connected=true",
                status_code=302
            )
            
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fitbit callback error: {e}")
        return RedirectResponse(
            url=f"https://tokhealth-dev.preview.emergentagent.com?fitbit_error={str(e)}",
            status_code=302
        )

async def refresh_fitbit_token(db, user_id: str) -> str:
    """Refresh Fitbit access token if expired"""
    connection = await db.fitbit_connections.find_one({"user_id": user_id})
    
    if not connection:
        raise HTTPException(status_code=404, detail="Fitbit not connected")
    
    # Check if token is expired
    expires_at = datetime.fromisoformat(connection["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) < expires_at - timedelta(minutes=5):
        return connection["access_token"]
    
    # Refresh the token
    basic_auth = base64.b64encode(
        f"{FITBIT_CLIENT_ID}:{FITBIT_CLIENT_SECRET}".encode()
    ).decode()
    
    headers = {
        "Authorization": f"Basic {basic_auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    data = {
        "grant_type": "refresh_token",
        "refresh_token": connection["refresh_token"]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(FITBIT_TOKEN_URL, headers=headers, data=data)
        
        if response.status_code != 200:
            logger.error(f"Fitbit token refresh failed: {response.text}")
            raise HTTPException(status_code=401, detail="Failed to refresh Fitbit token")
        
        tokens = response.json()
        
        # Update stored tokens
        await db.fitbit_connections.update_one(
            {"user_id": user_id},
            {"$set": {
                "access_token": tokens.get("access_token"),
                "refresh_token": tokens.get("refresh_token", connection["refresh_token"]),
                "expires_at": (datetime.now(timezone.utc) + timedelta(seconds=tokens.get("expires_in", 28800))).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return tokens.get("access_token")

@router.get("/status", response_model=dict)
async def get_fitbit_status(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Check if Fitbit is connected for current user"""
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        user_id = await get_current_user_id(authorization, db)
        
        connection = await db.fitbit_connections.find_one(
            {"user_id": user_id},
            {"_id": 0, "access_token": 0, "refresh_token": 0}
        )
        
        if connection:
            return success_response(
                data={
                    "connected": True,
                    "fitbit_user_id": connection.get("fitbit_user_id"),
                    "connected_at": connection.get("connected_at"),
                    "scope": connection.get("scope")
                },
                message="Fitbit is connected"
            )
        else:
            return success_response(
                data={"connected": False},
                message="Fitbit is not connected"
            )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking Fitbit status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/disconnect", response_model=dict)
async def disconnect_fitbit(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Disconnect Fitbit from user account"""
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        user_id = await get_current_user_id(authorization, db)
        
        result = await db.fitbit_connections.delete_one({"user_id": user_id})
        
        if result.deleted_count > 0:
            return success_response(
                data=None,
                message="Fitbit disconnected successfully"
            )
        else:
            return success_response(
                data=None,
                message="Fitbit was not connected"
            )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disconnecting Fitbit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/steps/today", response_model=dict)
async def get_fitbit_steps_today(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get today's step count from Fitbit"""
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        user_id = await get_current_user_id(authorization, db)
        access_token = await refresh_fitbit_token(db, user_id)
        
        today = datetime.now().strftime("%Y-%m-%d")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FITBIT_API_URL}/1/user/-/activities/steps/date/{today}/1d.json",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code != 200:
                logger.error(f"Fitbit API error: {response.text}")
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch steps")
            
            data = response.json()
            steps = 0
            
            if "activities-steps" in data and len(data["activities-steps"]) > 0:
                steps = int(data["activities-steps"][0].get("value", 0))
            
            # Also save to health_metrics
            await db.health_metrics.update_one(
                {"user_id": user_id, "date": today},
                {"$set": {
                    "steps": steps,
                    "steps_source": "fitbit",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            
            return success_response(
                data={"date": today, "steps": steps, "source": "fitbit"},
                message="Steps retrieved from Fitbit"
            )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Fitbit steps: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/heart-rate/today", response_model=dict)
async def get_fitbit_heart_rate_today(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get today's heart rate data from Fitbit"""
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        user_id = await get_current_user_id(authorization, db)
        access_token = await refresh_fitbit_token(db, user_id)
        
        today = datetime.now().strftime("%Y-%m-%d")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FITBIT_API_URL}/1/user/-/activities/heart/date/{today}/1d.json",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code != 200:
                logger.error(f"Fitbit API error: {response.text}")
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch heart rate")
            
            data = response.json()
            resting_hr = None
            
            if "activities-heart" in data and len(data["activities-heart"]) > 0:
                heart_data = data["activities-heart"][0].get("value", {})
                resting_hr = heart_data.get("restingHeartRate")
            
            # Save to health_metrics if we have data
            if resting_hr:
                await db.health_metrics.update_one(
                    {"user_id": user_id, "date": today},
                    {"$set": {
                        "heart_rate_bpm": resting_hr,
                        "heart_rate_source": "fitbit",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }},
                    upsert=True
                )
            
            return success_response(
                data={
                    "date": today,
                    "resting_heart_rate": resting_hr,
                    "source": "fitbit"
                },
                message="Heart rate retrieved from Fitbit"
            )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Fitbit heart rate: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync", response_model=dict)
async def sync_fitbit_data(
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Sync all available Fitbit data for today"""
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        user_id = await get_current_user_id(authorization, db)
        access_token = await refresh_fitbit_token(db, user_id)
        
        today = datetime.now().strftime("%Y-%m-%d")
        synced_data = {"date": today}
        
        async with httpx.AsyncClient() as client:
            # Fetch steps
            try:
                steps_response = await client.get(
                    f"{FITBIT_API_URL}/1/user/-/activities/steps/date/{today}/1d.json",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if steps_response.status_code == 200:
                    steps_data = steps_response.json()
                    if "activities-steps" in steps_data and len(steps_data["activities-steps"]) > 0:
                        synced_data["steps"] = int(steps_data["activities-steps"][0].get("value", 0))
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error syncing steps: {e}")
            
            # Fetch heart rate
            try:
                hr_response = await client.get(
                    f"{FITBIT_API_URL}/1/user/-/activities/heart/date/{today}/1d.json",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if hr_response.status_code == 200:
                    hr_data = hr_response.json()
                    if "activities-heart" in hr_data and len(hr_data["activities-heart"]) > 0:
                        heart_value = hr_data["activities-heart"][0].get("value", {})
                        synced_data["resting_heart_rate"] = heart_value.get("restingHeartRate")
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error syncing heart rate: {e}")
            
            # Fetch sleep
            try:
                sleep_response = await client.get(
                    f"{FITBIT_API_URL}/1.2/user/-/sleep/date/{today}.json",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if sleep_response.status_code == 200:
                    sleep_data = sleep_response.json()
                    if "summary" in sleep_data:
                        total_minutes = sleep_data["summary"].get("totalMinutesAsleep", 0)
                        synced_data["sleep_hours"] = round(total_minutes / 60, 1)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error syncing sleep: {e}")
        
        # Save to health_metrics
        update_data = {
            "user_id": user_id,
            "date": today,
            "fitbit_synced_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if "steps" in synced_data:
            update_data["steps"] = synced_data["steps"]
            update_data["steps_source"] = "fitbit"
        if "resting_heart_rate" in synced_data and synced_data["resting_heart_rate"]:
            update_data["heart_rate_bpm"] = synced_data["resting_heart_rate"]
            update_data["heart_rate_source"] = "fitbit"
        if "sleep_hours" in synced_data:
            update_data["sleep_hours"] = synced_data["sleep_hours"]
            update_data["sleep_source"] = "fitbit"
        
        await db.health_metrics.update_one(
            {"user_id": user_id, "date": today},
            {"$set": update_data},
            upsert=True
        )
        
        logger.info(f"Fitbit data synced for user {user_id}")
        
        return success_response(
            data=synced_data,
            message="Fitbit data synced successfully"
        )
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error syncing Fitbit data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
