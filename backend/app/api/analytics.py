from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models.analytics import AnalyticsDaily
from app.models.content import ContentQueue, ContentStatus
from app.models.social_accounts import SocialAccount
from app.models import db
from datetime import datetime, timedelta
from sqlalchemy import func
import logging

analytics_bp = Blueprint('analytics', __name__)
logger = logging.getLogger(__name__)

@analytics_bp.route('/overview', methods=['GET'])
@login_required
def get_analytics_overview():
    """Get analytics overview for user"""
    try:
        # Get date range (default: last 30 days)
        days = int(request.args.get('days', 30))
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days)

        # Get daily analytics
        daily_analytics = AnalyticsDaily.query.filter(
            AnalyticsDaily.user_id == current_user.id,
            AnalyticsDaily.date >= start_date,
            AnalyticsDaily.date <= end_date
        ).all()

        # Calculate totals
        total_posts = sum(item.posts_published for item in daily_analytics)
        total_likes = sum(item.total_likes for item in daily_analytics)
        total_comments = sum(item.total_comments for item in daily_analytics)
        total_shares = sum(item.total_shares for item in daily_analytics)
        total_views = sum(item.total_views for item in daily_analytics)

        # Calculate average engagement rate
        avg_engagement = sum(item.engagement_rate for item in daily_analytics) / len(daily_analytics) if daily_analytics else 0

        # Get content statistics
        content_stats = db.session.query(
            ContentQueue.status,
            func.count(ContentQueue.id)
        ).filter(
            ContentQueue.user_id == current_user.id,
            ContentQueue.created_at >= datetime.utcnow() - timedelta(days=days)
        ).group_by(ContentQueue.status).all()

        content_breakdown = {}
        for status, count in content_stats:
            content_breakdown[status.value] = count

        return jsonify({
            'overview': {
                'total_posts': total_posts,
                'total_likes': total_likes,
                'total_comments': total_comments,
                'total_shares': total_shares,
                'total_views': total_views,
                'average_engagement_rate': float(avg_engagement),
                'content_breakdown': content_breakdown
            },
            'daily_data': [item.to_dict() for item in daily_analytics]
        }), 200

    except Exception as e:
        logger.error(f"Analytics overview error: {str(e)}")
        return jsonify({'error': 'Failed to get analytics overview'}), 500

@analytics_bp.route('/platform/<platform>', methods=['GET'])
@login_required
def get_platform_analytics(platform):
    """Get analytics for specific platform"""
    try:
        # Get social accounts for this platform
        social_accounts = SocialAccount.query.filter_by(
            user_id=current_user.id,
            platform=platform,
            is_active=True
        ).all()

        if not social_accounts:
            return jsonify({'error': 'No active accounts found for this platform'}), 404

        account_ids = [account.id for account in social_accounts]

        # Get date range
        days = int(request.args.get('days', 30))
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days)

        # Get analytics for platform
        platform_analytics = AnalyticsDaily.query.filter(
            AnalyticsDaily.user_id == current_user.id,
            AnalyticsDaily.social_account_id.in_(account_ids),
            AnalyticsDaily.date >= start_date,
            AnalyticsDaily.date <= end_date
        ).all()

        # Group by social account
        account_data = {}
        for account in social_accounts:
            account_analytics = [item for item in platform_analytics if item.social_account_id == account.id]
            account_data[account.id] = {
                'account_info': account.to_dict(),
                'analytics': [item.to_dict() for item in account_analytics],
                'totals': {
                    'posts': sum(item.posts_published for item in account_analytics),
                    'likes': sum(item.total_likes for item in account_analytics),
                    'comments': sum(item.total_comments for item in account_analytics),
                    'shares': sum(item.total_shares for item in account_analytics),
                    'views': sum(item.total_views for item in account_analytics)
                }
            }

        return jsonify({
            'platform': platform,
            'accounts': account_data
        }), 200

    except Exception as e:
        logger.error(f"Platform analytics error: {str(e)}")
        return jsonify({'error': 'Failed to get platform analytics'}), 500

@analytics_bp.route('/content/<int:content_id>/metrics', methods=['GET'])
@login_required
def get_content_metrics(content_id):
    """Get metrics for specific content"""
    try:
        content = ContentQueue.query.filter_by(
            id=content_id,
            user_id=current_user.id
        ).first()

        if not content:
            return jsonify({'error': 'Content not found'}), 404

        if content.status != ContentStatus.POSTED:
            return jsonify({'error': 'Content not posted yet'}), 400

        return jsonify({
            'content': content.to_dict(),
            'metrics': content.engagement_data.get('metrics', {}) if content.engagement_data else {}
        }), 200

    except Exception as e:
        logger.error(f"Content metrics error: {str(e)}")
        return jsonify({'error': 'Failed to get content metrics'}), 500

@analytics_bp.route('/export', methods=['GET'])
@login_required
def export_analytics():
    """Export analytics data as CSV"""
    try:
        # Get date range
        days = int(request.args.get('days', 30))
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days)

        # Get all analytics data
        analytics_data = AnalyticsDaily.query.filter(
            AnalyticsDaily.user_id == current_user.id,
            AnalyticsDaily.date >= start_date,
            AnalyticsDaily.date <= end_date
        ).all()

        # Convert to CSV format
        csv_data = """Date,Platform,Posts Created,Posts Published,Posts Failed,Likes,Comments,Shares,Views,Followers Gained,Followers Lost,Engagement Rate
"""

        for item in analytics_data:
            platform = SocialAccount.query.get(item.social_account_id).platform.value
            csv_data += f"""{item.date},{platform},{item.posts_created},{item.posts_published},{item.posts_failed},{item.total_likes},{item.total_comments},{item.total_shares},{item.total_views},{item.followers_gained},{item.followers_lost},{item.engagement_rate}
"""

        return csv_data, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': f'attachment; filename=analytics_{start_date}_to_{end_date}.csv'
        }

    except Exception as e:
        logger.error(f"Analytics export error: {str(e)}")
        return jsonify({'error': 'Failed to export analytics'}), 500