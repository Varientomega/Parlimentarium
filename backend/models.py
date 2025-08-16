from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Existing models (User, Meeting, etc.) are preserved above this line

# ============================================================================
# AGENT ORCHESTRATION MODELS
# ============================================================================

class AgentRequestType(str, Enum):
    DECISION_HELP = "decision_help"
    CREATIVE_SOLUTION = "creative_solution"  
    PROBLEM_SOLVING = "problem_solving"
    EMERGENCY_FALLBACK = "emergency_fallback"
    MULTI_AGENT_COORDINATION = "multi_agent_coordination"
    STRATEGY_PLANNING = "strategy_planning"

class AgentRequest(BaseModel):
    request_id: Optional[str] = None
    agent_name: str = Field(..., description="Name of the requesting agent")
    agent_type: str = Field(..., description="Type of agent: assistant, chatbot, automation, etc")
    request_type: AgentRequestType
    context: str = Field(..., description="Context and background information")
    problem_description: str = Field(..., description="Specific problem that needs solving")
    attempted_solutions: List[str] = Field(default=[], description="Solutions already tried")
    urgency_level: int = Field(default=1, ge=1, le=10, description="Urgency level 1-10")
    max_response_time: int = Field(default=300, description="Maximum response time in seconds")
    required_personas: List[str] = Field(default=[], description="Specific personas to include")
    api_key: Optional[str] = Field(None, description="API key for authentication")
    callback_url: Optional[str] = Field(None, description="URL to send response to")
    metadata: Dict[str, Any] = Field(default={}, description="Additional metadata")

class AgentResponse(BaseModel):
    request_id: str
    session_id: str
    status: str  # "processing", "completed", "failed"
    solution: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    reasoning: str
    participating_personas: List[str]
    execution_time: float
    follow_up_suggestions: List[str] = []
    cost_units: Optional[float] = None
    metadata: Dict[str, Any] = {}

class MultiAgentCoordination(BaseModel):
    coordination_id: Optional[str] = None
    agents: List[Dict[str, Any]] = Field(..., description="List of agents to coordinate")
    coordination_task: str = Field(..., description="Task requiring coordination")
    priority_level: int = Field(default=5, ge=1, le=10)
    expected_duration: int = Field(default=600, description="Expected duration in seconds")
    callback_url: Optional[str] = None
    metadata: Dict[str, Any] = {}

class EmergencyFallback(BaseModel):
    failed_agent: str = Field(..., description="Name of the agent that failed")
    failure_context: str = Field(..., description="Context of the failure")
    failure_details: Dict[str, Any] = Field(default={}, description="Detailed failure information")
    time_limit: int = Field(default=60, description="Time limit for emergency response")
    severity_level: int = Field(default=8, ge=1, le=10, description="Severity of the failure")
    backup_instructions: Optional[str] = None
    metadata: Dict[str, Any] = {}

# ============================================================================
# USAGE TRACKING AND BILLING MODELS  
# ============================================================================

class UsageTracker(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    agent_name: Optional[str] = None
    session_id: str
    request_type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    personas_used: List[str] = []
    cost_units: float = 0.0
    success: bool = True
    metadata: Dict[str, Any] = {}

class BillingEvent(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    agent_name: Optional[str] = None
    event_type: str  # "api_call", "session", "emergency", etc
    cost_units: float
    timestamp: datetime
    description: str
    metadata: Dict[str, Any] = {}

# ============================================================================
# API KEY AND AUTHENTICATION MODELS
# ============================================================================

class APIKey(BaseModel):
    id: Optional[str] = None
    key: str
    name: str
    user_id: Optional[str] = None
    agent_name: Optional[str] = None
    permissions: List[str] = ["basic"]  # "basic", "premium", "emergency", "coordination"
    rate_limit: int = 100  # requests per hour
    created_at: datetime
    last_used: Optional[datetime] = None
    is_active: bool = True
    metadata: Dict[str, Any] = {}

class APIUsage(BaseModel):
    id: Optional[str] = None
    api_key: str
    endpoint: str
    timestamp: datetime
    response_time: float
    success: bool
    cost_units: float = 0.0
    metadata: Dict[str, Any] = {}

# ============================================================================
# ANALYTICS AND REPORTING MODELS
# ============================================================================

class AgentAnalytics(BaseModel):
    agent_name: str
    agent_type: str
    total_requests: int = 0
    successful_requests: int = 0
    average_response_time: float = 0.0
    average_confidence_score: float = 0.0
    most_used_personas: List[str] = []
    common_request_types: List[str] = []
    total_cost_units: float = 0.0
    last_request: Optional[datetime] = None
    metadata: Dict[str, Any] = {}

class SystemMetrics(BaseModel):
    timestamp: datetime
    total_requests: int
    active_sessions: int
    average_response_time: float
    persona_utilization: Dict[str, float]  # persona_id -> utilization_percentage
    error_rate: float
    revenue_units: float
    unique_agents: int
    metadata: Dict[str, Any] = {}

# ============================================================================
# MARKETPLACE AND INTEGRATION MODELS
# ============================================================================

class IntegrationTemplate(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    integration_type: str  # "webhook", "api", "sdk", "plugin"
    code_template: str
    documentation: str
    author_id: str
    price: float = 0.0  # 0 for free templates
    downloads: int = 0
    rating: float = 0.0
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime
    is_featured: bool = False
    metadata: Dict[str, Any] = {}

class AgentIntegration(BaseModel):
    id: Optional[str] = None
    agent_name: str
    integration_type: str
    config: Dict[str, Any]
    status: str  # "active", "inactive", "error"
    created_at: datetime
    last_sync: Optional[datetime] = None
    error_log: List[str] = []
    metadata: Dict[str, Any] = {}

# ============================================================================
# COMMUNITY AND SOCIAL FEATURES
# ============================================================================

class ConversationShare(BaseModel):
    id: Optional[str] = None
    session_id: str
    shared_by: str
    title: str
    description: str
    highlight_moments: List[Dict[str, Any]] = []
    tags: List[str] = []
    is_public: bool = False
    views: int = 0
    likes: int = 0
    created_at: datetime
    metadata: Dict[str, Any] = {}

class UserAchievement(BaseModel):
    id: Optional[str] = None
    user_id: str
    achievement_type: str
    title: str
    description: str
    earned_at: datetime
    points: int = 0
    badge_url: Optional[str] = None
    metadata: Dict[str, Any] = {}

class Leaderboard(BaseModel):
    id: Optional[str] = None
    category: str  # "decisions", "creativity", "problem_solving", etc
    time_period: str  # "daily", "weekly", "monthly", "all_time"
    entries: List[Dict[str, Any]] = []  # user_id, score, rank
    updated_at: datetime
    metadata: Dict[str, Any] = {}

# ============================================================================
# EXISTING MODELS (preserved from original)
# ============================================================================

class SubscriptionTier(str, Enum):
    FREE = "free"
    GOLD = "gold"
    VIP = "vip"
    ENTERPRISE = "enterprise"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: Optional[str] = None
    subscription_tier: SubscriptionTier = SubscriptionTier.FREE
    role: str = "user"  # "user", "dev", "admin"
    is_dev: bool = False
    dev_granted_at: Optional[datetime] = None
    subscription_id: Optional[str] = None
    subscription_status: Optional[str] = None
    referral_code: str = Field(default_factory=lambda: ''.join(random.choices(string.ascii_uppercase + string.digits, k=8)))
    referred_by: Optional[str] = None
    referral_tokens: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)
    login_count: int = 1

    def dict(self, **kwargs):
        data = super().dict(**kwargs)
        # Convert datetime objects to ISO format strings for JSON serialization
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
        return data

class LoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None

class Meeting(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic: str
    description: Optional[str] = ""
    proposer: str = "Anonymous"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, active, completed, failed
    personas_responses: Dict[str, Any] = {}
    current_phase: str = "initialization"
    is_creation_task: bool = False
    audio_mode: str = "none"
    persona_api_keys: Dict[str, Any] = {}
    uploaded_files: List[Dict[str, Any]] = []

class PersonaImageRequest(BaseModel):
    persona_name: str
    prompt: str

class MarketplaceItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str  # persona, template, workflow, install_new_government
    price: float
    creator_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    content: Dict[str, Any] = {}
    tags: List[str] = []
    downloads: int = 0
    rating: float = 0.0
    is_active: bool = True

import uuid
import random
import string