import asyncio
import json
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timedelta
import uuid
import base64
import random
from typing import Optional, List, Dict, Any
import logging
import traceback
from pydantic import BaseModel
from fastapi import APIRouter
import psutil
import re
from io import StringIO
import sys
import contextlib
from auth import AuthService
from models import *
from pydantic import Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Parliamentarium API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
api_router = APIRouter(prefix="/api")

# Database setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'parliamentarium')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Initialize services
auth_service = AuthService(db)

# Temporary placeholders until we fix emergentintegrations
class MockOrchestrator:
    async def process_agent_request(self, request): return {"status": "mock"}
    async def coordinate_multi_agents(self, agents, task): return {"status": "mock"}
    async def emergency_fallback(self, agent, context, time_limit): return {"status": "mock"}

class MockAnalytics:
    async def track_event(self, *args, **kwargs): pass
    async def get_user_journey(self, *args, **kwargs): return {"status": "mock"}
    async def get_platform_insights(self, *args, **kwargs): return {"status": "mock"}
    async def get_conversation_trends(self, *args, **kwargs): return {"status": "mock"}
    async def analyze_conversation_quality(self, *args, **kwargs): return {"status": "mock"}

class MockAPIManager:
    async def validate_api_key(self, key): return None
    async def check_rate_limit(self, key): return True, {}
    async def create_api_key(self, *args, **kwargs): return {"status": "mock"}
    async def list_user_keys(self, *args, **kwargs): return []
    async def revoke_api_key(self, *args, **kwargs): return True
    async def get_usage_stats(self, *args, **kwargs): return {"status": "mock"}

orchestrator = MockOrchestrator()
api_manager = MockAPIManager() 
usage_analytics = MockAnalytics()
conversation_intel = MockAnalytics()

# LLM Configuration
LLM_KEYS = {
    'gemini_1': os.environ.get('GEMINI_API_KEY_1'),
    'gemini_2': os.environ.get('GEMINI_API_KEY_2'),
    'gemini_3': os.environ.get('GEMINI_API_KEY_3'),
    'gemini_4': os.environ.get('GEMINI_API_KEY_4'),
    'gemini_5': os.environ.get('GEMINI_API_KEY_5'),
    'emergent_llm': os.environ.get('EMERGENT_LLM_KEY'),
}

FAL_API_KEY = os.environ.get('FAL_API_KEY')

# Enhanced persona configurations for agent orchestration
PERSONAS_CONFIG = {
    "mouse": {
        "name": "The Mouse",
        "role": "Historian & Decision Anchor",
        "strengths": ["precedent_analysis", "risk_assessment", "institutional_memory"],
        "response_time": "fast",
        "reliability": 0.95
    },
    "dolphin": {
        "name": "The Dolphin",
        "role": "Trend Forecaster",
        "strengths": ["future_planning", "trend_analysis", "outcome_prediction"],
        "response_time": "medium",
        "reliability": 0.90
    },
    "patternist": {
        "name": "The Patternist",
        "role": "Systems Analyst",
        "strengths": ["pattern_recognition", "system_analysis", "root_cause"],
        "response_time": "fast",
        "reliability": 0.93
    },
    "contextualist": {
        "name": "The Contextualist",
        "role": "Integration Master",
        "strengths": ["holistic_thinking", "practical_solutions", "integration"],
        "response_time": "medium",
        "reliability": 0.97
    },
    "superscholar": {
        "name": "The Superscholar",
        "role": "Meta Intelligence",
        "strengths": ["complex_analysis", "interdisciplinary", "research"],
        "response_time": "slow",
        "reliability": 0.85
    },
    "diviner": {
        "name": "The Diviner",
        "role": "Creative Insights",
        "strengths": ["intuition", "creative_solutions", "unconventional"],
        "response_time": "variable",
        "reliability": 0.80
    },
    "naysayer": {
        "name": "The Naysayer",
        "role": "Critical Analysis",
        "strengths": ["risk_identification", "devil_advocate", "validation"],
        "response_time": "fast",
        "reliability": 0.88
    },
    "illustrator": {
        "name": "The Court Illustrator",
        "role": "Visual Communication",
        "strengths": ["visualization", "communication", "storytelling"],
        "response_time": "medium",
        "reliability": 0.82
    },
    "id": {
        "name": "The ID",
        "role": "Authentic Voice",
        "strengths": ["authenticity", "raw_insight", "breakthrough"],
        "response_time": "fast",
        "reliability": 0.75
    },
    "ego": {
        "name": "The EGO",
        "role": "Practical Mediator",
        "strengths": ["balance", "pragmatism", "feasibility"],
        "response_time": "medium",
        "reliability": 0.90
    },
    "superego": {
        "name": "The SUPEREGO",
        "role": "Ethical Guardian",
        "strengths": ["ethics", "compliance", "standards"],
        "response_time": "medium",
        "reliability": 0.92
    }
}

# Subscription service for feature gating
class SubscriptionService:
    @staticmethod
    def get_user_features(subscription_tier: str) -> Dict[str, bool]:
        features = {
            'basic_meetings': True,
            'audio_streaming': subscription_tier in ['gold', 'vip', 'enterprise'],
            'marketplace_create': subscription_tier in ['gold', 'vip', 'enterprise'],
            'persona_images': subscription_tier in ['gold', 'vip', 'enterprise'],
            'api_access': subscription_tier in ['vip', 'enterprise'],
            'analytics_advanced': subscription_tier in ['vip', 'enterprise'],
            'white_label': subscription_tier == 'enterprise',
            'priority_support': subscription_tier in ['vip', 'enterprise'],
            'agent_orchestration': subscription_tier in ['gold', 'vip', 'enterprise'],
            'emergency_fallback': subscription_tier in ['vip', 'enterprise']
        }
        return features

    @staticmethod
    def check_feature_access(user: User, feature: str) -> bool:
        features = SubscriptionService.get_user_features(user.subscription_tier)
        return features.get(feature, False)

subscription_service = SubscriptionService()

# Enhanced authentication with API key support
async def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    if authorization.startswith("Bearer "):
        token = authorization[7:]
        if token.startswith("prlm_"):
            # API key authentication for agents
            key_data = await api_manager.validate_api_key(token)
            if not key_data:
                raise HTTPException(status_code=401, detail="Invalid API key")
            
            # Create a virtual user for API key access
            return User(
                id=key_data["user_id"] or "api_user",
                email=f"api@{key_data.get('name', 'unknown')}.agent",
                subscription_tier=SubscriptionTier.VIP,  # API keys get VIP access
                role="agent"
            )
        else:
            # JWT token authentication for regular users
            user = await auth_service.get_current_user(token)
            if not user:
                raise HTTPException(status_code=401, detail="Invalid token")
            return user
    
    raise HTTPException(status_code=401, detail="Invalid authorization format")

async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[User]:
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except:
        return None

def require_subscription(min_tier: SubscriptionTier):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            tier_levels = {"free": 0, "gold": 1, "vip": 2, "enterprise": 3}
            if tier_levels.get(current_user.subscription_tier, 0) < tier_levels.get(min_tier.value, 0):
                raise HTTPException(status_code=403, detail=f"{min_tier.value} subscription required")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# ============================================================================
# AGENT ORCHESTRATION API ENDPOINTS - THE BRAIN FOR ALL AI AGENTS
# ============================================================================

@api_router.post("/agent/request-council")
async def request_council(
    request: AgentRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Main endpoint for external agents to request parliamentary assistance
    This is where ANY AI agent can call for help when stuck
    """
    try:
        # Validate API key permissions and rate limits
        if current_user.role == "agent":
            # Check rate limits for API key usage
            api_key = request.api_key
            allowed, rate_info = await api_manager.check_rate_limit(api_key)
            if not allowed:
                return JSONResponse(
                    status_code=429,
                    content={"error": "Rate limit exceeded", "rate_limit_info": rate_info}
                )
        
        # Track the incoming request
        await usage_analytics.track_event(
            "agent_request_received",
            user_id=current_user.id,
            data={
                "agent_name": request.agent_name,
                "request_type": request.request_type,
                "urgency_level": request.urgency_level
            }
        )
        
        # Process the request through the orchestrator
        response = await orchestrator.process_agent_request(request)
        
        # Track successful response
        await usage_analytics.track_event(
            "agent_response_completed",
            user_id=current_user.id,
            session_id=response.session_id,
            data={
                "execution_time": response.execution_time,
                "confidence_score": response.confidence_score,
                "personas_used": len(response.participating_personas)
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Agent request failed: {str(e)}")
        await usage_analytics.track_event(
            "agent_request_failed",
            user_id=current_user.id,
            data={"error": str(e), "agent_name": request.agent_name}
        )
        raise HTTPException(status_code=500, detail=f"Agent request failed: {str(e)}")

@api_router.post("/agent/emergency-fallback")
async def emergency_fallback(
    fallback_request: EmergencyFallback,
    current_user: User = Depends(get_current_user)
):
    """
    Emergency endpoint for when other AI agents completely fail
    Ultra-fast response with highest priority
    """
    try:
        # Check if user has emergency access
        if not subscription_service.check_feature_access(current_user, 'emergency_fallback'):
            raise HTTPException(status_code=403, detail="Emergency fallback requires VIP+ subscription")
        
        # Track emergency request
        await usage_analytics.track_event(
            "emergency_fallback_requested", 
            user_id=current_user.id,
            data={
                "failed_agent": fallback_request.failed_agent,
                "severity_level": fallback_request.severity_level
            }
        )
        
        # Process emergency request
        response = await orchestrator.emergency_fallback(
            fallback_request.failed_agent,
            fallback_request.failure_context,
            fallback_request.time_limit
        )
        
        # Add emergency metadata
        response.metadata["emergency"] = True
        response.metadata["severity"] = fallback_request.severity_level
        response.cost_units = response.cost_units * 2 if response.cost_units else 2.0  # Emergency surcharge
        
        return response
        
    except Exception as e:
        logger.error(f"Emergency fallback failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Emergency response failed: {str(e)}")

@api_router.post("/agent/coordinate-multi")
async def coordinate_multi_agents(
    coordination: MultiAgentCoordination,
    current_user: User = Depends(get_current_user)
):
    """
    Orchestrate multiple AI agents working on complex tasks
    The parliament becomes the coordination brain
    """
    try:
        # Check feature access
        if not subscription_service.check_feature_access(current_user, 'agent_orchestration'):
            raise HTTPException(status_code=403, detail="Multi-agent coordination requires Gold+ subscription")
        
        # Track coordination request
        await usage_analytics.track_event(
            "multi_agent_coordination",
            user_id=current_user.id,
            data={
                "agent_count": len(coordination.agents),
                "priority_level": coordination.priority_level
            }
        )
        
        # Process coordination
        result = await orchestrator.coordinate_multi_agents(
            coordination.agents,
            coordination.coordination_task
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Multi-agent coordination failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Coordination failed: {str(e)}")

@api_router.get("/agent/pricing")
async def get_agent_pricing():
    """Get current pricing for agent orchestration services"""
    pricing_calc = api_manager.rate_limiter  # This should be pricing_calculator
    return {
        "pricing_model": "pay_per_use",
        "base_prices": {
            "decision_help": 0.10,
            "creative_solution": 0.15,
            "problem_solving": 0.20,
            "emergency_fallback": 0.50,
            "multi_agent_coordination": 0.75,
            "strategy_planning": 0.30
        },
        "urgency_multipliers": {
            "1-3": "1.0x - 1.2x",
            "4-6": "1.3x - 1.7x", 
            "7-9": "2.0x - 3.0x",
            "10": "4.0x (Emergency)"
        },
        "additional_factors": {
            "personas_used": "20% per additional persona",
            "execution_time": "Up to 10% based on duration",
            "api_key_tier": "Different rate limits apply"
        },
        "currency": "USD"
    }

# ============================================================================
# USAGE ANALYTICS AND INTELLIGENCE ENDPOINTS
# ============================================================================

@api_router.get("/analytics/conversation/{session_id}")
async def get_conversation_analysis(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed analysis of a specific conversation"""
    try:
        analysis = await conversation_intel.analyze_conversation_quality(session_id)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.get("/analytics/user-journey")
async def get_user_journey(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user)
):
    """Get detailed user journey analytics"""
    try:
        journey = await usage_analytics.get_user_journey(current_user.id, days)
        return journey
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Journey analysis failed: {str(e)}")

@api_router.get("/analytics/platform-insights")
async def get_platform_insights(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_user)
):
    """Get platform-wide analytics (admin/dev only)"""
    if not current_user.is_dev and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        insights = await usage_analytics.get_platform_insights(days)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Platform insights failed: {str(e)}")

@api_router.get("/analytics/conversation-trends")
async def get_conversation_trends(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user)
):
    """Get conversation trends and popular topics"""
    try:
        trends = await usage_analytics.get_conversation_trends(days)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trends analysis failed: {str(e)}")

# ============================================================================
# API KEY MANAGEMENT ENDPOINTS
# ============================================================================

@api_router.post("/api-keys/create")
async def create_api_key(
    key_request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Create a new API key for agent integration"""
    try:
        # Check if user can create API keys
        if not subscription_service.check_feature_access(current_user, 'api_access'):
            raise HTTPException(status_code=403, detail="API access requires VIP+ subscription")
        
        name = key_request.get("name", "Untitled Key")
        permissions = key_request.get("permissions", ["basic"])
        rate_limit = key_request.get("rate_limit", 100)
        
        # Create the API key
        api_key_data = await api_manager.create_api_key(
            user_id=current_user.id,
            name=name,
            permissions=permissions,
            rate_limit=rate_limit
        )
        
        # Track API key creation
        await usage_analytics.track_event(
            "api_key_created",
            user_id=current_user.id,
            data={"key_name": name, "permissions": permissions}
        )
        
        return api_key_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API key creation failed: {str(e)}")

@api_router.get("/api-keys/list")
async def list_api_keys(current_user: User = Depends(get_current_user)):
    """List all API keys for the current user"""
    try:
        keys = await api_manager.list_user_keys(current_user.id)
        return {"api_keys": keys}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list API keys: {str(e)}")

@api_router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user)
):
    """Revoke an API key"""
    try:
        success = await api_manager.revoke_api_key(key_id, current_user.id)
        if success:
            await usage_analytics.track_event(
                "api_key_revoked",
                user_id=current_user.id,
                data={"key_id": key_id}
            )
            return {"message": "API key revoked successfully"}
        else:
            raise HTTPException(status_code=404, detail="API key not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to revoke API key: {str(e)}")

@api_router.get("/api-keys/usage/{key_id}")
async def get_api_key_usage(
    key_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user)
):
    """Get usage statistics for a specific API key"""
    try:
        usage_stats = await api_manager.get_usage_stats(api_key=key_id, days=days)
        return usage_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage stats: {str(e)}")

# ============================================================================
# SAAS PLATFORM ENDPOINTS
# ============================================================================

# Authentication Endpoints
@api_router.post("/auth/login")
async def login(request: LoginRequest):
    """Login or register user with automatic dev status assignment for first 5 users"""
    try:
        user = await auth_service.authenticate_user(request.email)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication failed")
        
        # Create JWT token
        token_data = {"sub": user.email, "user_id": user.id}
        access_token = auth_service.create_access_token(token_data)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user.dict(),
            "message": "Dev access granted!" if user.is_dev and user.dev_granted_at else "Welcome!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/register")
async def register(request: LoginRequest):
    """Register new user (same logic as login - auto-creates if doesn't exist)"""
    try:
        user = await auth_service.authenticate_user(request.email)
        if not user:
            raise HTTPException(status_code=401, detail="Registration failed")
        
        # Create JWT token
        token_data = {"sub": user.email, "user_id": user.id}
        access_token = auth_service.create_access_token(token_data)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user.dict(),
            "message": "Account created! " + ("Dev access granted!" if user.is_dev and user.dev_granted_at else "Welcome!")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "user": current_user.dict(),
        "features": subscription_service.get_user_features(current_user.subscription_tier)
    }

# Subscription Endpoints
@api_router.get("/subscription/features")
async def get_subscription_features(current_user: User = Depends(get_current_user)):
    """Get available features for current subscription"""
    return subscription_service.get_user_features(current_user.subscription_tier)

# Marketplace categories with pricing constraints
MARKETPLACE_CATEGORIES = {
    'persona': {'min_price': 10.0, 'max_price': None, 'name': '🎭 Custom Personas'},
    'template': {'min_price': 5.0, 'max_price': None, 'name': '📋 Discussion Templates'},  
    'workflow': {'min_price': 15.0, 'max_price': None, 'name': '⚙️ Custom Workflows'},
    'install_new_government': {'min_price': 25.0, 'max_price': 500.0, 'name': '🏛️ Install New Government'}
}

# Add endpoint to get marketplace categories with constraints
@api_router.get("/marketplace/categories")
async def get_marketplace_categories():
    """Get marketplace categories with pricing constraints"""
    return {"categories": MARKETPLACE_CATEGORIES}

# Add persona image generation endpoint for users
@api_router.post("/generate-persona-image")
async def generate_persona_image(
    request: PersonaImageRequest,
    current_user: User = Depends(require_subscription(SubscriptionTier.GOLD))
):
    """Generate custom image for user personas (Gold+ subscription required)"""
    try:
        # Generate image with persona-specific styling
        image_result = await generate_image(request.prompt, "persona_custom")
        
        if image_result["success"]:
            # Store in user's persona image collection (optional)
            persona_image = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                "persona_name": request.persona_name,
                "prompt": request.prompt,
                "image_url": image_result["image_url"],
                "created_at": datetime.utcnow().isoformat()
            }
            
            await db.user_persona_images.insert_one(persona_image)
            
            return {
                "success": True,
                "image_url": image_result["image_url"],
                "persona_name": request.persona_name,
                "prompt": request.prompt
            }
        else:
            return {
                "success": False,
                "error": image_result.get("error", "Image generation failed")
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/marketplace/items")
async def create_marketplace_item(
    item: MarketplaceItem,
    current_user: User = Depends(require_subscription(SubscriptionTier.GOLD))
):
    """Create marketplace item (Gold+ subscription required)"""
    try:
        # Validate category exists and price constraints
        if item.category not in MARKETPLACE_CATEGORIES:
            raise HTTPException(status_code=400, detail=f"Invalid category. Available: {list(MARKETPLACE_CATEGORIES.keys())}")
        
        category_info = MARKETPLACE_CATEGORIES[item.category]
        min_price = category_info['min_price']
        max_price = category_info['max_price']
        
        if item.price < min_price:
            raise HTTPException(status_code=400, detail=f"Price must be at least ${min_price} for {category_info['name']}")
        
        if max_price and item.price > max_price:
            raise HTTPException(status_code=400, detail=f"Price cannot exceed ${max_price} for {category_info['name']}")
        
        item.id = str(uuid.uuid4())
        item.creator_id = current_user.id
        item.created_at = datetime.utcnow()
        
        await db.marketplace_items.insert_one(item.dict())
        return {"message": "Item created successfully", "item_id": item.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/marketplace/items")
async def get_marketplace_items(
    category: Optional[str] = None,
    limit: int = Query(50, le=100),
    skip: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get marketplace items"""
    try:
        query = {"is_active": True}
        if category:
            query["category"] = category
            
        items = await db.marketplace_items.find(query).skip(skip).limit(limit).to_list(length=None)
        return {"items": items}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/marketplace/my-items")
async def get_my_marketplace_items(current_user: User = Depends(get_current_user)):
    """Get current user's marketplace items"""
    try:
        items = await db.marketplace_items.find({"creator_id": current_user.id}).to_list(length=None)
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Keep all existing meeting endpoints and other functionality here...
# [Previous meeting endpoints, LLM integration, etc. would continue...]

# Include the router
app.include_router(api_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Parliamentarium API - The Super Brain for AI Agents",
        "version": "2.0.0",
        "features": [
            "AI Parliament Deliberation",
            "Agent Orchestration Brain", 
            "Emergency AI Fallback",
            "Multi-Agent Coordination",
            "Real-time Analytics",
            "Usage Intelligence",
            "API Key Management",
            "Marketplace Integration"
        ],
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)