from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models.automation import Automation, AutomationStatus
from app.models import db
from datetime import datetime, timedelta
import logging

automations_bp = Blueprint('automations', __name__)
logger = logging.getLogger(__name__)

@automations_bp.route('/', methods=['GET'])
@login_required
def list_automations():
    """Get user's automations"""
    automations = Automation.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'automations': [automation.to_dict() for automation in automations]
    }), 200

@automations_bp.route('/', methods=['POST'])
@login_required
def create_automation():
    """Create new automation"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'platforms', 'content_settings', 'posting_schedule']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Create automation
        automation = Automation(
            user_id=current_user.id,
            name=data['name'],
            description=data.get('description', ''),
            platforms=data['platforms'],
            content_settings=data['content_settings'],
            posting_schedule=data['posting_schedule'],
            ai_settings=data.get('ai_settings', {}),
            hashtag_settings=data.get('hashtag_settings', {}),
            status=AutomationStatus.ACTIVE,
            next_run=datetime.utcnow() + timedelta(minutes=5)  # Start soon
        )

        db.session.add(automation)
        db.session.commit()

        return jsonify({
            'message': 'Automation created successfully',
            'automation': automation.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Automation creation error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Automation creation failed'}), 500

@automations_bp.route('/<int:automation_id>', methods=['GET'])
@login_required
def get_automation(automation_id):
    """Get specific automation"""
    automation = Automation.query.filter_by(
        id=automation_id, 
        user_id=current_user.id
    ).first()

    if not automation:
        return jsonify({'error': 'Automation not found'}), 404

    return jsonify({'automation': automation.to_dict()}), 200

@automations_bp.route('/<int:automation_id>', methods=['PUT'])
@login_required
def update_automation(automation_id):
    """Update automation"""
    try:
        automation = Automation.query.filter_by(
            id=automation_id, 
            user_id=current_user.id
        ).first()

        if not automation:
            return jsonify({'error': 'Automation not found'}), 404

        data = request.get_json()

        # Update allowed fields
        updatable_fields = ['name', 'description', 'platforms', 'content_settings', 
                          'posting_schedule', 'ai_settings', 'hashtag_settings', 'status']

        for field in updatable_fields:
            if field in data:
                setattr(automation, field, data[field])

        automation.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Automation updated successfully',
            'automation': automation.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Automation update error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Automation update failed'}), 500

@automations_bp.route('/<int:automation_id>', methods=['DELETE'])
@login_required
def delete_automation(automation_id):
    """Delete automation"""
    try:
        automation = Automation.query.filter_by(
            id=automation_id, 
            user_id=current_user.id
        ).first()

        if not automation:
            return jsonify({'error': 'Automation not found'}), 404

        db.session.delete(automation)
        db.session.commit()

        return jsonify({'message': 'Automation deleted successfully'}), 200

    except Exception as e:
        logger.error(f"Automation deletion error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Automation deletion failed'}), 500

@automations_bp.route('/<int:automation_id>/toggle', methods=['POST'])
@login_required
def toggle_automation(automation_id):
    """Toggle automation status (active/paused)"""
    try:
        automation = Automation.query.filter_by(
            id=automation_id, 
            user_id=current_user.id
        ).first()

        if not automation:
            return jsonify({'error': 'Automation not found'}), 404

        # Toggle between ACTIVE and PAUSED
        if automation.status == AutomationStatus.ACTIVE:
            automation.status = AutomationStatus.PAUSED
        else:
            automation.status = AutomationStatus.ACTIVE

        automation.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Automation status updated',
            'automation': automation.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Automation toggle error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Automation toggle failed'}), 500