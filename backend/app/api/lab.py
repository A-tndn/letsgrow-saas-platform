from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

lab_bp = Blueprint('lab', __name__)
logger = logging.getLogger(__name__)

# In-memory storage for tasks (in production, use database)
tasks_storage = []

@lab_bp.route('/tasks', methods=['POST'])
def create_task():
    """Create or update lab task"""
    try:
        data = request.get_json() or {}
        
        task = {
            'id': len(tasks_storage) + 1,
            'timestamp': datetime.utcnow().isoformat(),
            'status': data.get('status', 'received'),
            'message': data.get('message', ''),
            'priority': data.get('priority', 'normal'),
            'category': data.get('category', 'general'),
            'data': data
        }
        
        tasks_storage.append(task)
        logger.info(f"Lab task created: {task['status']} - {task['message'][:100]}...")
        
        return jsonify({
            'success': True,
            'task_id': task['id'],
            'status': 'created',
            'message': 'Task received and logged'
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating lab task: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create task'
        }), 500

@lab_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Get all lab tasks"""
    try:
        return jsonify({
            'success': True,
            'tasks': tasks_storage,
            'count': len(tasks_storage)
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving lab tasks: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve tasks'
        }), 500

@lab_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get specific lab task"""
    try:
        task = next((t for t in tasks_storage if t['id'] == task_id), None)
        if not task:
            return jsonify({
                'success': False,
                'error': 'Task not found'
            }), 404
            
        return jsonify({
            'success': True,
            'task': task
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving lab task {task_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve task'
        }), 500

@lab_bp.route('/tasks/latest', methods=['GET'])
def get_latest_tasks():
    """Get latest lab tasks"""
    try:
        # Return last 10 tasks
        latest_tasks = tasks_storage[-10:] if len(tasks_storage) > 10 else tasks_storage
        
        return jsonify({
            'success': True,
            'tasks': latest_tasks,
            'count': len(latest_tasks),
            'total': len(tasks_storage)
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving latest lab tasks: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve latest tasks'
        }), 500

@lab_bp.route('/status', methods=['GET'])
def get_lab_status():
    """Get lab system status"""
    try:
        return jsonify({
            'success': True,
            'status': 'operational',
            'tasks_count': len(tasks_storage),
            'last_update': datetime.utcnow().isoformat(),
            'endpoints': [
                'POST /api/lab/tasks - Create task',
                'GET /api/lab/tasks - Get all tasks', 
                'GET /api/lab/tasks/<id> - Get specific task',
                'GET /api/lab/tasks/latest - Get latest tasks',
                'GET /api/lab/status - Get system status'
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving lab status: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve status'
        }), 500