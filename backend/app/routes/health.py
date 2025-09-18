"""
Health Check Endpoint
Add this to backend/app/routes/health.py
"""

from flask import Blueprint, jsonify
import os
import redis
from datetime import datetime
from sqlalchemy import text
from app import db

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint"""
    health_status = {
        'status': 'healthy',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {}
    }

    try:
        # Database check
        db.session.execute(text('SELECT 1'))
        health_status['services']['database'] = 'healthy'
    except Exception as e:
        health_status['services']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'degraded'

    try:
        # Redis check
        redis_client = redis.from_url(os.environ.get('REDIS_URL', 'redis://localhost:6379'))
        redis_client.ping()
        health_status['services']['redis'] = 'healthy'
    except Exception as e:
        health_status['services']['redis'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'degraded'

    try:
        # OpenAI API check (if key is configured)
        if os.environ.get('OPENAI_API_KEY'):
            import openai
            openai.api_key = os.environ.get('OPENAI_API_KEY')
            # Simple API validation without making actual request
            health_status['services']['openai'] = 'configured'
        else:
            health_status['services']['openai'] = 'not_configured'
    except Exception as e:
        health_status['services']['openai'] = f'error: {str(e)}'

    return jsonify(health_status)

@health_bp.route('/ready', methods=['GET'])
def readiness_check():
    """Kubernetes/Docker readiness probe"""
    try:
        # Quick database check
        db.session.execute(text('SELECT 1'))
        return jsonify({'status': 'ready'}), 200
    except Exception as e:
        return jsonify({'status': 'not_ready', 'error': str(e)}), 503

@health_bp.route('/live', methods=['GET'])
def liveness_check():
    """Kubernetes/Docker liveness probe"""
    return jsonify({'status': 'alive'}), 200