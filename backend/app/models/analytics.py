from app.models import db
from datetime import datetime
from decimal import Decimal

class AnalyticsDaily(db.Model):
    __tablename__ = 'analytics_daily'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    social_account_id = db.Column(db.Integer, db.ForeignKey('social_accounts.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    posts_created = db.Column(db.Integer, default=0)
    posts_published = db.Column(db.Integer, default=0)
    posts_failed = db.Column(db.Integer, default=0)
    total_likes = db.Column(db.Integer, default=0)
    total_comments = db.Column(db.Integer, default=0)
    total_shares = db.Column(db.Integer, default=0)
    total_views = db.Column(db.Integer, default=0)
    followers_gained = db.Column(db.Integer, default=0)
    followers_lost = db.Column(db.Integer, default=0)
    engagement_rate = db.Column(db.Numeric(5, 2), default=0.00)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='analytics')
    social_account = db.relationship('SocialAccount', back_populates='analytics')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'social_account_id', 'date'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'posts_created': self.posts_created,
            'posts_published': self.posts_published,
            'posts_failed': self.posts_failed,
            'total_likes': self.total_likes,
            'total_comments': self.total_comments,
            'total_shares': self.total_shares,
            'total_views': self.total_views,
            'followers_gained': self.followers_gained,
            'followers_lost': self.followers_lost,
            'engagement_rate': float(self.engagement_rate)
        }
