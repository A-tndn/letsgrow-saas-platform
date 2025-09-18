from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from app.models.user import User, SubscriptionTier
from app.models import db
from app.utils.validators import validate_email, validate_password
from app.utils.helpers import generate_verification_token, generate_jwt_token, verify_jwt_token
import logging
import jwt

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

def get_user_from_token():
    """Helper function to get user from JWT token"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        payload = verify_jwt_token(token)
        if not payload:
            return None

        user = User.query.get(payload.get('user_id'))
        return user
    except Exception as e:
        logger.error(f"Error getting user from token: {str(e)}")
        return None

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()

        # Validate input
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()

        # Validation
        if not validate_email(email):
            return jsonify({'success': False, 'error': 'Invalid email format'}), 400

        if not validate_password(password):
            return jsonify({'success': False, 'error': 'Password must be at least 8 characters long'}), 400

        if not first_name or not last_name:
            return jsonify({'success': False, 'error': 'First name and last name are required'}), 400

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'error': 'Email already registered'}), 409

        # Create new user
        user = User()
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.subscription_tier = SubscriptionTier.FREE
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Generate JWT token for the new user
        token = generate_jwt_token(user.id)

        logger.info(f"New user registered: {email}")

        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'subscription_tier': user.subscription_tier.value
            }
        }), 201

    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400

        # Find user
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401

        if not user.active:
            return jsonify({'success': False, 'error': 'Account is deactivated'}), 401

        # Generate JWT token
        token = generate_jwt_token(user.id)

        logger.info(f"User logged in: {email}")

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'subscription_tier': user.subscription_tier.value,
                'is_admin': user.is_admin
            }
        }), 200

    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        return jsonify({'success': False, 'error': 'Login failed'}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user information from JWT token"""
    try:
        user = get_user_from_token()

        if not user:
            return jsonify({'success': False, 'error': 'Invalid or expired token'}), 401

        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'subscription_tier': user.subscription_tier.value,
                'is_admin': user.is_admin,
                'email_verified': user.email_verified,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
        }), 200

    except Exception as e:
        logger.error(f"Get current user failed: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get user information'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    try:
        # For JWT, we don't need to do anything server-side
        # The client will remove the token
        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        }), 200

    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
        return jsonify({'success': False, 'error': 'Logout failed'}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh JWT token"""
    try:
        user = get_user_from_token()

        if not user:
            return jsonify({'success': False, 'error': 'Invalid or expired token'}), 401

        # Generate new token
        new_token = generate_jwt_token(user.id)

        return jsonify({
            'success': True,
            'token': new_token,
            'message': 'Token refreshed successfully'
        }), 200

    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        return jsonify({'success': False, 'error': 'Token refresh failed'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()

        if not validate_email(email):
            return jsonify({'success': False, 'error': 'Invalid email format'}), 400

        user = User.query.filter_by(email=email).first()

        # Always return success for security reasons
        return jsonify({
            'success': True,
            'message': 'If an account with this email exists, a password reset link has been sent.'
        }), 200

    except Exception as e:
        logger.error(f"Forgot password failed: {str(e)}")
        return jsonify({'success': False, 'error': 'Request failed'}), 500
