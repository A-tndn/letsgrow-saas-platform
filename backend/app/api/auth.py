from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from app.models.user import User, SubscriptionTier
from app.models import db
from app.utils.validators import validate_email, validate_password
from app.utils.helpers import generate_verification_token, generate_jwt_token
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

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
            'message': 'Registration successful',
            'data': {
                'user': user.to_dict(),
                'token': token
            }
        }), 201

    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        remember_me = data.get('remember_me', False)

        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401

        if not user.active:
            return jsonify({'success': False, 'error': 'Account is disabled'}), 403

        # Generate JWT token for login
        token = generate_jwt_token(user.id)
        
        login_user(user, remember=remember_me)

        logger.info(f"User logged in: {email}")

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user.to_dict(),
                'token': token
            }
        }), 200

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'error': 'Login failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """User logout endpoint"""
    try:
        logout_user()
        return jsonify({'success': True, 'message': 'Logout successful'}), 200
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'success': False, 'error': 'Logout failed'}), 500

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current user information"""
    return jsonify({'success': True, 'data': {'user': current_user.to_dict()}}), 200

@auth_bp.route('/refresh', methods=['POST'])
@login_required
def refresh_token():
    """Refresh authentication token"""
    return jsonify({'success': True, 'data': {'user': current_user.to_dict()}}), 200
