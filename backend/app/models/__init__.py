from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import all models here for easy access
from .user import User, SubscriptionTier
from .subscription import Subscription, Invoice, SubscriptionStatus, BillingCycle, PlanType
from .social_accounts import SocialAccount, SocialPlatform  
from .automation import Automation, AutomationStatus
from .content import ContentQueue, ContentStatus
from .analytics import AnalyticsDaily
from .background_jobs import BackgroundJob, JobStatus

__all__ = [
    'db',
    'User', 'SubscriptionTier',
    'SocialAccount', 'SocialPlatform', 
    'Automation', 'AutomationStatus',
    'ContentQueue', 'ContentStatus',
    'AnalyticsDaily',
    'BackgroundJob', 'JobStatus'
]