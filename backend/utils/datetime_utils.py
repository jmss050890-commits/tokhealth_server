from datetime import datetime, timezone, date
from typing import Union

def now_utc() -> datetime:
    """Get current UTC datetime"""
    return datetime.now(timezone.utc)

def today_date() -> date:
    """Get today's date"""
    return date.today()

def parse_datetime(dt_string: str) -> datetime:
    """Parse ISO format datetime string"""
    if isinstance(dt_string, datetime):
        return dt_string
    return datetime.fromisoformat(dt_string.replace('Z', '+00:00'))

def to_iso_string(dt: Union[datetime, date]) -> str:
    """Convert datetime/date to ISO string"""
    if isinstance(dt, datetime):
        return dt.isoformat()
    elif isinstance(dt, date):
        return dt.isoformat()
    return str(dt)