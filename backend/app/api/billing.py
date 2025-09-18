from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from app.models import db, User, Subscription, Invoice, SubscriptionStatus, BillingCycle, PlanType
from app.models.subscription import PLAN_CONFIGS, get_plan_price, create_trial_subscription
from app.utils.helpers import generate_jwt_token
from app.api.auth import get_user_from_token
import stripe
import logging
import os

billing_bp = Blueprint('billing', __name__)
logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

@billing_bp.route('/plans', methods=['GET'])
def get_pricing_plans():
    """Get all available pricing plans"""
    try:
        plans = []
        for plan_type, config in PLAN_CONFIGS.items():
            plan_data = {
                'id': plan_type.value,
                'name': config['name'],
                'monthly_price': config['monthly_price'],
                'yearly_price': config['yearly_price'],
                'features': config['features'],
                'savings_yearly': config['monthly_price'] - config['yearly_price']
            }
            plans.append(plan_data)

        return jsonify({
            'success': True,
            'plans': plans
        }), 200

    except Exception as e:
        logger.error(f"Error fetching pricing plans: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch pricing plans'
        }), 500

@billing_bp.route('/subscription', methods=['GET'])
def get_user_subscription():
    """Get current user's subscription details"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        subscription = Subscription.query.filter_by(user_id=user.id).first()

        if not subscription:
            # Create a trial subscription if none exists
            subscription = create_trial_subscription(user.id)

        return jsonify({
            'success': True,
            'subscription': subscription.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error fetching user subscription: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch subscription'
        }), 500

@billing_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Create Stripe Checkout session for subscription"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        data = request.get_json()
        plan_id = data.get('plan_id')
        billing_cycle = data.get('billing_cycle', 'monthly')

        # Validate plan
        try:
            plan_type = PlanType(plan_id)
            billing_cycle_enum = BillingCycle(billing_cycle)
        except ValueError:
            return jsonify({'success': False, 'error': 'Invalid plan or billing cycle'}), 400

        # Get plan price
        price = get_plan_price(plan_type, billing_cycle_enum)

        if not stripe.api_key:
            # Demo mode - create subscription without Stripe
            return create_demo_subscription(user, plan_type, billing_cycle_enum, price)

        # Create Stripe checkout session
        try:
            # Create or get Stripe customer
            stripe_customer = None
            if user.stripe_customer_id:
                try:
                    stripe_customer = stripe.Customer.retrieve(user.stripe_customer_id)
                except stripe.error.InvalidRequestError:
                    # Customer not found, create new one
                    pass

            if not stripe_customer:
                stripe_customer = stripe.Customer.create(
                    email=user.email,
                    name=f"{user.first_name} {user.last_name}"
                )
                user.stripe_customer_id = stripe_customer.id
                db.session.commit()

            # Create checkout session
            checkout_session = stripe.checkout.Session.create(
                customer=stripe_customer.id,
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f"LetsGrow {PLAN_CONFIGS[plan_type]['name']} Plan",
                            'description': f"{billing_cycle.title()} subscription"
                        },
                        'unit_amount': int(price * 100),  # Stripe uses cents
                        'recurring': {
                            'interval': 'month' if billing_cycle_enum == BillingCycle.MONTHLY else 'year'
                        }
                    },
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/dashboard?checkout=success",
                cancel_url=f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/pricing?checkout=canceled",
                metadata={
                    'user_id': user.id,
                    'plan_id': plan_id,
                    'billing_cycle': billing_cycle
                }
            )

            return jsonify({
                'success': True,
                'checkout_url': checkout_session.url,
                'session_id': checkout_session.id
            }), 200

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Payment processing error'
            }), 500

    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create checkout session'
        }), 500

def create_demo_subscription(user, plan_type, billing_cycle_enum, price):
    """Create a demo subscription when Stripe is not configured"""
    try:
        # Cancel any existing subscription
        existing_subscription = Subscription.query.filter_by(user_id=user.id).first()
        if existing_subscription:
            existing_subscription.status = SubscriptionStatus.CANCELED

        # Create new subscription
        from datetime import datetime, timedelta

        subscription = Subscription(
            user_id=user.id,
            plan_type=plan_type,
            billing_cycle=billing_cycle_enum,
            status=SubscriptionStatus.ACTIVE,
            amount=price,
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30 if billing_cycle_enum == BillingCycle.MONTHLY else 365)
        )

        db.session.add(subscription)
        db.session.commit()

        return jsonify({
            'success': True,
            'demo_mode': True,
            'message': 'Demo subscription created successfully',
            'redirect_url': '/dashboard?checkout=demo-success'
        }), 200

    except Exception as e:
        logger.error(f"Error creating demo subscription: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create demo subscription'
        }), 500

@billing_bp.route('/cancel-subscription', methods=['POST'])
def cancel_subscription():
    """Cancel user's subscription"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        subscription = Subscription.query.filter_by(user_id=user.id).first()
        if not subscription:
            return jsonify({'success': False, 'error': 'No active subscription found'}), 404

        # Cancel in Stripe if applicable
        if subscription.stripe_subscription_id and stripe.api_key:
            try:
                stripe.Subscription.cancel(subscription.stripe_subscription_id)
            except stripe.error.StripeError as e:
                logger.error(f"Stripe cancellation error: {str(e)}")

        # Update local subscription
        from datetime import datetime
        subscription.status = SubscriptionStatus.CANCELED
        subscription.canceled_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Subscription canceled successfully'
        }), 200

    except Exception as e:
        logger.error(f"Error canceling subscription: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to cancel subscription'
        }), 500

@billing_bp.route('/invoices', methods=['GET'])
def get_user_invoices():
    """Get user's billing history/invoices"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401

        invoices = Invoice.query.filter_by(user_id=user.id).order_by(Invoice.created_at.desc()).all()

        return jsonify({
            'success': True,
            'invoices': [invoice.to_dict() for invoice in invoices]
        }), 200

    except Exception as e:
        logger.error(f"Error fetching invoices: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch invoices'
        }), 500

@billing_bp.route('/webhook', methods=['POST'])
@cross_origin()
def stripe_webhook():
    """Handle Stripe webhook events"""
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')

    if not stripe.api_key or not endpoint_secret:
        logger.warning("Stripe webhook called but Stripe not configured")
        return jsonify({'success': True}), 200

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        logger.error("Invalid payload in Stripe webhook")
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature in Stripe webhook")
        return jsonify({'error': 'Invalid signature'}), 400

    # Handle the event
    try:
        if event['type'] == 'checkout.session.completed':
            handle_checkout_completed(event['data']['object'])
        elif event['type'] == 'invoice.payment_succeeded':
            handle_payment_succeeded(event['data']['object'])
        elif event['type'] == 'invoice.payment_failed':
            handle_payment_failed(event['data']['object'])
        elif event['type'] == 'customer.subscription.updated':
            handle_subscription_updated(event['data']['object'])
        elif event['type'] == 'customer.subscription.deleted':
            handle_subscription_deleted(event['data']['object'])
        else:
            logger.info(f"Unhandled Stripe webhook event: {event['type']}")

    except Exception as e:
        logger.error(f"Error processing Stripe webhook: {str(e)}")
        return jsonify({'error': 'Webhook processing failed'}), 500

    return jsonify({'success': True}), 200

def handle_checkout_completed(session):
    """Handle successful checkout completion"""
    try:
        user_id = session['metadata'].get('user_id')
        plan_id = session['metadata'].get('plan_id')
        billing_cycle = session['metadata'].get('billing_cycle')

        if not user_id:
            logger.error("Missing user_id in checkout session metadata")
            return

        user = User.query.get(user_id)
        if not user:
            logger.error(f"User {user_id} not found for checkout session")
            return

        # Get or create subscription from Stripe
        stripe_subscription = stripe.Subscription.retrieve(session['subscription'])

        # Update or create local subscription
        subscription = Subscription.query.filter_by(user_id=user_id).first()
        if not subscription:
            subscription = Subscription(user_id=user_id)
            db.session.add(subscription)

        # Update subscription details
        plan_type = PlanType(plan_id)
        billing_cycle_enum = BillingCycle(billing_cycle)

        subscription.stripe_subscription_id = stripe_subscription.id
        subscription.stripe_customer_id = session['customer']
        subscription.plan_type = plan_type
        subscription.billing_cycle = billing_cycle_enum
        subscription.status = SubscriptionStatus.ACTIVE
        subscription.amount = get_plan_price(plan_type, billing_cycle_enum)

        from datetime import datetime
        subscription.current_period_start = datetime.fromtimestamp(stripe_subscription['current_period_start'])
        subscription.current_period_end = datetime.fromtimestamp(stripe_subscription['current_period_end'])

        db.session.commit()
        logger.info(f"Subscription activated for user {user_id}")

    except Exception as e:
        logger.error(f"Error handling checkout completion: {str(e)}")

def handle_payment_succeeded(invoice):
    """Handle successful payment"""
    # Implementation for payment success
    logger.info(f"Payment succeeded for invoice {invoice['id']}")

def handle_payment_failed(invoice):
    """Handle failed payment"""
    # Implementation for payment failure
    logger.warning(f"Payment failed for invoice {invoice['id']}")

def handle_subscription_updated(subscription):
    """Handle subscription updates"""
    # Implementation for subscription updates
    logger.info(f"Subscription updated: {subscription['id']}")

def handle_subscription_deleted(subscription):
    """Handle subscription cancellation"""
    # Implementation for subscription deletion
    logger.info(f"Subscription deleted: {subscription['id']}")
