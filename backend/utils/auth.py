from fastapi import Header, HTTPException, Depends
from core.database import get_database

async def get_current_user_id(
    authorization: str = Header(None),
    db=Depends(get_database)
) -> str:
    """Extract user_id from authorization token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Handle "Bearer token" format
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    user = await db.users.find_one({"token": token})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user["user_id"]

async def get_current_user(
    authorization: str = Header(None),
    db=Depends(get_database)
) -> dict:
    """Get full user object from authorization token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    user = await db.users.find_one({"token": token}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user
