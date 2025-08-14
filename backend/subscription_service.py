# Subscription Management Service
import os
from typing import Dict, List
from models import SubscriptionTier, SubscriptionPlan, PaymentTransaction, ReferralReward
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
import uuid
from datetime import datetime

class SubscriptionService:
    def __init__(self, db):
        self.db = db
        self.stripe_api_key = os.environ.get('STRIPE_API_KEY')
        self.subscription_plans = {
            SubscriptionTier.GOLD: SubscriptionPlan(
                id="gold",
                name="Gold Subscription",
                tier=SubscriptionTier.GOLD,
                price=50.0,
                currency="usd",
                features=[
                    "Marketplace creation and selling",
                    "Custom persona creation and editing",
                    "Persistent session history",
                    "Advanced persona settings",
                    "Priority support"
                ]
            ),
            SubscriptionTier.VIP: SubscriptionPlan(
                id="vip",
                name="VIP Subscription", 
                tier=SubscriptionTier.VIP,
                price=100.0,
                currency="usd",
                features=[
                    "All Gold features",
                    "API access and playground",
                    "Advanced analytics dashboard",
                    "Custom integrations",
                    "Access to other Emergent services",
                    "White-label options"
                ]
            ),
            SubscriptionTier.ENTERPRISE: SubscriptionPlan(
                id="enterprise",
                name="Enterprise Subscription",
                tier=SubscriptionTier.ENTERPRISE,
                price=200.0,
                currency="usd",
                features=[
                    "All VIP features",
                    "Unlimited API usage",
                    "Advanced dev dashboard access",
                    "Custom deployment options",
                    "Dedicated support team",
                    "SLA guarantees",
                    "Advanced security features"
                ]
            )
        }
    
    def get_stripe_checkout(self, host_url: str) -> StripeCheckout:
        """Initialize Stripe checkout with webhook URL"""
        webhook_url = f"{host_url}api/webhook/stripe"
        return StripeCheckout(api_key=self.stripe_api_key, webhook_url=webhook_url)
    
    async def create_subscription_checkout(self, user_id: str, tier: SubscriptionTier, origin_url: str, host_url: str):
        """Create Stripe checkout session for subscription"""
        if tier not in self.subscription_plans:
            raise ValueError("Invalid subscription tier")
        
        plan = self.subscription_plans[tier]
        stripe_checkout = self.get_stripe_checkout(host_url)
        
        # Create success and cancel URLs
        success_url = f"{origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/subscription/cancel"
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=plan.price,
            currency=plan.currency,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "subscription_tier": tier.value,
                "plan_id": plan.id
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Store payment transaction
        transaction = PaymentTransaction(
            id=str(uuid.uuid4()),
            user_id=user_id,
            session_id=session.session_id,
            amount=plan.price,
            currency=plan.currency,
            subscription_tier=tier,
            payment_status="pending",
            metadata=checkout_request.metadata
        )
        
        await self.db.payment_transactions.insert_one(transaction.dict())
        
        return session
    
    async def process_successful_payment(self, session_id: str):
        """Process successful subscription payment"""
        # Get transaction
        transaction_doc = await self.db.payment_transactions.find_one(
            {"session_id": session_id}, {"_id": 0}
        )
        
        if not transaction_doc:
            raise ValueError("Transaction not found")
        
        transaction = PaymentTransaction(**transaction_doc)
        
        # Prevent double processing
        if transaction.payment_status == "completed":
            return transaction
        
        # Update user subscription
        await self.db.users.update_one(
            {"id": transaction.user_id},
            {"$set": {
                "subscription_tier": transaction.subscription_tier.value,
                "subscription_status": "active",
                "subscription_id": session_id
            }}
        )
        
        # Update transaction status
        transaction.payment_status = "completed"
        transaction.updated_at = datetime.utcnow()
        
        await self.db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": transaction.dict()}
        )
        
        # Process referral rewards
        await self.process_referral_reward(transaction.user_id, transaction.subscription_tier)
        
        return transaction
    
    async def process_referral_reward(self, user_id: str, subscription_tier: SubscriptionTier):
        """Process referral rewards when user subscribes"""
        user_doc = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user_doc or not user_doc.get("referred_by"):
            return
        
        # Calculate tokens based on subscription tier
        token_rewards = {
            SubscriptionTier.GOLD: 500,
            SubscriptionTier.VIP: 1000,
            SubscriptionTier.ENTERPRISE: 2000
        }
        
        tokens = token_rewards.get(subscription_tier, 0)
        if tokens == 0:
            return
        
        # Award tokens to referrer
        referrer_id = user_doc["referred_by"]
        await self.db.users.update_one(
            {"id": referrer_id},
            {"$inc": {"referral_tokens": tokens}}
        )
        
        # Record referral reward
        reward = ReferralReward(
            id=str(uuid.uuid4()),
            referrer_id=referrer_id,
            referred_user_id=user_id,
            subscription_tier=subscription_tier,
            tokens_awarded=tokens
        )
        
        await self.db.referral_rewards.insert_one(reward.dict())
    
    def get_user_features(self, subscription_tier: SubscriptionTier) -> List[str]:
        """Get features available for subscription tier"""
        if subscription_tier in self.subscription_plans:
            return self.subscription_plans[subscription_tier].features
        return ["Basic parliamentary sessions"]
    
    def can_access_feature(self, user_tier: SubscriptionTier, required_tier: SubscriptionTier) -> bool:
        """Check if user can access feature based on subscription tier"""
        tier_hierarchy = {
            SubscriptionTier.FREE: 0,
            SubscriptionTier.GOLD: 1,
            SubscriptionTier.VIP: 2,
            SubscriptionTier.ENTERPRISE: 3
        }
        
        user_level = tier_hierarchy.get(user_tier, 0)
        required_level = tier_hierarchy.get(required_tier, 0)
        
        return user_level >= required_level