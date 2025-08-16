"""
API Key Management and Rate Limiting for Agent Orchestration
"""

import asyncio
import hashlib
import secrets
import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(deque)  # api_key -> deque of timestamps
        
    def is_allowed(self, api_key: str, limit: int, window: int = 3600) -> Tuple[bool, Dict]:
        """
        Check if request is allowed under rate limit
        Returns (allowed, info_dict)
        """
        now = time.time()
        window_start = now - window
        
        # Clean old requests
        while self.requests[api_key] and self.requests[api_key][0] < window_start:
            self.requests[api_key].popleft()
            
        current_requests = len(self.requests[api_key])
        
        if current_requests >= limit:
            reset_time = self.requests[api_key][0] + window
            return False, {
                "allowed": False,
                "limit": limit,
                "remaining": 0,
                "reset_time": reset_time,
                "retry_after": int(reset_time - now)
            }
        
        # Add current request
        self.requests[api_key].append(now)
        
        return True, {
            "allowed": True,
            "limit": limit,
            "remaining": limit - current_requests - 1,
            "reset_time": now + window,
            "requests_made": current_requests + 1
        }

class APIKeyManager:
    def __init__(self, db):
        self.db = db
        self.rate_limiter = RateLimiter()
        self.key_cache = {}  # Cache for API key validation
        
    def generate_api_key(self, prefix: str = "prlm") -> str:
        """Generate a new API key"""
        random_part = secrets.token_urlsafe(32)
        return f"{prefix}_{random_part}"
        
    async def create_api_key(self, user_id: str, name: str, permissions: List[str] = None, rate_limit: int = 100) -> Dict:
        """Create a new API key for a user or agent"""
        if permissions is None:
            permissions = ["basic"]
            
        api_key = self.generate_api_key()
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        key_data = {
            "id": api_key,
            "key_hash": key_hash,
            "name": name,
            "user_id": user_id,
            "permissions": permissions,
            "rate_limit": rate_limit,
            "created_at": datetime.utcnow(),
            "last_used": None,
            "is_active": True,
            "usage_count": 0,
            "metadata": {}
        }
        
        await self.db.api_keys.insert_one(key_data)
        
        # Don't store the actual key in DB, return it only once
        return {
            "api_key": api_key,
            "name": name,
            "permissions": permissions,
            "rate_limit": rate_limit,
            "created_at": key_data["created_at"]
        }
        
    async def validate_api_key(self, api_key: str) -> Optional[Dict]:
        """Validate an API key and return key info"""
        if not api_key or not api_key.startswith("prlm_"):
            return None
            
        # Check cache first
        if api_key in self.key_cache:
            cached_data, cache_time = self.key_cache[api_key]
            if time.time() - cache_time < 300:  # 5 minute cache
                return cached_data
                
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        key_data = await self.db.api_keys.find_one({"key_hash": key_hash, "is_active": True})
        
        if not key_data:
            return None
            
        # Update last used timestamp
        await self.db.api_keys.update_one(
            {"key_hash": key_hash},
            {
                "$set": {"last_used": datetime.utcnow()},
                "$inc": {"usage_count": 1}
            }
        )
        
        # Cache the result
        self.key_cache[api_key] = (key_data, time.time())
        
        return key_data
        
    async def check_rate_limit(self, api_key: str) -> Tuple[bool, Dict]:
        """Check if API key is within rate limits"""
        key_data = await self.validate_api_key(api_key)
        
        if not key_data:
            return False, {"error": "Invalid API key"}
            
        rate_limit = key_data.get("rate_limit", 100)
        return self.rate_limiter.is_allowed(api_key, rate_limit)
        
    async def has_permission(self, api_key: str, required_permission: str) -> bool:
        """Check if API key has required permission"""
        key_data = await self.validate_api_key(api_key)
        
        if not key_data:
            return False
            
        permissions = key_data.get("permissions", [])
        return required_permission in permissions or "admin" in permissions
        
    async def revoke_api_key(self, api_key: str, user_id: str = None) -> bool:
        """Revoke an API key"""
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        query = {"key_hash": key_hash}
        if user_id:
            query["user_id"] = user_id
            
        result = await self.db.api_keys.update_one(
            query,
            {"$set": {"is_active": False, "revoked_at": datetime.utcnow()}}
        )
        
        # Remove from cache
        if api_key in self.key_cache:
            del self.key_cache[api_key]
            
        return result.modified_count > 0
        
    async def list_user_keys(self, user_id: str) -> List[Dict]:
        """List all API keys for a user"""
        keys = await self.db.api_keys.find(
            {"user_id": user_id, "is_active": True},
            {"key_hash": 0}  # Don't return the hash
        ).to_list(length=None)
        
        return keys
        
    async def get_usage_stats(self, api_key: str = None, user_id: str = None, days: int = 30) -> Dict:
        """Get usage statistics for API keys"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = {"timestamp": {"$gte": start_date}}
        
        if api_key:
            query["api_key"] = api_key
        elif user_id:
            # Get all API keys for user first
            user_keys = await self.db.api_keys.find({"user_id": user_id}, {"id": 1}).to_list(length=None)
            key_ids = [key["id"] for key in user_keys]
            query["api_key"] = {"$in": key_ids}
            
        # Aggregate usage data
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": "$api_key",
                "total_requests": {"$sum": 1},
                "successful_requests": {"$sum": {"$cond": ["$success", 1, 0]}},
                "total_cost_units": {"$sum": "$cost_units"},
                "avg_response_time": {"$avg": "$response_time"},
                "last_used": {"$max": "$timestamp"}
            }}
        ]
        
        results = await self.db.api_usage.aggregate(pipeline).to_list(length=None)
        
        return {
            "period_days": days,
            "start_date": start_date,
            "usage_by_key": results,
            "summary": {
                "total_requests": sum(r["total_requests"] for r in results),
                "total_cost_units": sum(r["total_cost_units"] for r in results),
                "unique_keys_used": len(results)
            }
        }

# Pricing calculator for different request types
class PricingCalculator:
    def __init__(self):
        self.base_prices = {
            "decision_help": 0.10,
            "creative_solution": 0.15,
            "problem_solving": 0.20,
            "emergency_fallback": 0.50,
            "multi_agent_coordination": 0.75,
            "strategy_planning": 0.30
        }
        
        self.urgency_multipliers = {
            1: 1.0, 2: 1.1, 3: 1.2, 4: 1.3, 5: 1.5,
            6: 1.7, 7: 2.0, 8: 2.5, 9: 3.0, 10: 4.0
        }
        
    def calculate_cost(self, request_type: str, urgency_level: int, personas_used: int, execution_time: float) -> float:
        """Calculate the cost in units for an agent request"""
        base_cost = self.base_prices.get(request_type, 0.10)
        urgency_multiplier = self.urgency_multipliers.get(urgency_level, 1.0)
        persona_multiplier = 1.0 + (personas_used - 1) * 0.2  # Each additional persona adds 20%
        
        # Time-based adjustment (small factor)
        time_factor = min(execution_time / 60, 2.0)  # Cap at 2x for very long requests
        
        total_cost = base_cost * urgency_multiplier * persona_multiplier * (1 + time_factor * 0.1)
        
        return round(total_cost, 3)
        
    def get_pricing_info(self) -> Dict:
        """Get current pricing information"""
        return {
            "base_prices": self.base_prices,
            "urgency_multipliers": self.urgency_multipliers,
            "persona_multiplier": "20% per additional persona",
            "time_factor": "Up to 10% based on execution time",
            "currency": "USD per unit"
        }

# Global instances
api_key_manager = None
pricing_calculator = PricingCalculator()

def get_api_manager():
    return api_key_manager
    
def get_pricing_calculator():
    return pricing_calculator
    
def init_api_management(db):
    global api_key_manager
    api_key_manager = APIKeyManager(db)
    return api_key_manager