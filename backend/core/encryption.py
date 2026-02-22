from cryptography.fernet import Fernet
from core.config import settings
import base64
import logging

logger = logging.getLogger(__name__)

class EncryptionService:
    def __init__(self):
        # Ensure key is 32 bytes (base64 encoded)
        key = settings.ENCRYPTION_KEY.encode()
        if len(key) < 32:
            key = key.ljust(32, b'0')
        self.cipher = Fernet(base64.urlsafe_b64encode(key[:32]))
    
    def encrypt(self, text: str) -> str:
        """Encrypt text and return base64 encoded string"""
        try:
            encrypted = self.cipher.encrypt(text.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            raise
    
    def decrypt(self, encrypted_text: str) -> str:
        """Decrypt base64 encoded encrypted text"""
        try:
            decoded = base64.urlsafe_b64decode(encrypted_text.encode())
            decrypted = self.cipher.decrypt(decoded)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            raise

encryption_service = EncryptionService()