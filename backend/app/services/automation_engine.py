from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import asyncio
import logging
import json
from app.models import db
from app.models.social_accounts import SocialAccount, SocialPost, SocialPlatform
from app.services.ai_content_service import ai_content_service, ContentRequest
import random

logger = logging.getLogger(__name__)

class TriggerType(Enum):
    TIME_BASED = "time_based"
    ENGAGEMENT_BASED = "engagement_based"
    TRENDING_TOPIC = "trending_topic"
    FOLLOWER_MILESTONE = "follower_milestone"
    COMPETITOR_ACTIVITY = "competitor_activity"
    CONTENT_PERFORMANCE = "content_performance"

class ActionType(Enum):
    CREATE_POST = "create_post"
    SCHEDULE_POST = "schedule_post"
    ENGAGE_WITH_CONTENT = "engage_with_content"
    FOLLOW_USERS = "follow_users"
    ANALYZE_PERFORMANCE = "analyze_performance"
    SEND_NOTIFICATION = "send_notification"

@dataclass
class AutomationRule:
    id: str
    name: str
    description: str
    trigger_type: TriggerType
    trigger_conditions: Dict[str, Any]
    action_type: ActionType
    action_parameters: Dict[str, Any]
    is_active: bool = True
    created_at: datetime = None
    last_executed: datetime = None
    execution_count: int = 0
    success_rate: float = 100.0

@dataclass
class AutomationExecution:
    rule_id: str
    executed_at: datetime
    success: bool
    result: Dict[str, Any]
    error_message: Optional[str] = None

class AutomationEngine:
    """Advanced automation engine for social media growth"""

    def __init__(self):
        self.rules: Dict[str, AutomationRule] = {}
        self.execution_history: List[AutomationExecution] = []
        self.is_running = False
        self._load_default_rules()

    def _load_default_rules(self):
        """Load default automation rules"""

        # Daily content posting rule
        self.add_rule(AutomationRule(
            id="daily_content_posting",
            name="Daily Content Posting",
            description="Generate and post AI content daily at optimal times",
            trigger_type=TriggerType.TIME_BASED,
            trigger_conditions={
                "schedule": "daily",
                "times": ["09:00", "13:00", "17:00"],  # Optimal posting times
                "timezone": "UTC"
            },
            action_type=ActionType.CREATE_POST,
            action_parameters={
                "content_topics": ["productivity", "growth", "industry insights", "tips"],
                "platforms": ["twitter", "linkedin"],
                "tone": "professional",
                "include_hashtags": True
            }
        ))

        # Trending topic monitoring
        self.add_rule(AutomationRule(
            id="trending_topic_response",
            name="Trending Topic Response",
            description="Create content based on trending topics",
            trigger_type=TriggerType.TRENDING_TOPIC,
            trigger_conditions={
                "platforms": ["twitter", "instagram"],
                "engagement_threshold": 1000,
                "relevance_score": 0.7
            },
            action_type=ActionType.CREATE_POST,
            action_parameters={
                "response_time": "within_2_hours",
                "content_style": "commentary",
                "tone": "casual"
            }
        ))

        # Engagement-based follow-up
        self.add_rule(AutomationRule(
            id="high_engagement_followup",
            name="High Engagement Follow-up",
            description="Create follow-up content for high-performing posts",
            trigger_type=TriggerType.ENGAGEMENT_BASED,
            trigger_conditions={
                "engagement_rate_threshold": 5.0,
                "minimum_reach": 100,
                "time_window": "24_hours"
            },
            action_type=ActionType.CREATE_POST,
            action_parameters={
                "content_type": "expansion",
                "reference_original": True,
                "schedule_delay": "2_hours"
            }
        ))

        # Follower milestone celebration
        self.add_rule(AutomationRule(
            id="follower_milestone",
            name="Follower Milestone Celebration",
            description="Celebrate reaching follower milestones",
            trigger_type=TriggerType.FOLLOWER_MILESTONE,
            trigger_conditions={
                "milestones": [100, 500, 1000, 5000, 10000],
                "platforms": ["all"]
            },
            action_type=ActionType.CREATE_POST,
            action_parameters={
                "content_type": "celebration",
                "include_gratitude": True,
                "tone": "enthusiastic"
            }
        ))

    def add_rule(self, rule: AutomationRule) -> bool:
        """Add a new automation rule"""
        try:
            if rule.created_at is None:
                rule.created_at = datetime.utcnow()

            self.rules[rule.id] = rule
            logger.info(f"Added automation rule: {rule.name}")
            return True
        except Exception as e:
            logger.error(f"Failed to add automation rule: {str(e)}")
            return False

    def remove_rule(self, rule_id: str) -> bool:
        """Remove an automation rule"""
        try:
            if rule_id in self.rules:
                del self.rules[rule_id]
                logger.info(f"Removed automation rule: {rule_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to remove automation rule: {str(e)}")
            return False

    def update_rule(self, rule_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing automation rule"""
        try:
            if rule_id not in self.rules:
                return False

            rule = self.rules[rule_id]
            for key, value in updates.items():
                if hasattr(rule, key):
                    setattr(rule, key, value)

            logger.info(f"Updated automation rule: {rule_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update automation rule: {str(e)}")
            return False

    async def start_automation(self):
        """Start the automation engine"""
        self.is_running = True
        logger.info("Automation engine started")

        while self.is_running:
            try:
                await self._check_and_execute_rules()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Automation engine error: {str(e)}")
                await asyncio.sleep(300)  # Wait 5 minutes on error

    def stop_automation(self):
        """Stop the automation engine"""
        self.is_running = False
        logger.info("Automation engine stopped")

    async def _check_and_execute_rules(self):
        """Check all rules and execute triggered ones"""
        for rule_id, rule in self.rules.items():
            if not rule.is_active:
                continue

            try:
                if await self._should_execute_rule(rule):
                    await self._execute_rule(rule)
            except Exception as e:
                logger.error(f"Error executing rule {rule_id}: {str(e)}")

    async def _should_execute_rule(self, rule: AutomationRule) -> bool:
        """Check if a rule should be executed based on its trigger conditions"""

        if rule.trigger_type == TriggerType.TIME_BASED:
            return self._check_time_trigger(rule)
        elif rule.trigger_type == TriggerType.ENGAGEMENT_BASED:
            return await self._check_engagement_trigger(rule)
        elif rule.trigger_type == TriggerType.TRENDING_TOPIC:
            return await self._check_trending_trigger(rule)
        elif rule.trigger_type == TriggerType.FOLLOWER_MILESTONE:
            return await self._check_milestone_trigger(rule)
        elif rule.trigger_type == TriggerType.CONTENT_PERFORMANCE:
            return await self._check_performance_trigger(rule)

        return False

    def _check_time_trigger(self, rule: AutomationRule) -> bool:
        """Check time-based trigger conditions"""
        conditions = rule.trigger_conditions
        now = datetime.utcnow()

        # Check if enough time has passed since last execution
        if rule.last_executed:
            if conditions.get("schedule") == "daily":
                if now - rule.last_executed < timedelta(hours=23):
                    return False
            elif conditions.get("schedule") == "hourly":
                if now - rule.last_executed < timedelta(minutes=55):
                    return False

        # Check if current time matches scheduled times
        current_time = now.strftime("%H:%M")
        scheduled_times = conditions.get("times", [])

        if scheduled_times and current_time not in scheduled_times:
            # Allow 5-minute window
            for scheduled_time in scheduled_times:
                scheduled_dt = datetime.strptime(scheduled_time, "%H:%M").time()
                current_dt = now.time()

                # Convert to minutes for comparison
                scheduled_minutes = scheduled_dt.hour * 60 + scheduled_dt.minute
                current_minutes = current_dt.hour * 60 + current_dt.minute

                if abs(scheduled_minutes - current_minutes) <= 5:
                    return True

            return False

        return True

    async def _check_engagement_trigger(self, rule: AutomationRule) -> bool:
        """Check engagement-based trigger conditions"""
        conditions = rule.trigger_conditions
        threshold = conditions.get("engagement_rate_threshold", 5.0)
        time_window = conditions.get("time_window", "24_hours")

        # Get recent posts with high engagement
        cutoff_time = datetime.utcnow() - self._parse_time_window(time_window)

        # This would typically query the database for recent high-engagement posts
        # For now, we'll simulate this check
        return random.random() < 0.1  # 10% chance to trigger

    async def _check_trending_trigger(self, rule: AutomationRule) -> bool:
        """Check trending topic trigger conditions"""
        # This would integrate with Twitter API, Google Trends, etc.
        # For now, simulate trending topic detection
        return random.random() < 0.05  # 5% chance to trigger

    async def _check_milestone_trigger(self, rule: AutomationRule) -> bool:
        """Check follower milestone trigger conditions"""
        conditions = rule.trigger_conditions
        milestones = conditions.get("milestones", [])

        # Check all user's social accounts for milestone achievements
        # This would query actual follower counts from platforms
        # For now, simulate milestone detection
        return random.random() < 0.01  # 1% chance to trigger

    async def _check_performance_trigger(self, rule: AutomationRule) -> bool:
        """Check content performance trigger conditions"""
        # Analyze recent content performance trends
        # For now, simulate performance analysis
        return random.random() < 0.08  # 8% chance to trigger

    async def _execute_rule(self, rule: AutomationRule):
        """Execute an automation rule"""
        logger.info(f"Executing rule: {rule.name}")

        try:
            result = None

            if rule.action_type == ActionType.CREATE_POST:
                result = await self._execute_create_post(rule)
            elif rule.action_type == ActionType.SCHEDULE_POST:
                result = await self._execute_schedule_post(rule)
            elif rule.action_type == ActionType.ENGAGE_WITH_CONTENT:
                result = await self._execute_engagement(rule)
            elif rule.action_type == ActionType.FOLLOW_USERS:
                result = await self._execute_follow_users(rule)
            elif rule.action_type == ActionType.ANALYZE_PERFORMANCE:
                result = await self._execute_performance_analysis(rule)

            # Record successful execution
            execution = AutomationExecution(
                rule_id=rule.id,
                executed_at=datetime.utcnow(),
                success=True,
                result=result or {}
            )

            rule.last_executed = datetime.utcnow()
            rule.execution_count += 1

            self.execution_history.append(execution)

            logger.info(f"Successfully executed rule: {rule.name}")

        except Exception as e:
            logger.error(f"Failed to execute rule {rule.name}: {str(e)}")

            execution = AutomationExecution(
                rule_id=rule.id,
                executed_at=datetime.utcnow(),
                success=False,
                result={},
                error_message=str(e)
            )

            self.execution_history.append(execution)

            # Update success rate
            total_executions = len([ex for ex in self.execution_history if ex.rule_id == rule.id])
            successful_executions = len([ex for ex in self.execution_history 
                                       if ex.rule_id == rule.id and ex.success])
            rule.success_rate = (successful_executions / total_executions) * 100 if total_executions > 0 else 100

    async def _execute_create_post(self, rule: AutomationRule) -> Dict[str, Any]:
        """Execute create post action"""
        params = rule.action_parameters

        # Select random topic if multiple provided
        topics = params.get("content_topics", ["general insights"])
        topic = random.choice(topics) if isinstance(topics, list) else topics

        # Select platforms
        platforms = params.get("platforms", ["twitter"])
        if not isinstance(platforms, list):
            platforms = [platforms]

        results = []

        for platform in platforms:
            # Generate content using AI service
            request = ContentRequest(
                topic=topic,
                platform=platform,
                tone=params.get("tone", "professional"),
                length=params.get("length", "medium"),
                include_hashtags=params.get("include_hashtags", True)
            )

            generated_content = await ai_content_service.generate_content(request)

            # Create post record (simplified - in real implementation, this would save to database)
            post_data = {
                "platform": platform,
                "content": generated_content.text,
                "hashtags": generated_content.hashtags,
                "engagement_score": generated_content.engagement_score,
                "created_by_automation": True,
                "rule_id": rule.id
            }

            results.append(post_data)

        return {"posts_created": len(results), "posts": results}

    async def _execute_schedule_post(self, rule: AutomationRule) -> Dict[str, Any]:
        """Execute schedule post action"""
        # Implementation for scheduling posts
        return {"scheduled_posts": 1}

    async def _execute_engagement(self, rule: AutomationRule) -> Dict[str, Any]:
        """Execute engagement actions (likes, comments, follows)"""
        # Implementation for automated engagement
        return {"engagements": 5}

    async def _execute_follow_users(self, rule: AutomationRule) -> Dict[str, Any]:
        """Execute follow users action"""
        # Implementation for automated following
        return {"users_followed": 3}

    async def _execute_performance_analysis(self, rule: AutomationRule) -> Dict[str, Any]:
        """Execute performance analysis"""
        # Implementation for performance analysis
        return {"analysis_completed": True}

    def _parse_time_window(self, time_window: str) -> timedelta:
        """Parse time window string to timedelta"""
        if time_window == "1_hour":
            return timedelta(hours=1)
        elif time_window == "6_hours":
            return timedelta(hours=6)
        elif time_window == "24_hours":
            return timedelta(hours=24)
        elif time_window == "7_days":
            return timedelta(days=7)
        else:
            return timedelta(hours=24)

    def get_rule_status(self, rule_id: str) -> Dict[str, Any]:
        """Get status information for a rule"""
        if rule_id not in self.rules:
            return {}

        rule = self.rules[rule_id]
        recent_executions = [ex for ex in self.execution_history[-10:] if ex.rule_id == rule_id]

        return {
            "id": rule.id,
            "name": rule.name,
            "is_active": rule.is_active,
            "execution_count": rule.execution_count,
            "success_rate": rule.success_rate,
            "last_executed": rule.last_executed.isoformat() if rule.last_executed else None,
            "recent_executions": len(recent_executions)
        }

    def get_automation_stats(self) -> Dict[str, Any]:
        """Get overall automation statistics"""
        active_rules = sum(1 for rule in self.rules.values() if rule.is_active)
        total_executions = sum(rule.execution_count for rule in self.rules.values())

        recent_executions = [ex for ex in self.execution_history if 
                           ex.executed_at > datetime.utcnow() - timedelta(hours=24)]

        return {
            "total_rules": len(self.rules),
            "active_rules": active_rules,
            "total_executions": total_executions,
            "executions_24h": len(recent_executions),
            "is_running": self.is_running,
            "success_rate": self._calculate_overall_success_rate()
        }

    def _calculate_overall_success_rate(self) -> float:
        """Calculate overall success rate across all rules"""
        if not self.execution_history:
            return 100.0

        successful = sum(1 for ex in self.execution_history if ex.success)
        return (successful / len(self.execution_history)) * 100

# Initialize global automation engine instance
automation_engine = AutomationEngine()
