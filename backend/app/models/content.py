from app.models import db
from datetime import datetime
from enum import Enum

class ContentStatus(Enum):
    SCHEDULED = "scheduled"
    POSTING = "posting"
    POSTED = "posted"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ContentQueue(db.Model):
    __tablename__ = 'content_queue'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    automation_id = db.Column(db.Integer, db.ForeignKey('automations.id'), nullable=True)
    social_account_id = db.Column(db.Integer, db.ForeignKey('social_accounts.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_urls = db.Column(db.ARRAY(db.Text))
    hashtags = db.Column(db.ARRAY(db.Text))
    platform_specific_data = db.Column(db.JSON)
    scheduled_for = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum(ContentStatus), default=ContentStatus.SCHEDULED)
    posted_at = db.Column(db.DateTime)
    platform_post_id = db.Column(db.String(255))
    engagement_data = db.Column(db.JSON)
    error_message = db.Column(db.Text)
    retry_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='content_queue')
    social_account = db.relationship('SocialAccount', back_populates='content_queue')
    automation = db.relationship('Automation', back_populates='content_queue')

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'media_urls': self.media_urls,
            'hashtags': self.hashtags,
            'scheduled_for': self.scheduled_for.isoformat(),
            'status': self.status.value,
            'posted_at': self.posted_at.isoformat() if self.posted_at else None,
            'platform_post_id': self.platform_post_id,
            'engagement_data': self.engagement_data,
            'created_at': self.created_at.isoformat()
        }
