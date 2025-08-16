"""
Complete Token Tracking & Revenue Protection System
Every computation tracked, every cent captured
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel
from collections import defaultdict
import json

class TokenUsage(BaseModel):
    id: str = None
    user_id: str
    session_id: str
    action_type: str  # "meeting_creation", "persona_response", "image_generation", "api_call"
    tokens_used: int
    cost_usd: float
    model_used: str
    timestamp: datetime
    success: bool = True
    metadata: Dict = {}

class UserCredits(BaseModel):
    user_id: str
    total_credits: float = 0.0
    used_credits: float = 0.0
    remaining_credits: float = 0.0
    subscription_tier: str = "free"
    last_updated: datetime
    billing_cycle_start: datetime
    auto_recharge: bool = False

class TokenTracker:
    def __init__(self, db):
        self.db = db
        self.pricing = {
            "meeting_creation": 0.10,
            "persona_response": 0.02,
            "image_generation": 0.15,
            "api_call_basic": 0.05,
            "api_call_emergency": 0.50,
            "audio_generation": 0.08
        }
        self.tier_limits = {
            "free": 100,  # credits per month
            "gold": -1,   # unlimited
            "vip": -1,    # unlimited  
            "enterprise": -1  # unlimited
        }
        
    async def track_usage(self, user_id: str, session_id: str, action_type: str, 
                         tokens_used: int = 0, model_used: str = "default", 
                         metadata: Dict = None) -> Tuple[bool, float]:
        """Track token usage and return (success, cost)"""
        try:
            # Calculate cost
            base_cost = self.pricing.get(action_type, 0.01)
            token_multiplier = max(1.0, tokens_used / 1000)  # Scale with token usage
            total_cost = base_cost * token_multiplier
            
            # Check user credits
            user_credits = await self.get_user_credits(user_id)
            if not await self.can_afford(user_credits, total_cost):
                return False, total_cost
            
            # Record usage
            usage = TokenUsage(
                id=str(uuid.uuid4()),
                user_id=user_id,
                session_id=session_id,
                action_type=action_type,
                tokens_used=tokens_used,
                cost_usd=total_cost,
                model_used=model_used,
                timestamp=datetime.utcnow(),
                success=True,
                metadata=metadata or {}
            )
            
            await self.db.token_usage.insert_one(usage.dict())
            await self.deduct_credits(user_id, total_cost)
            
            return True, total_cost
            
        except Exception as e:
            # Record failed usage for debugging
            failed_usage = TokenUsage(
                id=str(uuid.uuid4()),
                user_id=user_id,
                session_id=session_id,
                action_type=action_type,
                tokens_used=0,
                cost_usd=0.0,
                model_used=model_used,
                timestamp=datetime.utcnow(),
                success=False,
                metadata={"error": str(e)}
            )
            await self.db.token_usage.insert_one(failed_usage.dict())
            return False, 0.0
    
    async def get_user_credits(self, user_id: str) -> UserCredits:
        """Get current user credit status"""
        credits_data = await self.db.user_credits.find_one({"user_id": user_id})
        
        if not credits_data:
            # Initialize new user credits
            user = await self.db.users.find_one({"id": user_id})
            tier = user.get("subscription_tier", "free") if user else "free"
            
            credits = UserCredits(
                user_id=user_id,
                total_credits=self.tier_limits.get(tier, 100),
                used_credits=0.0,
                remaining_credits=self.tier_limits.get(tier, 100),
                subscription_tier=tier,
                last_updated=datetime.utcnow(),
                billing_cycle_start=datetime.utcnow(),
                auto_recharge=tier != "free"
            )
            
            await self.db.user_credits.insert_one(credits.dict())
            return credits
            
        return UserCredits(**credits_data)
    
    async def can_afford(self, user_credits: UserCredits, cost: float) -> bool:
        """Check if user can afford the action"""
        if user_credits.subscription_tier != "free":
            return True  # Unlimited for paid tiers
        
        return user_credits.remaining_credits >= cost
    
    async def deduct_credits(self, user_id: str, cost: float):
        """Deduct credits from user account"""
        await self.db.user_credits.update_one(
            {"user_id": user_id},
            {
                "$inc": {
                    "used_credits": cost,
                    "remaining_credits": -cost
                },
                "$set": {"last_updated": datetime.utcnow()}
            }
        )
    
    async def get_usage_stats(self, user_id: str, days: int = 30) -> Dict:
        """Get detailed usage statistics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "timestamp": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": "$action_type",
                    "total_cost": {"$sum": "$cost_usd"},
                    "total_tokens": {"$sum": "$tokens_used"},
                    "count": {"$sum": 1},
                    "avg_cost": {"$avg": "$cost_usd"}
                }
            }
        ]
        
        usage_by_type = await self.db.token_usage.aggregate(pipeline).to_list(length=None)
        
        # Calculate totals
        total_cost = sum(item["total_cost"] for item in usage_by_type)
        total_actions = sum(item["count"] for item in usage_by_type)
        
        return {
            "period_days": days,
            "total_cost": round(total_cost, 4),
            "total_actions": total_actions,
            "usage_by_type": usage_by_type,
            "average_cost_per_action": round(total_cost / max(total_actions, 1), 4)
        }
    
    async def generate_upgrade_prompt(self, user_id: str) -> Optional[Dict]:
        """Generate upgrade prompt when user hits limits"""
        credits = await self.get_user_credits(user_id)
        
        if credits.subscription_tier != "free":
            return None
            
        if credits.remaining_credits <= 5:  # Low credits warning
            return {
                "type": "low_credits",
                "message": f"Only {credits.remaining_credits:.1f} credits remaining",
                "action": "Upgrade to Gold for unlimited usage",
                "upgrade_url": "/subscription",
                "savings": "Save $50+ per month vs pay-per-use"
            }
        
        return None
    
    async def process_subscription_change(self, user_id: str, new_tier: str):
        """Handle subscription tier changes"""
        new_credits = self.tier_limits.get(new_tier, 100)
        
        await self.db.user_credits.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "subscription_tier": new_tier,
                    "total_credits": new_credits,
                    "remaining_credits": new_credits if new_tier == "free" else 999999,
                    "billing_cycle_start": datetime.utcnow(),
                    "auto_recharge": new_tier != "free",
                    "last_updated": datetime.utcnow()
                }
            }
        )

# Global token tracker instance
token_tracker = None

def get_token_tracker():
    return token_tracker

def init_token_tracker(db):
    global token_tracker
    token_tracker = TokenTracker(db)
    return token_tracker