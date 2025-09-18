"""
Completely Unrestricted API Endpoints with Full CRUD Access
No Authentication, No Rate Limiting, No Security Measures
For Testing Purposes Only
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.models.content import ContentQueue
from app.models.social_accounts import SocialAccount
from app.models.automation import Automation
from app.models.analytics import AnalyticsDaily
import json

unrestricted_bp = Blueprint('unrestricted', __name__)

# =============================================================================
# HEALTH CHECK ENDPOINTS
# =============================================================================

@unrestricted_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint - no restrictions"""
    return jsonify({
        'status': 'healthy',
        'message': 'LetsGrow Backend API is running',
        'database': 'connected',
        'unrestricted_access': True
    })

@unrestricted_bp.route('/status', methods=['GET'])
def status_check():
    """Detailed status endpoint - no restrictions"""
    try:
        # Test database connection
        db.engine.execute('SELECT 1')
        db_status = 'connected'
    except:
        db_status = 'disconnected'
    
    return jsonify({
        'service': 'letsgrow-backend',
        'status': 'running',
        'database': db_status,
        'features': {
            'authentication': 'disabled',
            'rate_limiting': 'disabled',
            'cors': 'unrestricted',
            'full_crud_access': 'enabled'
        }
    })

# =============================================================================
# UNRESTRICTED USER ENDPOINTS
# =============================================================================

@unrestricted_bp.route('/users', methods=['GET'])
def get_all_users():
    """Get all users - no restrictions"""
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active,
        'created_at': user.created_at.isoformat() if user.created_at else None
    } for user in users])

@unrestricted_bp.route('/users', methods=['POST'])
def create_user():
    """Create user - no restrictions"""
    data = request.get_json()
    user = User(
        email=data.get('email'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name')
    )
    # Set a default password hash since it's required
    user.set_password('defaultpassword')
    db.session.add(user)
    db.session.commit()
    return jsonify({'id': user.id, 'message': 'User created successfully'})

@unrestricted_bp.route('/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_user(user_id):
    """Full CRUD for users - no restrictions"""
    user = User.query.get_or_404(user_id)
    
    if request.method == 'GET':
        return jsonify({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active
        })
    
    elif request.method == 'PUT':
        data = request.get_json()
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        db.session.commit()
        return jsonify({'message': 'User updated successfully'})
    
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'})

# =============================================================================
# UNRESTRICTED CONTENT ENDPOINTS
# =============================================================================

@unrestricted_bp.route('/content', methods=['GET', 'POST'])
def manage_content():
    """Full content access - no restrictions"""
    if request.method == 'GET':
        content = ContentQueue.query.all()
        return jsonify([{
            'id': c.id,
            'content': c.content,
            'user_id': c.user_id,
            'social_account_id': c.social_account_id,
            'scheduled_for': c.scheduled_for.isoformat() if c.scheduled_for else None,
            'status': c.status.value if c.status else None,
            'created_at': c.created_at.isoformat() if c.created_at else None
        } for c in content])
    
    elif request.method == 'POST':
        from datetime import datetime, timedelta
        data = request.get_json()
        content = ContentQueue(
            user_id=data.get('user_id', 1),  # Default to user ID 1
            social_account_id=data.get('social_account_id', 1),  # Default to social account ID 1
            content=data.get('content', 'Default content'),
            scheduled_for=datetime.utcnow() + timedelta(minutes=5)  # Schedule 5 minutes from now
        )
        db.session.add(content)
        db.session.commit()
        return jsonify({'id': content.id, 'message': 'Content created successfully'})

@unrestricted_bp.route('/content/<int:content_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_content(content_id):
    """Full CRUD for content - no restrictions"""
    content = ContentQueue.query.get_or_404(content_id)
    
    if request.method == 'GET':
        return jsonify({
            'id': content.id,
            'content': content.content,
            'user_id': content.user_id,
            'social_account_id': content.social_account_id,
            'scheduled_for': content.scheduled_for.isoformat() if content.scheduled_for else None,
            'status': content.status.value if content.status else None
        })
    
    elif request.method == 'PUT':
        data = request.get_json()
        content.content = data.get('content', content.content)
        content.user_id = data.get('user_id', content.user_id)
        content.social_account_id = data.get('social_account_id', content.social_account_id)
        if data.get('scheduled_for'):
            from datetime import datetime
            content.scheduled_for = datetime.fromisoformat(data.get('scheduled_for'))
        db.session.commit()
        return jsonify({'message': 'Content updated successfully'})
    
    elif request.method == 'DELETE':
        db.session.delete(content)
        db.session.commit()
        return jsonify({'message': 'Content deleted successfully'})

# =============================================================================
# UNRESTRICTED SOCIAL ACCOUNTS ENDPOINTS
# =============================================================================

@unrestricted_bp.route('/social-accounts', methods=['GET', 'POST'])
def manage_social_accounts():
    """Full social accounts access - no restrictions"""
    if request.method == 'GET':
        accounts = SocialAccount.query.all()
        return jsonify([{
            'id': account.id,
            'user_id': account.user_id,
            'platform': account.platform.value if account.platform else None,
            'username': account.username,
            'is_active': account.is_active
        } for account in accounts])
    
    elif request.method == 'POST':
        from app.models.social_accounts import SocialPlatform
        data = request.get_json()
        platform_str = data.get('platform', 'twitter')
        platform = SocialPlatform.TWITTER  # Default to Twitter
        if platform_str == 'instagram':
            platform = SocialPlatform.INSTAGRAM
        elif platform_str == 'linkedin':
            platform = SocialPlatform.LINKEDIN
        elif platform_str == 'reddit':
            platform = SocialPlatform.REDDIT
        
        account = SocialAccount(
            user_id=data.get('user_id', 1),  # Default to user ID 1
            platform=platform,
            username=data.get('username', 'defaultuser'),
            is_active=data.get('is_active', True)
        )
        db.session.add(account)
        db.session.commit()
        return jsonify({'id': account.id, 'message': 'Social account created successfully'})

# =============================================================================
# UNRESTRICTED AUTOMATION ENDPOINTS
# =============================================================================

@unrestricted_bp.route('/automations', methods=['GET', 'POST'])
def manage_automations():
    """Full automation access - no restrictions"""
    if request.method == 'GET':
        automations = Automation.query.all()
        return jsonify([{
            'id': automation.id,
            'name': automation.name,
            'user_id': automation.user_id,
            'platforms': automation.platforms,
            'status': automation.status.value if automation.status else None,
            'content_settings': automation.content_settings
        } for automation in automations])
    
    elif request.method == 'POST':
        data = request.get_json()
        automation = Automation(
            user_id=data.get('user_id', 1),  # Default to user ID 1
            name=data.get('name', 'Default Automation'),
            platforms=data.get('platforms', ['twitter']),
            content_settings=data.get('content_settings', {}),
            posting_schedule=data.get('posting_schedule', {})
        )
        db.session.add(automation)
        db.session.commit()
        return jsonify({'id': automation.id, 'message': 'Automation created successfully'})

# =============================================================================
# UNRESTRICTED ANALYTICS ENDPOINTS
# =============================================================================

@unrestricted_bp.route('/analytics', methods=['GET', 'POST'])
def manage_analytics():
    """Full analytics access - no restrictions"""
    if request.method == 'GET':
        analytics = AnalyticsDaily.query.all()
        return jsonify([{
            'id': analytic.id,
            'user_id': analytic.user_id,
            'social_account_id': analytic.social_account_id,
            'date': analytic.date.isoformat() if analytic.date else None,
            'posts_created': analytic.posts_created,
            'posts_published': analytic.posts_published,
            'total_likes': analytic.total_likes,
            'total_comments': analytic.total_comments,
            'engagement_rate': float(analytic.engagement_rate) if analytic.engagement_rate else 0.0
        } for analytic in analytics])
    
    elif request.method == 'POST':
        from datetime import date
        data = request.get_json()
        analytic = AnalyticsDaily(
            user_id=data.get('user_id', 1),  # Default to user ID 1
            social_account_id=data.get('social_account_id', 1),  # Default to social account ID 1
            date=date.today(),
            posts_created=data.get('posts_created', 0),
            posts_published=data.get('posts_published', 0),
            total_likes=data.get('total_likes', 0),
            total_comments=data.get('total_comments', 0)
        )
        db.session.add(analytic)
        db.session.commit()
        return jsonify({'id': analytic.id, 'message': 'Analytics data created successfully'})

# =============================================================================
# UNRESTRICTED DATABASE OPERATIONS
# =============================================================================

@unrestricted_bp.route('/db/tables', methods=['GET'])
def get_all_tables():
    """Get all database tables - no restrictions"""
    try:
        result = db.engine.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
        tables = [row[0] for row in result]
        return jsonify({'tables': tables})
    except Exception as e:
        return jsonify({'error': str(e)})

@unrestricted_bp.route('/db/query', methods=['POST'])
def execute_raw_query():
    """Execute raw SQL queries - no restrictions (DANGEROUS!)"""
    data = request.get_json()
    query = data.get('query')
    
    try:
        result = db.engine.execute(query)
        if result.returns_rows:
            rows = [dict(row) for row in result]
            return jsonify({'data': rows, 'row_count': len(rows)})
        else:
            return jsonify({'message': 'Query executed successfully', 'affected_rows': result.rowcount})
    except Exception as e:
        return jsonify({'error': str(e)})

# =============================================================================
# TESTING ENDPOINTS
# =============================================================================

@unrestricted_bp.route('/test/create-sample-data', methods=['POST'])
def create_sample_data():
    """Create sample data for testing - no restrictions"""
    try:
        # Create sample user
        user = User(email='test@example.com', first_name='Test', last_name='User')
        user.set_password('testpassword')
        db.session.add(user)
        
        # Create sample content
        from datetime import datetime, timedelta
        content = ContentQueue(
            user_id=user.id,
            social_account_id=1,  # Assume social account with ID 1 exists
            content='This is a sample test post',
            scheduled_for=datetime.utcnow() + timedelta(hours=1)
        )
        db.session.add(content)
        
        # Create sample social account
        from app.models.social_accounts import SocialPlatform
        social = SocialAccount(
            user_id=user.id,
            platform=SocialPlatform.TWITTER,
            username='@testuser',
            is_active=True
        )
        db.session.add(social)
        
        db.session.commit()
        return jsonify({'message': 'Sample data created successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})

@unrestricted_bp.route('/test/clear-all-data', methods=['DELETE'])
def clear_all_data():
    """Clear all data from database - no restrictions (DANGEROUS!)"""
    try:
        # Clear all tables
        AnalyticsDaily.query.delete()
        Automation.query.delete()
        ContentQueue.query.delete()
        SocialAccount.query.delete()
        User.query.delete()
        db.session.commit()
        return jsonify({'message': 'All data cleared successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})

# =============================================================================
# CATCH-ALL ENDPOINT
# =============================================================================

@unrestricted_bp.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    """Catch-all endpoint - responds to any path"""
    return jsonify({
        'message': f'Unrestricted API endpoint accessed: {path}',
        'method': request.method,
        'path': path,
        'data': request.get_json() if request.is_json else None,
        'access': 'unrestricted'
    })