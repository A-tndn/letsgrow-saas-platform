from app.models import db
from datetime import datetime
from enum import Enum

class PostStatus(Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled" 
    PUBLISHED = "published"
    FAILED = "failed"

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    status = db.Column(db.Enum(PostStatus), default=PostStatus.DRAFT)

    # Scheduling
    scheduled_time = db.Column(db.DateTime)
    published_time = db.Column(db.DateTime)

    # Social media specific fields
    platform_post_id = db.Column(db.String(255))  # ID from the platform
    hashtags = db.Column(db.JSON)
    mentions = db.Column(db.JSON)
    media_urls = db.Column(db.JSON)

    # Analytics
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    reach = db.Column(db.Integer, default=0)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # AI Generated content metadata
    ai_generated = db.Column(db.Boolean, default=False)
    ai_prompt = db.Column(db.Text)
    engagement_score = db.Column(db.Float)

    # Relationships
    user = db.relationship('User', backref=db.backref('posts', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'platform': self.platform,
            'status': self.status.value if self.status else None,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'published_time': self.published_time.isoformat() if self.published_time else None,
            'platform_post_id': self.platform_post_id,
            'hashtags': self.hashtags,
            'mentions': self.mentions,
            'media_urls': self.media_urls,
            'likes_count': self.likes_count,
            'comments_count': self.comments_count,
            'shares_count': self.shares_count,
            'reach': self.reach,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'ai_generated': self.ai_generated,
            'engagement_score': self.engagement_score
        }

    def __repr__(self):
        return f'<Post {self.id}: {self.content[:50]}...>'
