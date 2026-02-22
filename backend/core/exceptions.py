from fastapi import HTTPException, status

class TokHealthException(Exception):
    """Base exception for TokHealth"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ValidationError(TokHealthException):
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)

class NotFoundError(TokHealthException):
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class UnauthorizedError(TokHealthException):
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class DatabaseError(TokHealthException):
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR)