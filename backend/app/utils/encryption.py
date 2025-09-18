from cryptography.fernet import Fernet
import os
import base64
from flask import current_app

def get_encryption_key():
    """Get or generate encryption key"""
    key = os.environ.get('ENCRYPTION_KEY')
    if not key:
        key = Fernet.generate_key()
        # In production, store this key securely
    if isinstance(key, str):
        key = key.encode()
    return key

def encrypt_token(token: str) -> str:
    """Encrypt sensitive token"""
    f = Fernet(get_encryption_key())
    encrypted_token = f.encrypt(token.encode())
    return base64.urlsafe_b64encode(encrypted_token).decode()

def decrypt_token(encrypted_token: str) -> str:
    """Decrypt sensitive token"""
    f = Fernet(get_encryption_key())
    encrypted_data = base64.urlsafe_b64decode(encrypted_token.encode())
    decrypted_token = f.decrypt(encrypted_data)
    return decrypted_token.decode()
