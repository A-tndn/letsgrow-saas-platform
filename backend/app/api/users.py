from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models.user import User
from app.models import db
import logging

users_bp = Blueprint('users', __name__)
logger = logging.getLogger(__name__)

@users_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """Get current user profile"""
    return jsonify({'user': current_user.to_dict()}), 200

@users_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    """Update user profile"""
    try:
        data = request.get_json()

        # Update allowed fields
        if 'first_name' in data:
            current_user.first_name = data['first_name'].strip()
        if 'last_name' in data:
            current_user.last_name = data['last_name'].strip()
        if 'avatar_url' in data:
            current_user.avatar_url = data['avatar_url']

        db.session.commit()

        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Profile update failed'}), 500

@users_bp.route('/usage', methods=['GET'])
@login_required
def get_usage_stats():
    """Get user API usage statistics"""
    return jsonify({
        'api_usage_count': current_user.api_usage_count,
        'monthly_api_limit': current_user.monthly_api_limit,
        'usage_percentage': current_user.get_api_usage_percentage(),
        'can_make_api_call': current_user.can_make_api_call()
    }), 200