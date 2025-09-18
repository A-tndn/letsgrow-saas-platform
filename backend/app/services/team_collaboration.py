from typing import Dict, List, Optional, Any
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import json
import asyncio

logger = logging.getLogger(__name__)

class UserRole(Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EDITOR = "editor"
    REVIEWER = "reviewer"
    VIEWER = "viewer"

class ContentStatus(Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"

class PermissionLevel(Enum):
    FULL_ACCESS = "full_access"
    EDIT_ACCESS = "edit_access"
    REVIEW_ACCESS = "review_access"
    VIEW_ACCESS = "view_access"

@dataclass
class TeamMember:
    user_id: int
    email: str
    name: str
    role: UserRole
    permissions: List[PermissionLevel]
    department: Optional[str]
    created_at: datetime
    last_active: Optional[datetime]
    is_active: bool

@dataclass
class ContentWorkflow:
    id: str
    name: str
    steps: List[Dict[str, Any]]
    required_approvals: int
    auto_approve_conditions: List[str]
    escalation_rules: List[Dict[str, Any]]
    is_active: bool

@dataclass
class ReviewRequest:
    id: str
    content_id: str
    requester_id: int
    reviewer_id: int
    status: str
    comments: List[Dict[str, Any]]
    deadline: Optional[datetime]
    created_at: datetime
    completed_at: Optional[datetime]

class TeamCollaborationManager:
    """Advanced team collaboration and content approval system"""

    def __init__(self):
        self.role_permissions = {
            UserRole.ADMIN: [
                PermissionLevel.FULL_ACCESS,
                PermissionLevel.EDIT_ACCESS,
                PermissionLevel.REVIEW_ACCESS,
                PermissionLevel.VIEW_ACCESS
            ],
            UserRole.MANAGER: [
                PermissionLevel.EDIT_ACCESS,
                PermissionLevel.REVIEW_ACCESS,
                PermissionLevel.VIEW_ACCESS
            ],
            UserRole.EDITOR: [
                PermissionLevel.EDIT_ACCESS,
                PermissionLevel.VIEW_ACCESS
            ],
            UserRole.REVIEWER: [
                PermissionLevel.REVIEW_ACCESS,
                PermissionLevel.VIEW_ACCESS
            ],
            UserRole.VIEWER: [
                PermissionLevel.VIEW_ACCESS
            ]
        }

        self.default_workflows = self._create_default_workflows()

    def _create_default_workflows(self) -> List[ContentWorkflow]:
        """Create default content approval workflows"""

        return [
            ContentWorkflow(
                id="simple_approval",
                name="Simple Approval",
                steps=[
                    {"step": "create", "role": "editor", "action": "create_content"},
                    {"step": "review", "role": "reviewer", "action": "review_content"},
                    {"step": "approve", "role": "manager", "action": "approve_content"},
                    {"step": "publish", "role": "admin", "action": "publish_content"}
                ],
                required_approvals=1,
                auto_approve_conditions=[
                    "content_length < 100 characters",
                    "no_external_links",
                    "brand_voice_score > 0.8"
                ],
                escalation_rules=[
                    {"condition": "pending > 24 hours", "action": "notify_manager"},
                    {"condition": "pending > 48 hours", "action": "auto_escalate_to_admin"}
                ],
                is_active=True
            ),
            ContentWorkflow(
                id="enterprise_approval",
                name="Enterprise Approval",
                steps=[
                    {"step": "create", "role": "editor", "action": "create_content"},
                    {"step": "peer_review", "role": "editor", "action": "peer_review"},
                    {"step": "manager_review", "role": "manager", "action": "manager_review"},
                    {"step": "compliance_check", "role": "reviewer", "action": "compliance_review"},
                    {"step": "final_approval", "role": "admin", "action": "final_approval"},
                    {"step": "publish", "role": "admin", "action": "publish_content"}
                ],
                required_approvals=3,
                auto_approve_conditions=[],  # No auto-approval for enterprise
                escalation_rules=[
                    {"condition": "pending > 12 hours", "action": "notify_next_reviewer"},
                    {"condition": "pending > 24 hours", "action": "notify_manager"},
                    {"condition": "pending > 48 hours", "action": "escalate_to_admin"}
                ],
                is_active=True
            ),
            ContentWorkflow(
                id="fast_track",
                name="Fast Track",
                steps=[
                    {"step": "create", "role": "editor", "action": "create_content"},
                    {"step": "auto_review", "role": "system", "action": "automated_review"},
                    {"step": "publish", "role": "system", "action": "auto_publish"}
                ],
                required_approvals=0,
                auto_approve_conditions=[
                    "content_type == 'repost'",
                    "brand_voice_score > 0.9",
                    "no_sensitive_content",
                    "content_length < 200 characters"
                ],
                escalation_rules=[],
                is_active=True
            )
        ]

    async def add_team_member(self, 
                            user_id: int,
                            email: str, 
                            name: str, 
                            role: UserRole,
                            department: Optional[str] = None) -> TeamMember:
        """Add a new team member with appropriate permissions"""

        try:
            permissions = self.role_permissions.get(role, [PermissionLevel.VIEW_ACCESS])

            team_member = TeamMember(
                user_id=user_id,
                email=email,
                name=name,
                role=role,
                permissions=permissions,
                department=department,
                created_at=datetime.utcnow(),
                last_active=None,
                is_active=True
            )

            # In production, this would save to database
            logger.info(f"Added team member: {name} with role {role.value}")

            return team_member

        except Exception as e:
            logger.error(f"Error adding team member: {str(e)}")
            raise

    async def update_team_member_role(self, 
                                    user_id: int, 
                                    new_role: UserRole) -> bool:
        """Update a team member's role and permissions"""

        try:
            # In production, would update database record
            new_permissions = self.role_permissions.get(new_role, [PermissionLevel.VIEW_ACCESS])

            # Log the change for audit purposes
            logger.info(f"Updated user {user_id} role to {new_role.value}")

            return True

        except Exception as e:
            logger.error(f"Error updating team member role: {str(e)}")
            return False

    async def create_custom_workflow(self, 
                                   name: str,
                                   steps: List[Dict[str, Any]],
                                   required_approvals: int,
                                   auto_approve_conditions: List[str] = None) -> ContentWorkflow:
        """Create a custom content approval workflow"""

        import uuid

        workflow = ContentWorkflow(
            id=str(uuid.uuid4()),
            name=name,
            steps=steps,
            required_approvals=required_approvals,
            auto_approve_conditions=auto_approve_conditions or [],
            escalation_rules=[],
            is_active=True
        )

        # In production, would save to database
        logger.info(f"Created custom workflow: {name}")

        return workflow

    async def submit_content_for_review(self, 
                                      content_id: str,
                                      content: str,
                                      workflow_id: str,
                                      author_id: int) -> ReviewRequest:
        """Submit content for review through specified workflow"""

        try:
            import uuid

            # Find appropriate reviewers based on workflow
            workflow = next((w for w in self.default_workflows if w.id == workflow_id), None)
            if not workflow:
                raise ValueError(f"Workflow {workflow_id} not found")

            # Create review request
            review_request = ReviewRequest(
                id=str(uuid.uuid4()),
                content_id=content_id,
                requester_id=author_id,
                reviewer_id=0,  # Will be assigned based on workflow
                status="pending",
                comments=[],
                deadline=datetime.utcnow() + timedelta(hours=24),
                created_at=datetime.utcnow(),
                completed_at=None
            )

            # Check auto-approval conditions
            if await self._check_auto_approval_conditions(content, workflow.auto_approve_conditions):
                review_request.status = "auto_approved"
                review_request.completed_at = datetime.utcnow()
                logger.info(f"Content {content_id} auto-approved")
            else:
                # Assign to next reviewer in workflow
                next_step = workflow.steps[1] if len(workflow.steps) > 1 else workflow.steps[0]
                logger.info(f"Content {content_id} submitted for {next_step['action']}")

            return review_request

        except Exception as e:
            logger.error(f"Error submitting content for review: {str(e)}")
            raise

    async def _check_auto_approval_conditions(self, 
                                            content: str, 
                                            conditions: List[str]) -> bool:
        """Check if content meets auto-approval conditions"""

        for condition in conditions:
            if not await self._evaluate_condition(content, condition):
                return False

        return len(conditions) > 0  # Only auto-approve if there are conditions and all pass

    async def _evaluate_condition(self, content: str, condition: str) -> bool:
        """Evaluate a specific auto-approval condition"""

        try:
            if "content_length <" in condition:
                limit = int(condition.split("<")[1].strip().split()[0])
                return len(content) < limit

            elif "no_external_links" in condition:
                import re
                links = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', content)
                return len(links) == 0

            elif "brand_voice_score >" in condition:
                # In production, would use actual brand voice analysis
                return True  # Simplified for demo

            elif "no_sensitive_content" in condition:
                sensitive_keywords = ['confidential', 'internal', 'private', 'classified']
                return not any(keyword in content.lower() for keyword in sensitive_keywords)

            elif "content_type ==" in condition:
                # Would check actual content type metadata
                return True  # Simplified for demo

        except Exception as e:
            logger.error(f"Error evaluating condition '{condition}': {str(e)}")

        return False

    async def review_content(self, 
                           review_request_id: str,
                           reviewer_id: int,
                           decision: str,
                           comments: str = "") -> bool:
        """Review content and make approval/rejection decision"""

        try:
            # In production, would fetch and update review request from database

            review_comment = {
                "reviewer_id": reviewer_id,
                "decision": decision,
                "comments": comments,
                "timestamp": datetime.utcnow().isoformat()
            }

            logger.info(f"Content review completed: {decision} by user {reviewer_id}")

            # If approved, move to next step in workflow
            # If rejected, send back to author
            # If final approval, schedule for publishing

            return True

        except Exception as e:
            logger.error(f"Error reviewing content: {str(e)}")
            return False

    def get_team_permissions_matrix(self) -> Dict[str, Dict[str, bool]]:
        """Get permissions matrix for all roles"""

        permissions_matrix = {}

        for role, permissions in self.role_permissions.items():
            role_permissions = {
                "can_create_content": PermissionLevel.EDIT_ACCESS in permissions,
                "can_edit_content": PermissionLevel.EDIT_ACCESS in permissions,
                "can_review_content": PermissionLevel.REVIEW_ACCESS in permissions,
                "can_approve_content": PermissionLevel.REVIEW_ACCESS in permissions,
                "can_publish_content": PermissionLevel.FULL_ACCESS in permissions,
                "can_delete_content": PermissionLevel.FULL_ACCESS in permissions,
                "can_manage_team": PermissionLevel.FULL_ACCESS in permissions,
                "can_view_analytics": PermissionLevel.VIEW_ACCESS in permissions,
                "can_manage_workflows": PermissionLevel.FULL_ACCESS in permissions,
                "can_manage_brand_settings": PermissionLevel.FULL_ACCESS in permissions
            }

            permissions_matrix[role.value] = role_permissions

        return permissions_matrix

    async def get_content_approval_status(self, content_id: str) -> Dict[str, Any]:
        """Get detailed approval status for content"""

        # In production, would fetch from database
        return {
            "content_id": content_id,
            "current_status": "pending_review",
            "workflow_name": "Simple Approval",
            "current_step": 2,
            "total_steps": 4,
            "pending_with": "manager",
            "submitted_at": "2025-09-19T00:00:00Z",
            "deadline": "2025-09-20T00:00:00Z",
            "approval_history": [
                {
                    "step": "create",
                    "completed_by": "editor",
                    "completed_at": "2025-09-19T00:00:00Z",
                    "status": "completed"
                },
                {
                    "step": "review",
                    "assigned_to": "reviewer",
                    "status": "in_progress",
                    "started_at": "2025-09-19T01:00:00Z"
                }
            ],
            "comments": [
                {
                    "author": "Editor",
                    "comment": "Ready for review - follows brand guidelines",
                    "timestamp": "2025-09-19T00:00:00Z"
                }
            ]
        }

    async def get_team_activity_dashboard(self) -> Dict[str, Any]:
        """Get team activity and performance dashboard"""

        # In production, would aggregate from database
        return {
            "team_summary": {
                "total_members": 8,
                "active_members": 6,
                "roles_distribution": {
                    "admin": 1,
                    "manager": 2,
                    "editor": 3,
                    "reviewer": 2
                }
            },
            "content_pipeline": {
                "draft": 15,
                "pending_review": 8,
                "approved": 12,
                "scheduled": 6,
                "published": 45
            },
            "performance_metrics": {
                "avg_approval_time": "18 hours",
                "approval_rate": 0.89,
                "auto_approval_rate": 0.23,
                "content_velocity": "12 posts per day"
            },
            "recent_activity": [
                {
                    "action": "content_approved",
                    "user": "Manager",
                    "content_title": "Industry insights post",
                    "timestamp": "2025-09-19T02:00:00Z"
                },
                {
                    "action": "review_requested",
                    "user": "Editor",
                    "content_title": "Product update announcement",
                    "timestamp": "2025-09-19T01:30:00Z"
                }
            ],
            "bottlenecks": [
                {
                    "stage": "manager_review",
                    "avg_wait_time": "6 hours",
                    "pending_items": 3
                }
            ]
        }

class NotificationManager:
    """Manage notifications for team collaboration"""

    def __init__(self):
        self.notification_types = {
            'review_requested': 'Review Requested',
            'content_approved': 'Content Approved',
            'content_rejected': 'Content Rejected',
            'deadline_approaching': 'Deadline Approaching',
            'escalation': 'Escalation Notice',
            'workflow_completed': 'Workflow Completed'
        }

    async def send_notification(self, 
                              user_id: int,
                              notification_type: str,
                              title: str,
                              message: str,
                              related_content_id: Optional[str] = None) -> bool:
        """Send notification to team member"""

        try:
            notification = {
                "id": f"notif_{datetime.utcnow().timestamp()}",
                "user_id": user_id,
                "type": notification_type,
                "title": title,
                "message": message,
                "related_content_id": related_content_id,
                "created_at": datetime.utcnow().isoformat(),
                "read": False
            }

            # In production, would save to database and send via email/push notification
            logger.info(f"Notification sent to user {user_id}: {title}")

            return True

        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
            return False

    async def get_user_notifications(self, 
                                   user_id: int,
                                   limit: int = 20,
                                   unread_only: bool = False) -> List[Dict[str, Any]]:
        """Get notifications for a user"""

        # In production, would fetch from database
        mock_notifications = [
            {
                "id": "notif_1",
                "type": "review_requested",
                "title": "Review Requested",
                "message": "Your review is needed for 'Social Media Strategy Post'",
                "related_content_id": "content_123",
                "created_at": "2025-09-19T01:00:00Z",
                "read": False
            },
            {
                "id": "notif_2",
                "type": "content_approved",
                "title": "Content Approved",
                "message": "Your post 'Industry Insights' has been approved",
                "related_content_id": "content_124",
                "created_at": "2025-09-19T00:30:00Z",
                "read": True
            }
        ]

        if unread_only:
            mock_notifications = [n for n in mock_notifications if not n["read"]]

        return mock_notifications[:limit]

# Initialize global collaboration manager
collaboration_manager = TeamCollaborationManager()
notification_manager = NotificationManager()
