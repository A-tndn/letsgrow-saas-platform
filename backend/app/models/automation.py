from app.models import db
from datetime import datetime
from enum import Enum

class AutomationStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    INACTIVE = "inactive"
    ERROR = "error"

class Automation(db.Model):
    __tablename__ = 'automations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    platforms = db.Column(db.ARRAY(db.String(50)), nullable=False)
    content_settings = db.Column(db.JSON, nullable=False)
    posting_schedule = db.Column(db.JSON, nullable=False)
    ai_settings = db.Column(db.JSON)
    hashtag_settings = db.Column(db.JSON)
    status = db.Column(db.Enum(AutomationStatus), default=AutomationStatus.ACTIVE)
    last_run = db.Column(db.DateTime)
    next_run = db.Column(db.DateTime)
    run_count = db.Column(db.Integer, default=0)
    error_count = db.Column(db.Integer, default=0)
    last_error = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='automations')
    content_queue = db.relationship('ContentQueue', back_populates='automation')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'platforms': self.platforms,
            'content_settings': self.content_settings,
            'posting_schedule': self.posting_schedule,
            'status': self.status.value,
            'last_run': self.last_run.isoformat() if self.last_run else None,
            'next_run': self.next_run.isoformat() if self.next_run else None,
            'run_count': self.run_count,
            'error_count': self.error_count,
            'created_at': self.created_at.isoformat()
        }
