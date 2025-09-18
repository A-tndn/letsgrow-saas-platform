from enum import Enum
from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy_utils import ChoiceType
from app.models import db

class SubscriptionStatus(Enum):
    ACTIVE = "active"
    CANCELED = "canceled"  
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"

class BillingCycle(Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class PlanType(Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Stripe fields
    stripe_subscription_id = Column(String(255), unique=True, nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_price_id = Column(String(255), nullable=True)

    # Plan details
    plan_type = Column(ChoiceType(PlanType), nullable=False, default=PlanType.STARTER)
    billing_cycle = Column(ChoiceType(BillingCycle), nullable=False, default=BillingCycle.MONTHLY)
    status = Column(ChoiceType(SubscriptionStatus), nullable=False, default=SubscriptionStatus.TRIALING)

    # Pricing
    amount = Column(Float, nullable=False, default=0.0)  # Amount in dollars
    currency = Column(String(3), nullable=False, default='USD')

    # Dates
    trial_start = Column(DateTime, nullable=True)
    trial_end = Column(DateTime, nullable=True)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

    # Metadata
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="subscription")
    invoices = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Subscription {self.id}: {self.user_id} - {self.plan_type.value} - {self.status.value}>"

    @property
    def is_active(self):
        """Check if subscription is currently active"""
        return self.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]

    @property
    def is_trial(self):
        """Check if subscription is in trial period"""
        return self.status == SubscriptionStatus.TRIALING

    @property
    def days_until_trial_end(self):
        """Get days remaining in trial period"""
        if not self.trial_end or not self.is_trial:
            return 0

        days = (self.trial_end - datetime.utcnow()).days
        return max(0, days)

    @property
    def trial_expired(self):
        """Check if trial period has expired"""
        if not self.trial_end:
            return False
        return datetime.utcnow() > self.trial_end

    def to_dict(self):
        return {
            'id': self.id,
            'plan_type': self.plan_type.value,
            'billing_cycle': self.billing_cycle.value,
            'status': self.status.value,
            'amount': self.amount,
            'currency': self.currency,
            'is_active': self.is_active,
            'is_trial': self.is_trial,
            'trial_end': self.trial_end.isoformat() if self.trial_end else None,
            'current_period_end': self.current_period_end.isoformat() if self.current_period_end else None,
            'days_until_trial_end': self.days_until_trial_end,
            'created_at': self.created_at.isoformat()
        }

class Invoice(db.Model):
    __tablename__ = 'invoices'

    id = Column(Integer, primary_key=True)
    subscription_id = Column(Integer, ForeignKey('subscriptions.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Stripe fields
    stripe_invoice_id = Column(String(255), unique=True, nullable=True)

    # Invoice details
    amount_total = Column(Float, nullable=False)
    amount_paid = Column(Float, nullable=False, default=0.0)
    currency = Column(String(3), nullable=False, default='USD')
    status = Column(String(50), nullable=False)  # paid, open, void, uncollectible

    # Dates
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)

    # Metadata
    description = Column(Text, nullable=True)
    invoice_pdf = Column(String(500), nullable=True)  # URL to PDF
    hosted_invoice_url = Column(String(500), nullable=True)  # Stripe hosted page

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    subscription = relationship("Subscription", back_populates="invoices")
    user = relationship("User")

    def __repr__(self):
        return f"<Invoice {self.id}: {self.amount_total} {self.currency} - {self.status}>"

    def to_dict(self):
        return {
            'id': self.id,
            'amount_total': self.amount_total,
            'amount_paid': self.amount_paid,
            'currency': self.currency,
            'status': self.status,
            'description': self.description,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'invoice_pdf': self.invoice_pdf,
            'hosted_invoice_url': self.hosted_invoice_url,
            'created_at': self.created_at.isoformat()
        }

# Plan configurations
PLAN_CONFIGS = {
    PlanType.STARTER: {
        'name': 'Starter',
        'monthly_price': 19,
        'yearly_price': 15,  # 20% discount
        'features': {
            'social_accounts': 5,
            'ai_posts_per_month': 1000,
            'team_members': 1,
            'support_level': 'email',
            'analytics': 'basic',
            'automation': 'basic'
        }
    },
    PlanType.PROFESSIONAL: {
        'name': 'Professional', 
        'monthly_price': 49,
        'yearly_price': 39,  # 20% discount
        'features': {
            'social_accounts': 15,
            'ai_posts_per_month': 5000,
            'team_members': 3,
            'support_level': 'priority',
            'analytics': 'advanced',
            'automation': 'advanced'
        }
    },
    PlanType.ENTERPRISE: {
        'name': 'Enterprise',
        'monthly_price': 99,
        'yearly_price': 79,  # 20% discount
        'features': {
            'social_accounts': -1,  # unlimited
            'ai_posts_per_month': -1,  # unlimited
            'team_members': -1,  # unlimited
            'support_level': 'dedicated',
            'analytics': 'custom',
            'automation': 'custom'
        }
    }
}

def get_plan_price(plan_type: PlanType, billing_cycle: BillingCycle) -> float:
    """Get price for a plan and billing cycle"""
    config = PLAN_CONFIGS.get(plan_type)
    if not config:
        return 0.0

    if billing_cycle == BillingCycle.YEARLY:
        return config['yearly_price']
    else:
        return config['monthly_price']

def create_trial_subscription(user_id: int, plan_type: PlanType = PlanType.STARTER) -> Subscription:
    """Create a new trial subscription for a user"""

    # Check if user already has an active subscription
    existing = Subscription.query.filter_by(user_id=user_id).filter(
        Subscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING])
    ).first()

    if existing:
        return existing

    # Create new trial subscription
    trial_start = datetime.utcnow()
    trial_end = trial_start + timedelta(days=14)  # 14-day trial

    subscription = Subscription(
        user_id=user_id,
        plan_type=plan_type,
        billing_cycle=BillingCycle.MONTHLY,
        status=SubscriptionStatus.TRIALING,
        amount=0.0,  # Trial is free
        trial_start=trial_start,
        trial_end=trial_end
    )

    db.session.add(subscription)
    db.session.commit()

    return subscription
