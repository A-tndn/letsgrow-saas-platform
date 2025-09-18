from app.models import db
from datetime import datetime
from enum import Enum

class SocialPlatform(Enum):
    TWITTER = "twitter"
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"
    REDDIT = "reddit"

class SocialAccount(db.Model):
    __tablename__ = 'social_accounts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    platform = db.Column(db.Enum(SocialPlatform), nullable=False)
    platform_user_id = db.Column(db.String(255))
    username = db.Column(db.String(255))
    display_name = db.Column(db.String(255))
    profile_image_url = db.Column(db.Text)
    access_token_encrypted = db.Column(db.Text)
    refresh_token_encrypted = db.Column(db.Text)
    token_expires_at = db.Column(db.DateTime)
    account_data = db.Column(db.JSON)  # Platform-specific metadata
    is_active = db.Column(db.Boolean, default=True)
    last_sync = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='social_accounts')
    content_queue = db.relationship('ContentQueue', back_populates='social_account', cascade='all, delete-orphan')
    analytics = db.relationship('AnalyticsDaily', back_populates='social_account', cascade='all, delete-orphan')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'platform', 'platform_user_id'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'platform': self.platform.value,
            'username': self.username,
            'display_name': self.display_name,
            'profile_image_url': self.profile_image_url,
            'is_active': self.is_active,
            'last_sync': self.last_sync.isoformat() if self.last_sync else None,
            'created_at': self.created_at.isoformat()
        }
