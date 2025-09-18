import secrets
import string
from datetime import datetime, timedelta
from typing import Optional
import jwt
from flask import current_app

def generate_verification_token() -> str:
    """Generate a secure verification token"""
    return secrets.token_urlsafe(32)

def generate_api_key(length: int = 32) -> str:
    """Generate a secure API key"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_jwt_token(user_id: int, expires_in: Optional[timedelta] = None) -> str:
    """Generate a JWT token for user"""
    if expires_in is None:
        expires_in = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', timedelta(days=7))
    
    # Ensure expires_in is always a timedelta
    if not isinstance(expires_in, timedelta):
        expires_in = timedelta(days=7)

    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + expires_in,
        'iat': datetime.utcnow()
    }

    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_jwt_token(token: str) -> Optional[dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def format_datetime(dt: datetime) -> str:
    """Format datetime for JSON serialization"""
    return dt.strftime('%Y-%m-%d %H:%M:%S')

def parse_datetime(dt_str: str) -> datetime:
    """Parse datetime string"""
    return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')