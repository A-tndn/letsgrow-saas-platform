from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from app.models import db, User
from app.models.social_accounts import SocialAccount, SocialPost, SocialPlatform, SocialAccountStatus, PLATFORM_CONFIGS
from app.api.auth import get_user_from_token
import logging
import os
from datetime import datetime

social_bp = Blueprint('social', __name__)
logger = logging.getLogger(__name__)

@social_bp.route('/platforms', methods=['GET'])
def get_available_platforms():
    """Get list of all supported social media platforms"""
    try:
        platforms = []
        for platform, config in PLATFORM_CONFIGS.items():
            platforms.append({
                'id': platform.value,
                'name': config['name'],
                'color': config['color'],
                'icon': config['icon'],
                'max_text_length': config['max_text_length'],
                'supports_media': config['supports_media'],
                'max_media_count': config['max_media_count']
            })

        return jsonify({
            'success': True,
            'platforms': platforms
        }), 200

    except Exception as e:
        logger.error(f"Error fetching available platforms: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch available platforms'
        }), 500

@social_bp.route('/accounts', methods=['GET'])
def get_user_social_accounts():
    """Get all social accounts for the current user"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        accounts = SocialAccount.query.filter_by(user_id=user.id).all()

        return jsonify({
            'success': True,
            'accounts': [account.to_dict() for account in accounts]
        }), 200

    except Exception as e:
        logger.error(f"Error fetching social accounts: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch social accounts'
        }), 500

@social_bp.route('/accounts', methods=['POST'])
def create_social_account():
    """Create a new social account (demo mode - without real OAuth)"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        platform = data.get('platform')
        username = data.get('username', '')

        if not platform or not username:
            return jsonify({
                'success': False,
                'error': 'Platform and username are required'
            }), 400

        # Validate platform
        try:
            platform_enum = SocialPlatform(platform)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid platform'
            }), 400

        # Check if account already exists
        existing_account = SocialAccount.query.filter_by(
            user_id=user.id,
            platform=platform_enum,
            username=username
        ).first()

        if existing_account:
            return jsonify({
                'success': False,
                'error': 'Account already connected'
            }), 409

        # Create demo social account (without real OAuth)
        import random
        social_account = SocialAccount(
            user_id=user.id,
            platform=platform_enum,
            platform_user_id=f"demo_{random.randint(100000, 999999)}",
            username=username,
            display_name=data.get('display_name', username),
            status=SocialAccountStatus.ACTIVE,
            followers_count=random.randint(100, 10000),
            following_count=random.randint(50, 1000),
            posts_count=random.randint(10, 500),
            # Demo token (not real)
            access_token='demo_token_' + str(random.randint(100000, 999999))
        )

        db.session.add(social_account)
        db.session.commit()

        logger.info(f"Demo social account created: {platform} - @{username}")

        return jsonify({
            'success': True,
            'message': 'Social account connected successfully',
            'account': social_account.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Error creating social account: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to connect social account'
        }), 500

@social_bp.route('/accounts/<int:account_id>', methods=['DELETE'])
def disconnect_social_account(account_id):
    """Disconnect a social media account"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        account = SocialAccount.query.filter_by(
            id=account_id,
            user_id=user.id
        ).first()

        if not account:
            return jsonify({
                'success': False,
                'error': 'Account not found'
            }), 404

        # Delete the account and all associated posts
        db.session.delete(account)
        db.session.commit()

        logger.info(f"Social account disconnected: {account.platform.value} - @{account.username}")

        return jsonify({
            'success': True,
            'message': 'Account disconnected successfully'
        }), 200

    except Exception as e:
        logger.error(f"Error disconnecting social account: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to disconnect account'
        }), 500

@social_bp.route('/accounts/<int:account_id>/sync', methods=['POST'])
def sync_social_account(account_id):
    """Sync social account data (followers, posts count, etc.)"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        account = SocialAccount.query.filter_by(
            id=account_id,
            user_id=user.id
        ).first()

        if not account:
            return jsonify({
                'success': False,
                'error': 'Account not found'
            }), 404

        # Demo sync - simulate updated metrics
        import random
        account.followers_count += random.randint(-10, 50)
        account.following_count += random.randint(-5, 20)
        account.posts_count += random.randint(0, 5)
        account.last_sync_at = datetime.utcnow()

        db.session.commit()

        logger.info(f"Social account synced: {account.platform.value} - @{account.username}")

        return jsonify({
            'success': True,
            'message': 'Account synced successfully',
            'account': account.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error syncing social account: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to sync account'
        }), 500

@social_bp.route('/posts', methods=['GET'])
def get_user_posts():
    """Get all social media posts for the current user"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        # Get query parameters
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        status = request.args.get('status')  # draft, scheduled, posted, failed

        query = SocialPost.query.filter_by(user_id=user.id)

        if status:
            query = query.filter_by(status=status)

        posts = query.order_by(SocialPost.created_at.desc()).offset(offset).limit(limit).all()
        total_count = query.count()

        return jsonify({
            'success': True,
            'posts': [post.to_dict() for post in posts],
            'total_count': total_count,
            'limit': limit,
            'offset': offset
        }), 200

    except Exception as e:
        logger.error(f"Error fetching posts: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch posts'
        }), 500

@social_bp.route('/posts', methods=['POST'])
def create_social_post():
    """Create a new social media post"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        social_account_id = data.get('social_account_id')
        text_content = data.get('text_content', '')
        scheduled_at = data.get('scheduled_at')

        if not social_account_id or not text_content:
            return jsonify({
                'success': False,
                'error': 'Social account and text content are required'
            }), 400

        # Verify social account belongs to user
        social_account = SocialAccount.query.filter_by(
            id=social_account_id,
            user_id=user.id
        ).first()

        if not social_account:
            return jsonify({
                'success': False,
                'error': 'Social account not found'
            }), 404

        # Create the post
        social_post = SocialPost(
            user_id=user.id,
            social_account_id=social_account_id,
            text_content=text_content,
            media_urls=data.get('media_urls'),
            hashtags=data.get('hashtags'),
            mentions=data.get('mentions'),
            status='draft'
        )

        # Handle scheduling
        if scheduled_at:
            try:
                social_post.scheduled_at = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
                social_post.status = 'scheduled'
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid scheduled_at format'
                }), 400

        db.session.add(social_post)
        db.session.commit()

        logger.info(f"Social post created: {social_account.platform.value} - {social_post.status}")

        return jsonify({
            'success': True,
            'message': 'Post created successfully',
            'post': social_post.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Error creating social post: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to create post'
        }), 500

@social_bp.route('/posts/<int:post_id>', methods=['PUT'])
def update_social_post(post_id):
    """Update a social media post"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        post = SocialPost.query.filter_by(
            id=post_id,
            user_id=user.id
        ).first()

        if not post:
            return jsonify({
                'success': False,
                'error': 'Post not found'
            }), 404

        # Can't edit posted posts
        if post.status == 'posted':
            return jsonify({
                'success': False,
                'error': 'Cannot edit posted content'
            }), 400

        data = request.get_json()

        # Update fields
        if 'text_content' in data:
            post.text_content = data['text_content']
        if 'media_urls' in data:
            post.media_urls = data['media_urls']
        if 'hashtags' in data:
            post.hashtags = data['hashtags']
        if 'mentions' in data:
            post.mentions = data['mentions']
        if 'scheduled_at' in data:
            if data['scheduled_at']:
                post.scheduled_at = datetime.fromisoformat(data['scheduled_at'].replace('Z', '+00:00'))
                post.status = 'scheduled'
            else:
                post.scheduled_at = None
                post.status = 'draft'

        post.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Post updated successfully',
            'post': post.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error updating post: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to update post'
        }), 500

@social_bp.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_social_post(post_id):
    """Delete a social media post"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        post = SocialPost.query.filter_by(
            id=post_id,
            user_id=user.id
        ).first()

        if not post:
            return jsonify({
                'success': False,
                'error': 'Post not found'
            }), 404

        db.session.delete(post)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Post deleted successfully'
        }), 200

    except Exception as e:
        logger.error(f"Error deleting post: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to delete post'
        }), 500

@social_bp.route('/generate-content', methods=['POST'])
def generate_ai_content():
    """Generate AI content for social media posts"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        platform = data.get('platform')
        topic = data.get('topic', '')
        tone = data.get('tone', 'professional')
        length = data.get('length', 'medium')

        if not platform or not topic:
            return jsonify({
                'success': False,
                'error': 'Platform and topic are required'
            }), 400

        # Get platform config
        try:
            platform_enum = SocialPlatform(platform)
            platform_config = PLATFORM_CONFIGS[platform_enum]
        except (ValueError, KeyError):
            return jsonify({
                'success': False,
                'error': 'Invalid platform'
            }), 400

        # Demo AI content generation (without OpenAI for now)
        demo_content = generate_demo_content(topic, tone, platform_config['max_text_length'], length)

        return jsonify({
            'success': True,
            'content': {
                'text': demo_content['text'],
                'hashtags': demo_content['hashtags'],
                'character_count': len(demo_content['text']),
                'platform_limit': platform_config['max_text_length']
            }
        }), 200

    except Exception as e:
        logger.error(f"Error generating AI content: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate content'
        }), 500

def generate_demo_content(topic, tone, max_length, length):
    """Generate demo content without OpenAI API"""

    # Demo content templates based on tone
    templates = {
        'professional': [
            "Exploring the impact of {topic} on modern business practices. Key insights and actionable strategies for growth.",
            "The future of {topic} is here. How organizations can adapt and thrive in this evolving landscape.",
            "Diving deep into {topic} - what industry leaders need to know for sustainable success."
        ],
        'casual': [
            "Just discovered something amazing about {topic}! Here's what I learned and why it matters.",
            "Let's talk about {topic} - it's changing the game in ways you might not expect 🚀",
            "Anyone else fascinated by how {topic} is evolving? Here are my thoughts..."
        ],
        'enthusiastic': [
            "🔥 {topic} is absolutely game-changing! Here's why everyone should pay attention to this trend.",
            "HUGE developments in {topic}! This is going to transform everything we know about the industry 💪",
            "Incredible insights about {topic} that will blow your mind! Don't miss this opportunity."
        ]
    }

    # Random hashtags related to common topics
    hashtag_pool = [
        '#innovation', '#technology', '#business', '#growth', '#success',
        '#entrepreneurship', '#leadership', '#marketing', '#strategy', '#future',
        '#digital', '#transformation', '#insights', '#trending', '#motivation'
    ]

    import random

    # Select template and fill in topic
    template = random.choice(templates.get(tone, templates['professional']))
    content_text = template.format(topic=topic)

    # Adjust length
    if length == 'short' and len(content_text) > max_length // 2:
        content_text = content_text[:max_length // 2] + "..."
    elif length == 'long' and len(content_text) < max_length - 100:
        content_text += " What are your thoughts on this? Share your experiences in the comments!"

    # Ensure it fits platform limits
    if len(content_text) > max_length:
        content_text = content_text[:max_length - 3] + "..."

    # Select random hashtags
    selected_hashtags = random.sample(hashtag_pool, random.randint(3, 6))

    return {
        'text': content_text,
        'hashtags': selected_hashtags
    }
