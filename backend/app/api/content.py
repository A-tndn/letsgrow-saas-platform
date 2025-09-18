from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models.content import ContentQueue, ContentStatus
from app.models.social_accounts import SocialAccount
from app.models import db
from app.services.ai.content_generator import ContentGeneratorService
from app.tasks.content_tasks import publish_scheduled_content
from datetime import datetime, timedelta
import logging

content_bp = Blueprint('content', __name__)
logger = logging.getLogger(__name__)

@content_bp.route('/generate', methods=['POST'])
@login_required
def generate_content():
    """Generate AI content"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['topic', 'platform']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Generate content
        content_generator = ContentGeneratorService(current_user)
        result = content_generator.generate_content(
            topic=data['topic'],
            platform=data['platform'],
            tone=data.get('tone', 'professional'),
            content_type=data.get('content_type', 'post'),
            hashtags=data.get('hashtags', []),
            target_audience=data.get('target_audience'),
            include_call_to_action=data.get('include_call_to_action', True)
        )

        return jsonify(result), 200 if result['success'] else 400

    except Exception as e:
        logger.error(f"Content generation error: {str(e)}")
        return jsonify({'error': 'Content generation failed'}), 500

@content_bp.route('/queue', methods=['GET'])
@login_required
def list_content_queue():
    """Get user's content queue"""
    content_items = ContentQueue.query.filter_by(
        user_id=current_user.id
    ).order_by(ContentQueue.scheduled_for.desc()).all()

    return jsonify({
        'content_queue': [item.to_dict() for item in content_items]
    }), 200

@content_bp.route('/schedule', methods=['POST'])
@login_required
def schedule_content():
    """Schedule content for posting"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['social_account_id', 'content', 'scheduled_for']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Verify social account belongs to user
        social_account = SocialAccount.query.filter_by(
            id=data['social_account_id'],
            user_id=current_user.id,
            is_active=True
        ).first()

        if not social_account:
            return jsonify({'error': 'Social account not found or inactive'}), 404

        # Parse scheduled time
        try:
            scheduled_for = datetime.fromisoformat(data['scheduled_for'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

        # Create content queue item
        content_item = ContentQueue(
            user_id=current_user.id,
            social_account_id=social_account.id,
            content=data['content'],
            media_urls=data.get('media_urls', []),
            hashtags=data.get('hashtags', []),
            platform_specific_data=data.get('platform_specific_data', {}),
            scheduled_for=scheduled_for,
            status=ContentStatus.SCHEDULED
        )

        db.session.add(content_item)
        db.session.commit()

        # Schedule background task
        eta = scheduled_for
        publish_scheduled_content.apply_async(args=[content_item.id], eta=eta)

        return jsonify({
            'message': 'Content scheduled successfully',
            'content': content_item.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Content scheduling error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Content scheduling failed'}), 500

@content_bp.route('/<int:content_id>', methods=['DELETE'])
@login_required
def delete_content(content_id):
    """Delete/cancel scheduled content"""
    try:
        content_item = ContentQueue.query.filter_by(
            id=content_id,
            user_id=current_user.id
        ).first()

        if not content_item:
            return jsonify({'error': 'Content not found'}), 404

        # Only allow deletion of scheduled content
        if content_item.status not in [ContentStatus.SCHEDULED, ContentStatus.FAILED]:
            return jsonify({'error': 'Cannot delete posted content'}), 400

        content_item.status = ContentStatus.CANCELLED
        db.session.commit()

        return jsonify({'message': 'Content cancelled successfully'}), 200

    except Exception as e:
        logger.error(f"Content deletion error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Content deletion failed'}), 500

@content_bp.route('/hashtags/generate', methods=['POST'])
@login_required
def generate_hashtags():
    """Generate hashtags for a topic"""
    try:
        data = request.get_json()

        required_fields = ['topic', 'platform']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        content_generator = ContentGeneratorService(current_user)
        hashtags = content_generator.generate_hashtags(
            topic=data['topic'],
            platform=data['platform'],
            count=data.get('count', 10)
        )

        return jsonify({'hashtags': hashtags}), 200

    except Exception as e:
        logger.error(f"Hashtag generation error: {str(e)}")
        return jsonify({'error': 'Hashtag generation failed'}), 500