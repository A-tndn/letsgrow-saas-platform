from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from enum import Enum
from app.models import db

class SubscriptionTier(Enum):
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    avatar_url = db.Column(db.Text)
    subscription_tier = db.Column(db.Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    subscription_expires = db.Column(db.DateTime)
    api_usage_count = db.Column(db.Integer, default=0)
    monthly_api_limit = db.Column(db.Integer, default=1000)
    active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships - using strings to avoid circular imports
    social_accounts = db.relationship('SocialAccount', back_populates='user', cascade='all, delete-orphan')
    automations = db.relationship('Automation', back_populates='user', cascade='all, delete-orphan')
    content_queue = db.relationship('ContentQueue', back_populates='user', cascade='all, delete-orphan')
    analytics = db.relationship('AnalyticsDaily', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_api_usage_percentage(self):
        if self.monthly_api_limit == 0:
            return 0
        return min(100, (self.api_usage_count / self.monthly_api_limit) * 100)

    def can_make_api_call(self):
        return self.api_usage_count < self.monthly_api_limit

    def increment_api_usage(self):
        self.api_usage_count += 1
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'avatar_url': self.avatar_url,
            'subscription_tier': self.subscription_tier.value,
            'api_usage_percentage': self.get_api_usage_percentage(),
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat()
        }
