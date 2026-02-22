from typing import Optional
import re

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    """Validate phone number (basic)"""
    # Remove common separators
    clean_phone = re.sub(r'[\s\-\(\)\+]', '', phone)
    return clean_phone.isdigit() and len(clean_phone) >= 10

def validate_zone(zone: str) -> bool:
    """Validate health zone status"""
    return zone in ["green", "yellow", "red"]

def validate_meal_type(meal_type: str) -> bool:
    """Validate meal type"""
    return meal_type in ["breakfast", "lunch", "dinner", "snack"]