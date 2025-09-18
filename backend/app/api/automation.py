from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from app.models import db, User
from app.api.auth import get_user_from_token
from app.services.automation_engine import automation_engine, AutomationRule, TriggerType, ActionType
import logging
import json
from datetime import datetime

automation_bp = Blueprint('automation', __name__)
logger = logging.getLogger(__name__)

@automation_bp.route('/rules', methods=['GET'])
def get_automation_rules():
    """Get all automation rules for the current user"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        # Get all rules (in a real implementation, this would filter by user)
        rules_data = []
        for rule_id, rule in automation_engine.rules.items():
            rule_status = automation_engine.get_rule_status(rule_id)
            rules_data.append({
                'id': rule.id,
                'name': rule.name,
                'description': rule.description,
                'trigger_type': rule.trigger_type.value,
                'trigger_conditions': rule.trigger_conditions,
                'action_type': rule.action_type.value,
                'action_parameters': rule.action_parameters,
                'is_active': rule.is_active,
                'created_at': rule.created_at.isoformat() if rule.created_at else None,
                'execution_count': rule.execution_count,
                'success_rate': rule.success_rate,
                'last_executed': rule.last_executed.isoformat() if rule.last_executed else None
            })

        return jsonify({
            'success': True,
            'rules': rules_data
        }), 200

    except Exception as e:
        logger.error(f"Error fetching automation rules: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch automation rules'
        }), 500

@automation_bp.route('/rules', methods=['POST'])
def create_automation_rule():
    """Create a new automation rule"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'trigger_type', 'trigger_conditions', 'action_type', 'action_parameters']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400

        # Create rule ID
        import uuid
        rule_id = str(uuid.uuid4())

        # Create automation rule
        rule = AutomationRule(
            id=rule_id,
            name=data['name'],
            description=data.get('description', ''),
            trigger_type=TriggerType(data['trigger_type']),
            trigger_conditions=data['trigger_conditions'],
            action_type=ActionType(data['action_type']),
            action_parameters=data['action_parameters'],
            is_active=data.get('is_active', True),
            created_at=datetime.utcnow()
        )

        # Add to automation engine
        success = automation_engine.add_rule(rule)

        if success:
            return jsonify({
                'success': True,
                'message': 'Automation rule created successfully',
                'rule_id': rule_id
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create automation rule'
            }), 500

    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid enum value: {str(e)}'
        }), 400
    except Exception as e:
        logger.error(f"Error creating automation rule: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create automation rule'
        }), 500

@automation_bp.route('/rules/<rule_id>', methods=['PUT'])
def update_automation_rule(rule_id):
    """Update an existing automation rule"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()

        # Update the rule
        success = automation_engine.update_rule(rule_id, data)

        if success:
            return jsonify({
                'success': True,
                'message': 'Automation rule updated successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Rule not found'
            }), 404

    except Exception as e:
        logger.error(f"Error updating automation rule: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update automation rule'
        }), 500

@automation_bp.route('/rules/<rule_id>', methods=['DELETE'])
def delete_automation_rule(rule_id):
    """Delete an automation rule"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        success = automation_engine.remove_rule(rule_id)

        if success:
            return jsonify({
                'success': True,
                'message': 'Automation rule deleted successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Rule not found'
            }), 404

    except Exception as e:
        logger.error(f"Error deleting automation rule: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete automation rule'
        }), 500

@automation_bp.route('/rules/<rule_id>/toggle', methods=['POST'])
def toggle_automation_rule(rule_id):
    """Toggle an automation rule on/off"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        if rule_id not in automation_engine.rules:
            return jsonify({
                'success': False,
                'error': 'Rule not found'
            }), 404

        rule = automation_engine.rules[rule_id]
        rule.is_active = not rule.is_active

        return jsonify({
            'success': True,
            'message': f"Rule {'activated' if rule.is_active else 'deactivated'}",
            'is_active': rule.is_active
        }), 200

    except Exception as e:
        logger.error(f"Error toggling automation rule: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to toggle automation rule'
        }), 500

@automation_bp.route('/status', methods=['GET'])
def get_automation_status():
    """Get automation engine status and statistics"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        stats = automation_engine.get_automation_stats()

        return jsonify({
            'success': True,
            'automation_stats': stats
        }), 200

    except Exception as e:
        logger.error(f"Error fetching automation status: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch automation status'
        }), 500

@automation_bp.route('/start', methods=['POST'])
def start_automation():
    """Start the automation engine"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        if not automation_engine.is_running:
            # In a real implementation, this would start the automation in a background process
            # For now, we'll just simulate starting it
            automation_engine.is_running = True

            return jsonify({
                'success': True,
                'message': 'Automation engine started successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Automation engine is already running'
            }), 400

    except Exception as e:
        logger.error(f"Error starting automation: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to start automation engine'
        }), 500

@automation_bp.route('/stop', methods=['POST'])
def stop_automation():
    """Stop the automation engine"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        if automation_engine.is_running:
            automation_engine.stop_automation()

            return jsonify({
                'success': True,
                'message': 'Automation engine stopped successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Automation engine is not running'
            }), 400

    except Exception as e:
        logger.error(f"Error stopping automation: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to stop automation engine'
        }), 500

@automation_bp.route('/templates', methods=['GET'])
def get_automation_templates():
    """Get predefined automation rule templates"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        templates = [
            {
                'id': 'daily_content',
                'name': 'Daily Content Posting',
                'description': 'Automatically generate and post content daily',
                'category': 'Content Creation',
                'trigger_type': 'time_based',
                'action_type': 'create_post',
                'template': {
                    'trigger_conditions': {
                        'schedule': 'daily',
                        'times': ['09:00', '17:00'],
                        'timezone': 'UTC'
                    },
                    'action_parameters': {
                        'content_topics': ['productivity', 'business tips'],
                        'platforms': ['twitter', 'linkedin'],
                        'tone': 'professional'
                    }
                }
            },
            {
                'id': 'engagement_boost',
                'name': 'Engagement Boost',
                'description': 'Create follow-up content for high-performing posts',
                'category': 'Engagement',
                'trigger_type': 'engagement_based',
                'action_type': 'create_post',
                'template': {
                    'trigger_conditions': {
                        'engagement_rate_threshold': 5.0,
                        'time_window': '24_hours'
                    },
                    'action_parameters': {
                        'content_type': 'expansion',
                        'reference_original': True
                    }
                }
            },
            {
                'id': 'trending_response',
                'name': 'Trending Topic Response',
                'description': 'Respond to trending topics in your industry',
                'category': 'Trend Monitoring',
                'trigger_type': 'trending_topic',
                'action_type': 'create_post',
                'template': {
                    'trigger_conditions': {
                        'platforms': ['twitter'],
                        'engagement_threshold': 1000,
                        'relevance_score': 0.7
                    },
                    'action_parameters': {
                        'response_time': 'within_2_hours',
                        'content_style': 'commentary',
                        'tone': 'casual'
                    }
                }
            }
        ]

        return jsonify({
            'success': True,
            'templates': templates
        }), 200

    except Exception as e:
        logger.error(f"Error fetching automation templates: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch automation templates'
        }), 500

@automation_bp.route('/execution-history', methods=['GET'])
def get_execution_history():
    """Get automation execution history"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        # Get query parameters
        limit = request.args.get('limit', 20, type=int)
        rule_id = request.args.get('rule_id')

        # Filter execution history
        executions = automation_engine.execution_history

        if rule_id:
            executions = [ex for ex in executions if ex.rule_id == rule_id]

        # Sort by execution time (most recent first)
        executions = sorted(executions, key=lambda x: x.executed_at, reverse=True)

        # Limit results
        executions = executions[:limit]

        # Convert to dict format
        execution_data = []
        for execution in executions:
            # Get rule name
            rule_name = automation_engine.rules.get(execution.rule_id, {}).name if execution.rule_id in automation_engine.rules else "Unknown Rule"

            execution_data.append({
                'rule_id': execution.rule_id,
                'rule_name': rule_name,
                'executed_at': execution.executed_at.isoformat(),
                'success': execution.success,
                'result': execution.result,
                'error_message': execution.error_message
            })

        return jsonify({
            'success': True,
            'executions': execution_data,
            'total_count': len(automation_engine.execution_history)
        }), 200

    except Exception as e:
        logger.error(f"Error fetching execution history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch execution history'
        }), 500

@automation_bp.route('/analytics', methods=['GET'])
def get_automation_analytics():
    """Get automation performance analytics"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        # Calculate analytics from execution history
        executions = automation_engine.execution_history

        if not executions:
            return jsonify({
                'success': True,
                'analytics': {
                    'total_executions': 0,
                    'success_rate': 100.0,
                    'average_per_day': 0.0,
                    'rule_performance': [],
                    'recent_activity': []
                }
            }), 200

        # Calculate metrics
        total_executions = len(executions)
        successful_executions = sum(1 for ex in executions if ex.success)
        success_rate = (successful_executions / total_executions) * 100

        # Calculate average executions per day
        if executions:
            oldest_execution = min(executions, key=lambda x: x.executed_at)
            days_since_first = (datetime.utcnow() - oldest_execution.executed_at).days + 1
            average_per_day = total_executions / days_since_first
        else:
            average_per_day = 0.0

        # Rule performance breakdown
        rule_performance = []
        for rule_id, rule in automation_engine.rules.items():
            rule_executions = [ex for ex in executions if ex.rule_id == rule_id]
            if rule_executions:
                rule_success_rate = sum(1 for ex in rule_executions if ex.success) / len(rule_executions) * 100
                rule_performance.append({
                    'rule_id': rule_id,
                    'rule_name': rule.name,
                    'executions': len(rule_executions),
                    'success_rate': rule_success_rate
                })

        # Recent activity (last 7 days)
        from collections import defaultdict
        recent_activity = defaultdict(int)
        cutoff_date = datetime.utcnow().date() - timedelta(days=6)

        for execution in executions:
            if execution.executed_at.date() >= cutoff_date:
                day_key = execution.executed_at.date().isoformat()
                recent_activity[day_key] += 1

        # Fill in missing days
        for i in range(7):
            day = (datetime.utcnow().date() - timedelta(days=i)).isoformat()
            if day not in recent_activity:
                recent_activity[day] = 0

        return jsonify({
            'success': True,
            'analytics': {
                'total_executions': total_executions,
                'success_rate': success_rate,
                'average_per_day': average_per_day,
                'rule_performance': rule_performance,
                'recent_activity': dict(recent_activity)
            }
        }), 200

    except Exception as e:
        logger.error(f"Error fetching automation analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch automation analytics'
        }), 500
