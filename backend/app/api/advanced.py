from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from app.models import db, User
from app.api.auth import get_user_from_token
from app.services.audience_analyzer import audience_analyzer, competitor_analyzer, trend_detector
from app.services.brand_voice_analyzer import brand_voice_analyzer
from app.services.multilang_service import multilang_service, schedule_optimizer
from app.services.team_collaboration import collaboration_manager, notification_manager, UserRole
import logging
import json
from datetime import datetime

advanced_bp = Blueprint('advanced', __name__)
logger = logging.getLogger(__name__)

@advanced_bp.route('/audience/analyze', methods=['POST'])
def analyze_audience():
    """Analyze user's audience for detailed insights"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        platform = data.get('platform', 'twitter')

        # Analyze audience (async function, would be handled properly in production)
        import asyncio

        async def get_analysis():
            return await audience_analyzer.analyze_audience(user.id, platform)

        # Run async function (in production, would use proper async handling)
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            analysis = loop.run_until_complete(get_analysis())
            loop.close()
        except:
            # Fallback to demo data if async fails
            analysis = audience_analyzer._generate_fallback_profile(platform)

        return jsonify({
            'success': True,
            'audience_analysis': {
                'platform': analysis.platform,
                'demographics': analysis.demographics,
                'interests': analysis.interests,
                'engagement_patterns': analysis.engagement_patterns,
                'optimal_posting_times': analysis.optimal_posting_times,
                'preferred_content_types': analysis.preferred_content_types,
                'hashtag_preferences': analysis.hashtag_preferences,
                'geographic_distribution': analysis.geographic_distribution
            }
        }), 200

    except Exception as e:
        logger.error(f"Error analyzing audience: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to analyze audience'
        }), 500

@advanced_bp.route('/competitors/analyze', methods=['POST'])
def analyze_competitors():
    """Analyze competitors for strategic insights"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        competitor_handles = data.get('competitor_handles', [])
        platform = data.get('platform', 'twitter')
        user_handle = data.get('user_handle', 'your_brand')

        if not competitor_handles:
            return jsonify({
                'success': False,
                'error': 'At least one competitor handle is required'
            }), 400

        # Analyze competitors
        import asyncio

        async def get_competitive_analysis():
            return await competitor_analyzer.generate_competitive_insights(
                user_handle, competitor_handles, platform
            )

        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            analysis = loop.run_until_complete(get_competitive_analysis())
            loop.close()
        except:
            analysis = {'error': 'Analysis temporarily unavailable'}

        return jsonify({
            'success': True,
            'competitive_analysis': analysis
        }), 200

    except Exception as e:
        logger.error(f"Error analyzing competitors: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to analyze competitors'
        }), 500

@advanced_bp.route('/trends/detect', methods=['GET'])
def detect_trends():
    """Detect trending topics for content opportunities"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        platform = request.args.get('platform', 'twitter')
        industry = request.args.get('industry', 'general')

        # Detect trends
        import asyncio

        async def get_trends():
            return await trend_detector.detect_trending_topics(platform, industry)

        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            trends = loop.run_until_complete(get_trends())
            loop.close()
        except:
            trends = trend_detector._generate_fallback_trends(platform)

        return jsonify({
            'success': True,
            'trending_topics': trends
        }), 200

    except Exception as e:
        logger.error(f"Error detecting trends: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to detect trends'
        }), 500

@advanced_bp.route('/brand-voice/analyze', methods=['POST'])
def analyze_brand_voice():
    """Analyze content for brand voice consistency"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        content = data.get('content', '')
        brand_profile_data = data.get('brand_profile')

        if not content:
            return jsonify({
                'success': False,
                'error': 'Content is required for analysis'
            }), 400

        # Create or use existing brand voice profile
        if brand_profile_data:
            # Use provided profile (would deserialize from stored data)
            brand_profile = brand_voice_analyzer._create_fallback_profile(brand_profile_data.get('brand_name', 'Your Brand'))
        else:
            # Create basic profile for demo
            brand_profile = brand_voice_analyzer._create_fallback_profile('Your Brand')

        # Analyze content
        analysis = brand_voice_analyzer.analyze_content_consistency(content, brand_profile)

        return jsonify({
            'success': True,
            'brand_voice_analysis': {
                'brand_consistency_score': analysis.brand_consistency_score,
                'tone_match_score': analysis.tone_match_score,
                'vocabulary_compliance': analysis.vocabulary_compliance,
                'structure_alignment': analysis.structure_alignment,
                'recommendations': analysis.recommendations,
                'flagged_issues': analysis.flagged_issues,
                'suggested_improvements': analysis.suggested_improvements
            }
        }), 200

    except Exception as e:
        logger.error(f"Error analyzing brand voice: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to analyze brand voice'
        }), 500

@advanced_bp.route('/brand-voice/create-profile', methods=['POST'])
def create_brand_voice_profile():
    """Create a brand voice profile from sample content"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        brand_name = data.get('brand_name', 'Your Brand')
        sample_content = data.get('sample_content', [])
        manual_guidelines = data.get('manual_guidelines')

        if not sample_content:
            return jsonify({
                'success': False,
                'error': 'Sample content is required to create brand voice profile'
            }), 400

        # Create brand voice profile
        profile = brand_voice_analyzer.create_brand_voice_profile(
            brand_name, sample_content, manual_guidelines
        )

        return jsonify({
            'success': True,
            'brand_voice_profile': {
                'brand_name': profile.brand_name,
                'tone_characteristics': profile.tone_characteristics,
                'vocabulary_preferences': profile.vocabulary_preferences,
                'content_pillars': profile.content_pillars,
                'messaging_guidelines': profile.messaging_guidelines
            },
            'message': 'Brand voice profile created successfully'
        }), 200

    except Exception as e:
        logger.error(f"Error creating brand voice profile: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create brand voice profile'
        }), 500

@advanced_bp.route('/multilang/translate', methods=['POST'])
def translate_content():
    """Translate and localize content for multiple markets"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        content = data.get('content', '')
        source_language = data.get('source_language', 'en-US')
        target_languages = data.get('target_languages', [])
        market_context = data.get('market_context')

        if not content or not target_languages:
            return jsonify({
                'success': False,
                'error': 'Content and target languages are required'
            }), 400

        # Generate multilingual content
        import asyncio

        async def get_translations():
            return await multilang_service.generate_multilingual_content(
                content, source_language, target_languages, market_context
            )

        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            translations = loop.run_until_complete(get_translations())
            loop.close()
        except:
            # Fallback
            translations = {lang: multilang_service._create_fallback_localization(content, lang) 
                          for lang in target_languages}

        # Convert to serializable format
        result = {}
        for lang, localized in translations.items():
            result[lang] = {
                'translated_content': localized.translated_content,
                'localization_score': localized.localization_score,
                'confidence_score': localized.confidence_score,
                'cultural_adaptations': localized.cultural_adaptations,
                'suggested_improvements': localized.suggested_improvements
            }

        return jsonify({
            'success': True,
            'translations': result
        }), 200

    except Exception as e:
        logger.error(f"Error translating content: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to translate content'
        }), 500

@advanced_bp.route('/multilang/languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        languages = multilang_service.get_supported_languages()

        return jsonify({
            'success': True,
            'supported_languages': languages
        }), 200

    except Exception as e:
        logger.error(f"Error getting supported languages: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get supported languages'
        }), 500

@advanced_bp.route('/multilang/market-insights', methods=['GET'])
def get_market_insights():
    """Get market insights for a specific country"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        country_code = request.args.get('country_code', 'US')
        insights = multilang_service.get_market_insights(country_code)

        return jsonify({
            'success': True,
            'market_insights': insights
        }), 200

    except Exception as e:
        logger.error(f"Error getting market insights: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get market insights'
        }), 500

@advanced_bp.route('/schedule/optimize', methods=['POST'])
def optimize_schedule():
    """Optimize posting schedule for multiple markets"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        target_markets = data.get('target_markets', ['US'])
        content_frequency = data.get('content_frequency', 3)

        schedule = schedule_optimizer.optimize_posting_schedule(target_markets, content_frequency)

        return jsonify({
            'success': True,
            'optimized_schedule': schedule
        }), 200

    except Exception as e:
        logger.error(f"Error optimizing schedule: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to optimize schedule'
        }), 500

@advanced_bp.route('/team/add-member', methods=['POST'])
def add_team_member():
    """Add a new team member"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        email = data.get('email')
        name = data.get('name')
        role = data.get('role', 'viewer')
        department = data.get('department')

        if not email or not name:
            return jsonify({
                'success': False,
                'error': 'Email and name are required'
            }), 400

        try:
            user_role = UserRole(role)
        except ValueError:
            return jsonify({
                'success': False,
                'error': f'Invalid role: {role}'
            }), 400

        # Add team member
        import asyncio

        async def add_member():
            return await collaboration_manager.add_team_member(
                user_id=999,  # Would be actual user ID
                email=email,
                name=name,
                role=user_role,
                department=department
            )

        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            team_member = loop.run_until_complete(add_member())
            loop.close()
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to add team member: {str(e)}'
            }), 500

        return jsonify({
            'success': True,
            'message': 'Team member added successfully',
            'team_member': {
                'name': team_member.name,
                'email': team_member.email,
                'role': team_member.role.value,
                'permissions': [p.value for p in team_member.permissions]
            }
        }), 200

    except Exception as e:
        logger.error(f"Error adding team member: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to add team member'
        }), 500

@advanced_bp.route('/team/permissions-matrix', methods=['GET'])
def get_permissions_matrix():
    """Get team permissions matrix"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        matrix = collaboration_manager.get_team_permissions_matrix()

        return jsonify({
            'success': True,
            'permissions_matrix': matrix
        }), 200

    except Exception as e:
        logger.error(f"Error getting permissions matrix: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get permissions matrix'
        }), 500

@advanced_bp.route('/team/activity-dashboard', methods=['GET'])
def get_team_activity_dashboard():
    """Get team activity dashboard"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        import asyncio

        async def get_dashboard():
            return await collaboration_manager.get_team_activity_dashboard()

        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            dashboard = loop.run_until_complete(get_dashboard())
            loop.close()
        except:
            dashboard = {'error': 'Dashboard temporarily unavailable'}

        return jsonify({
            'success': True,
            'team_dashboard': dashboard
        }), 200

    except Exception as e:
        logger.error(f"Error getting team dashboard: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get team dashboard'
        }), 500

@advanced_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """Get user notifications"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        limit = request.args.get('limit', 20, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'

        import asyncio

        async def get_user_notifications():
            return await notification_manager.get_user_notifications(
                user.id, limit, unread_only
            )

        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            notifications = loop.run_until_complete(get_user_notifications())
            loop.close()
        except:
            notifications = []

        return jsonify({
            'success': True,
            'notifications': notifications
        }), 200

    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get notifications'
        }), 500
