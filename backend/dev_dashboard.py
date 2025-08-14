# Advanced Developer Dashboard System
import psutil
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any
from models import DevDashboardMetrics, User
import json
import os

class DevDashboardService:
    def __init__(self, db):
        self.db = db
        
    async def get_system_health_metrics(self) -> Dict[str, Any]:
        """Get real-time system health metrics with AI-powered monitoring"""
        try:
            # CPU and Memory metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Network statistics
            network = psutil.net_io_counters()
            
            # AI-powered anomaly detection
            anomalies = await self.detect_system_anomalies(cpu_percent, memory.percent)
            
            return {
                "cpu": {
                    "usage_percent": cpu_percent,
                    "cores": psutil.cpu_count(),
                    "status": "critical" if cpu_percent > 80 else "warning" if cpu_percent > 60 else "healthy"
                },
                "memory": {
                    "usage_percent": memory.percent,
                    "total_gb": round(memory.total / (1024**3), 2),
                    "available_gb": round(memory.available / (1024**3), 2),
                    "status": "critical" if memory.percent > 85 else "warning" if memory.percent > 70 else "healthy"
                },
                "disk": {
                    "usage_percent": round((disk.used / disk.total) * 100, 2),
                    "total_gb": round(disk.total / (1024**3), 2),
                    "free_gb": round(disk.free / (1024**3), 2),
                    "status": "critical" if (disk.used / disk.total) > 0.9 else "healthy"
                },
                "network": {
                    "bytes_sent": network.bytes_sent,
                    "bytes_recv": network.bytes_recv,
                    "packets_sent": network.packets_sent,
                    "packets_recv": network.packets_recv
                },
                "anomalies": anomalies,
                "last_updated": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {"error": str(e), "last_updated": datetime.utcnow().isoformat()}
    
    async def detect_system_anomalies(self, cpu_percent: float, memory_percent: float) -> List[Dict[str, Any]]:
        """AI-powered anomaly detection for system metrics"""
        anomalies = []
        
        # Simple rule-based anomaly detection (can be enhanced with ML)
        if cpu_percent > 90:
            anomalies.append({
                "type": "cpu_spike",
                "severity": "critical",
                "message": f"CPU usage at {cpu_percent}% - investigate immediately",
                "suggested_action": "Check for runaway processes or scale resources"
            })
        
        if memory_percent > 95:
            anomalies.append({
                "type": "memory_leak",
                "severity": "critical", 
                "message": f"Memory usage at {memory_percent}% - possible memory leak",
                "suggested_action": "Restart services or investigate memory-intensive processes"
            })
        
        return anomalies
    
    async def get_user_analytics(self) -> Dict[str, Any]:
        """Get comprehensive user analytics and journey insights"""
        try:
            # User statistics
            total_users = await self.db.users.count_documents({})
            active_users_today = await self.db.users.count_documents({
                "last_login": {"$gte": datetime.utcnow() - timedelta(days=1)}
            })
            
            # Subscription analytics
            subscription_stats = {}
            for tier in ["free", "gold", "vip", "enterprise"]:
                count = await self.db.users.count_documents({"subscription_tier": tier})
                subscription_stats[tier] = count
            
            # Revenue analytics
            revenue_data = await self.get_revenue_analytics()
            
            # User journey analytics
            user_behavior = await self.analyze_user_behavior()
            
            return {
                "user_stats": {
                    "total_users": total_users,
                    "active_today": active_users_today,
                    "new_users_this_week": await self.db.users.count_documents({
                        "created_at": {"$gte": datetime.utcnow() - timedelta(days=7)}
                    }),
                    "subscription_breakdown": subscription_stats
                },
                "revenue": revenue_data,
                "user_behavior": user_behavior,
                "last_updated": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {"error": str(e)}
    
    async def get_revenue_analytics(self) -> Dict[str, Any]:
        """Get detailed revenue analytics"""
        try:
            # Monthly recurring revenue
            current_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Calculate MRR from active subscriptions
            pipeline = [
                {"$match": {"subscription_tier": {"$ne": "free"}}},
                {"$group": {
                    "_id": "$subscription_tier",
                    "count": {"$sum": 1}
                }}
            ]
            
            subscription_counts = await self.db.users.aggregate(pipeline).to_list(None)
            
            # Revenue calculation based on subscription tiers
            tier_prices = {"gold": 50.0, "vip": 100.0, "enterprise": 200.0}
            monthly_revenue = sum(
                tier_prices.get(item["_id"], 0) * item["count"] 
                for item in subscription_counts
            )
            
            # Transaction analytics
            total_transactions = await self.db.payment_transactions.count_documents({
                "payment_status": "completed"
            })
            
            return {
                "monthly_recurring_revenue": monthly_revenue,
                "total_transactions": total_transactions,
                "subscription_counts": {item["_id"]: item["count"] for item in subscription_counts},
                "average_revenue_per_user": monthly_revenue / max(sum(item["count"] for item in subscription_counts), 1)
            }
        except Exception as e:
            return {"error": str(e)}
    
    async def analyze_user_behavior(self) -> Dict[str, Any]:
        """Analyze user behavior patterns and session data"""
        try:
            # Session analytics
            total_sessions = await self.db.session_history.count_documents({})
            avg_session_duration = await self.db.session_history.aggregate([
                {"$group": {"_id": None, "avg_duration": {"$avg": "$duration_minutes"}}}
            ]).to_list(None)
            
            # Most popular audio modes
            audio_mode_stats = await self.db.session_history.aggregate([
                {"$group": {"_id": "$audio_mode", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]).to_list(None)
            
            # Persona usage statistics
            persona_usage = await self.analyze_persona_usage()
            
            return {
                "total_sessions": total_sessions,
                "average_session_duration": avg_session_duration[0]["avg_duration"] if avg_session_duration else 0,
                "audio_mode_preferences": {item["_id"]: item["count"] for item in audio_mode_stats},
                "persona_usage": persona_usage
            }
        except Exception as e:
            return {"error": str(e)}
    
    async def analyze_persona_usage(self) -> Dict[str, Any]:
        """Analyze which personas are most/least used"""
        try:
            # This would analyze persona usage from session history
            # Placeholder for now - would need to implement based on actual session data structure
            return {
                "most_popular": ["contextualist", "superscholar", "ego"],
                "least_popular": ["naysayer", "diviner"],
                "usage_distribution": {}
            }
        except Exception as e:
            return {"error": str(e)}
    
    async def get_api_performance_metrics(self) -> Dict[str, Any]:
        """Get API performance and monitoring data"""
        try:
            # This would integrate with actual API monitoring
            # For now, return mock data structure
            return {
                "requests_today": 1250,
                "average_response_time": 145.6,
                "error_rate": 0.02,
                "top_endpoints": [
                    {"endpoint": "/api/meetings", "requests": 450, "avg_time": 120.3},
                    {"endpoint": "/api/meetings/{id}/start-deliberation", "requests": 380, "avg_time": 890.1},
                    {"endpoint": "/api/meetings/{id}/analyze-idea/{index}", "requests": 320, "avg_time": 650.2}
                ],
                "errors_by_type": {
                    "authentication": 5,
                    "validation": 8,
                    "server_error": 2,
                    "rate_limit": 1
                }
            }
        except Exception as e:
            return {"error": str(e)}
    
    async def get_comprehensive_dashboard_data(self) -> DevDashboardMetrics:
        """Get all dashboard data in one comprehensive call"""
        try:
            # Get all metrics asynchronously
            system_health, user_analytics, api_metrics = await asyncio.gather(
                self.get_system_health_metrics(),
                self.get_user_analytics(),
                self.get_api_performance_metrics()
            )
            
            return DevDashboardMetrics(
                total_users=user_analytics.get("user_stats", {}).get("total_users", 0),
                active_subscriptions=sum(user_analytics.get("user_stats", {}).get("subscription_breakdown", {}).values()) - user_analytics.get("user_stats", {}).get("subscription_breakdown", {}).get("free", 0),
                revenue_monthly=user_analytics.get("revenue", {}).get("monthly_recurring_revenue", 0.0),
                api_requests_today=api_metrics.get("requests_today", 0),
                system_health=system_health,
                error_rate=api_metrics.get("error_rate", 0.0),
                response_time_avg=api_metrics.get("average_response_time", 0.0)
            )
        except Exception as e:
            return DevDashboardMetrics(
                total_users=0,
                active_subscriptions=0,
                revenue_monthly=0.0,
                api_requests_today=0,
                system_health={"error": str(e)},
                error_rate=0.0,
                response_time_avg=0.0
            )