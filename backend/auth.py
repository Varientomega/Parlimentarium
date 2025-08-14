# Authentication and Authorization System
import os
import jwt
import uuid
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from models import User, UserRole, SubscriptionTier
from typing import Optional

# Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'parliamentarium_secret_key_2025')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, db):
        self.db = db
        self.dev_user_count = 0
        
    def create_access_token(self, data: dict) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    async def authenticate_user(self, email: str) -> Optional[User]:
        """Authenticate user and handle dev status assignment"""
        user_doc = await self.db.users.find_one({"email": email}, {"_id": 0})
        
        if user_doc:
            user = User(**user_doc)
            # Update login stats
            user.login_count += 1
            user.last_login = datetime.utcnow()
            
            # Check if user should be granted dev status (first 5 logins)
            if not user.is_dev and self.dev_user_count < 5:
                total_dev_users = await self.db.users.count_documents({"is_dev": True})
                if total_dev_users < 5:
                    user.is_dev = True
                    user.role = UserRole.DEV
                    user.dev_granted_at = datetime.utcnow()
                    self.dev_user_count += 1
            
            # Update user in database
            await self.db.users.update_one(
                {"email": email},
                {"$set": user.dict(exclude={"id"})}
            )
            return user
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            referral_code = str(uuid.uuid4())[:8].upper()
            
            # Check if this should be a dev user
            total_dev_users = await self.db.users.count_documents({"is_dev": True})
            is_dev = total_dev_users < 5
            
            user = User(
                id=user_id,
                email=email,
                referral_code=referral_code,
                is_dev=is_dev,
                role=UserRole.DEV if is_dev else UserRole.USER,
                dev_granted_at=datetime.utcnow() if is_dev else None,
                login_count=1,
                last_login=datetime.utcnow()
            )
            
            await self.db.users.insert_one(user.dict())
            return user
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
        """Get current authenticated user"""
        token = credentials.credentials
        payload = self.verify_token(token)
        email = payload.get("sub")
        
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await self.db.users.find_one({"email": email}, {"_id": 0})
        if user_doc is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user_doc)
    
    def require_subscription(self, min_tier: SubscriptionTier):
        """Decorator to require minimum subscription tier"""
        def decorator(current_user: User = Depends(self.get_current_user)):
            tier_hierarchy = {
                SubscriptionTier.FREE: 0,
                SubscriptionTier.GOLD: 1,
                SubscriptionTier.VIP: 2,
                SubscriptionTier.ENTERPRISE: 3
            }
            
            user_tier_level = tier_hierarchy.get(current_user.subscription_tier, 0)
            required_tier_level = tier_hierarchy.get(min_tier, 0)
            
            if user_tier_level < required_tier_level:
                raise HTTPException(
                    status_code=403, 
                    detail=f"This feature requires {min_tier.value} subscription or higher"
                )
            return current_user
        return decorator
    
    def require_dev_access(self, current_user: User = Depends(lambda: None)):
        """Require dev access for dev dashboard"""
        if not current_user or not current_user.is_dev:
            raise HTTPException(status_code=403, detail="Dev access required")
        return current_user

# Global auth service instance will be initialized with database
auth_service = None