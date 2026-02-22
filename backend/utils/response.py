from fastapi.responses import JSONResponse
from typing import Any, Optional, Dict
from datetime import datetime

def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200
) -> JSONResponse:
    """Standard success response"""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

def error_response(
    message: str,
    status_code: int = 400,
    details: Optional[Dict] = None
) -> JSONResponse:
    """Standard error response"""
    content = {
        "success": False,
        "error": {
            "message": message,
            "code": status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    if details:
        content["error"]["details"] = details
    
    return JSONResponse(
        status_code=status_code,
        content=content
    )