# SaaS Platform Data Models
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum

class SubscriptionTier(str, Enum):
    FREE = "free"
    GOLD = "gold"
    VIP = "vip"
    ENTERPRISE = "enterprise"

class UserRole(str, Enum):
    USER = "user"
    DEV = "dev"
    ADMIN = "admin"

class User(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    subscription_tier: SubscriptionTier = SubscriptionTier.FREE
    role: UserRole = UserRole.USER
    is_dev: bool = False
    dev_granted_at: Optional[datetime] = None
    subscription_id: Optional[str] = None
    subscription_status: Optional[str] = None
    referral_code: Optional[str] = None
    referred_by: Optional[str] = None
    referral_tokens: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    login_count: int = 0

class SubscriptionPlan(BaseModel):
    id: str
    name: str
    tier: SubscriptionTier
    price: float
    currency: str = "usd"
    features: List[str]
    stripe_price_id: Optional[str] = None

class PaymentTransaction(BaseModel):
    id: str
    user_id: str
    session_id: str
    amount: float
    currency: str
    subscription_tier: SubscriptionTier
    payment_status: str
    metadata: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ReferralReward(BaseModel):
    id: str
    referrer_id: str
    referred_user_id: str
    subscription_tier: SubscriptionTier
    tokens_awarded: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MarketplaceItem(BaseModel):
    id: str
    creator_id: str
    title: str
    description: str
    category: str
    price: float
    currency: str = "usd"
    item_type: str  # "persona", "template", "workflow"
    content: Dict[str, Any]
    is_active: bool = True
    sales_count: int = 0
    rating: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PersonaCustomization(BaseModel):
    id: str
    user_id: str
    persona_id: str
    name: str
    role: str
    system_prompt: str
    personality_traits: Dict[str, Any]
    voice_settings: Dict[str, Any]
    visual_settings: Dict[str, Any]
    is_private: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SessionHistory(BaseModel):
    id: str
    user_id: str
    meeting_id: str
    topic: str
    audio_mode: str
    duration_minutes: int
    personas_used: List[str]
    final_report: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response Models
class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

class SubscriptionRequest(BaseModel):
    tier: SubscriptionTier
    origin_url: str

class DevDashboardMetrics(BaseModel):
    total_users: int
    active_subscriptions: int
    revenue_monthly: float
    api_requests_today: int
    system_health: Dict[str, Any]
    error_rate: float
    response_time_avg: float

class PersonaImageRequest(BaseModel):
    persona_name: str
    prompt: str