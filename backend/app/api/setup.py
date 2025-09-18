from flask import Blueprint, jsonify, current_app
from werkzeug.security import generate_password_hash
from datetime import datetime
from app.models import db, User, SubscriptionTier
import logging

setup_bp = Blueprint('setup', __name__)
logger = logging.getLogger(__name__)

@setup_bp.route('/initialize', methods=['POST'])
def initialize_app():
    """
    One-click setup for database and test user.
    This endpoint can be called after app remixing to setup everything needed.
    """
    try:
        # Step 1: Ensure database connection is configured
        database_url = current_app.config.get('SQLALCHEMY_DATABASE_URI')
        if not database_url:
            import os
            database_url = os.environ.get('DATABASE_URL', '').strip()
            if not database_url:
                return jsonify({
                    'success': False,
                    'error': 'Database not configured',
                    'details': 'No PostgreSQL database found. For remixed apps: Go to Tools → Database → Create a database, then click Setup again. The DATABASE_URL will be automatically configured.',
                    'action_required': 'Create PostgreSQL database in Replit Tools'
                }), 500
            
            # Update app configuration with database URL
            current_app.config['SQLALCHEMY_DATABASE_URI'] = database_url
            db.init_app(current_app)
        
        # Step 2: Initialize database tables
        db.create_all()
        logger.info("Database tables created/verified")
        
        # Step 2: Check if test user already exists
        existing_user = User.query.filter_by(email='test@example.com').first()
        
        if existing_user:
            logger.info("Test user already exists")
            return jsonify({
                'success': True,
                'message': 'App already initialized',
                'details': {
                    'database': 'Ready',
                    'test_user': 'Already exists',
                    'user_id': existing_user.id,
                    'email': 'test@example.com'
                }
            }), 200
        
        # Step 3: Create test user if it doesn't exist
        test_user = User()
        test_user.email = 'test@example.com'
        test_user.first_name = 'Test'
        test_user.last_name = 'User'
        test_user.subscription_tier = SubscriptionTier.FREE
        test_user.api_usage_count = 0
        test_user.monthly_api_limit = 1000
        test_user.active = True
        test_user.is_admin = True
        test_user.email_verified = True
        test_user.set_password('test123')
        
        db.session.add(test_user)
        db.session.commit()
        
        logger.info(f"Test user created with ID: {test_user.id}")
        
        return jsonify({
            'success': True,
            'message': 'App initialized successfully!',
            'details': {
                'database': 'Created/Updated',
                'test_user': 'Created',
                'user_id': test_user.id,
                'email': 'test@example.com',
                'password': 'test123',
                'admin': True,
                'instructions': 'You can now login with test@example.com / test123'
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Setup initialization failed: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Initialization failed',
            'details': str(e)
        }), 500

@setup_bp.route('/status', methods=['GET'])
def get_setup_status():
    """Check the current setup status of the application"""
    try:
        from sqlalchemy import text
        
        # Check database connectivity
        try:
            # Rollback any pending transactions first
            db.session.rollback()
            db.session.execute(text('SELECT 1'))
            db.session.commit()
            database_status = 'Connected'
        except Exception as e:
            logger.error(f"Database connectivity check failed: {str(e)}")
            # Try to rollback and reconnect
            try:
                db.session.rollback()
                db.session.execute(text('SELECT 1'))
                db.session.commit()
                database_status = 'Connected'
            except Exception as e2:
                logger.error(f"Database reconnection failed: {str(e2)}")
                database_status = 'Not Connected'
        
        # Check if test user exists
        test_user = User.query.filter_by(email='test@example.com').first()
        user_status = 'Exists' if test_user else 'Not Found'
        
        # Count total users
        total_users = User.query.count()
        
        return jsonify({
            'success': True,
            'status': {
                'database': database_status,
                'test_user': user_status,
                'total_users': total_users,
                'ready_for_testing': database_status == 'Connected' and user_status == 'Exists'
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Status check failed',
            'details': str(e)
        }), 500