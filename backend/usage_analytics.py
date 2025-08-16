"""
Real-time Usage Analytics and Intelligence System
The data goldmine that turns every interaction into insights
"""

import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import statistics
from enum import Enum

class AnalyticsEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}

class ConversationIntelligence:
    def __init__(self, db):
        self.db = db
        
    async def analyze_conversation_quality(self, session_id: str) -> Dict[str, Any]:
        """
        Analyze the quality and effectiveness of a conversation
        """
        session = await self.db.meetings.find_one({"id": session_id})
        if not session:
            return {"error": "Session not found"}
            
        responses = session.get("personas_responses", {})
        
        # Quality metrics
        analysis = {
            "session_id": session_id,
            "overall_score": 0.0,
            "metrics": {
                "engagement_score": self._calculate_engagement_score(responses),
                "consensus_score": self._calculate_consensus_score(responses),
                "creativity_score": self._calculate_creativity_score(responses),
                "decision_quality": self._calculate_decision_quality(responses),
                "efficiency_score": self._calculate_efficiency_score(session)
            },
            "persona_performance": {},
            "key_insights": [],
            "improvement_suggestions": []
        }
        
        # Analyze individual persona performance
        for persona_id, persona_data in responses.items():
            analysis["persona_performance"][persona_id] = self._analyze_persona_performance(persona_data)
            
        # Calculate overall score
        metrics = analysis["metrics"]
        analysis["overall_score"] = statistics.mean([
            metrics["engagement_score"],
            metrics["consensus_score"], 
            metrics["creativity_score"],
            metrics["decision_quality"],
            metrics["efficiency_score"]
        ])
        
        # Generate insights and suggestions
        analysis["key_insights"] = self._generate_insights(analysis)
        analysis["improvement_suggestions"] = self._generate_suggestions(analysis)
        
        # Store analysis for future reference
        await self.db.conversation_analytics.insert_one(analysis)
        
        return analysis
        
    def _calculate_engagement_score(self, responses: Dict) -> float:
        """Calculate how engaged the personas were"""
        if not responses:
            return 0.0
            
        total_length = sum(len(str(data.get("response", ""))) for data in responses.values())
        avg_length = total_length / len(responses)
        
        # Normalize to 0-1 scale (assuming 500 chars is optimal)
        engagement_score = min(avg_length / 500, 1.0)
        return round(engagement_score, 3)
        
    def _calculate_consensus_score(self, responses: Dict) -> float:
        """Calculate how much consensus was reached"""
        # Simplified consensus detection based on response similarity
        # In practice, this could use NLP similarity measures
        return round(0.7 + (len(responses) * 0.05), 3)  # Placeholder algorithm
        
    def _calculate_creativity_score(self, responses: Dict) -> float:
        """Calculate the creativity level of solutions"""
        # Look for creative personas and unique solution approaches
        creative_personas = ["diviner", "illustrator", "id", "patternist"]
        creative_responses = sum(1 for persona in responses if persona in creative_personas)
        
        creativity_score = min(creative_responses / len(creative_personas), 1.0)
        return round(creativity_score, 3)
        
    def _calculate_decision_quality(self, responses: Dict) -> float:
        """Calculate the quality of the final decision"""
        # Check for decision-making personas and structured responses
        decision_personas = ["mouse", "contextualist", "ego", "superego"]
        decision_responses = sum(1 for persona in responses if persona in decision_personas)
        
        quality_score = min(decision_responses / len(decision_personas), 1.0)
        return round(quality_score, 3)
        
    def _calculate_efficiency_score(self, session: Dict) -> float:
        """Calculate how efficiently the session was conducted"""
        start_time = session.get("created_at")
        # Simplified efficiency calculation
        return round(0.8, 3)  # Placeholder
        
    def _analyze_persona_performance(self, persona_data: Dict) -> Dict:
        """Analyze individual persona performance"""
        response_text = str(persona_data.get("response", ""))
        
        return {
            "response_length": len(response_text),
            "engagement_level": "high" if len(response_text) > 200 else "medium" if len(response_text) > 50 else "low",
            "unique_contributions": 1,  # Placeholder
            "influence_score": 0.7  # Placeholder
        }
        
    def _generate_insights(self, analysis: Dict) -> List[str]:
        """Generate key insights from the analysis"""
        insights = []
        metrics = analysis["metrics"]
        
        if metrics["engagement_score"] > 0.8:
            insights.append("High engagement levels indicate strong persona participation")
        if metrics["creativity_score"] > 0.7:
            insights.append("Creative solutions were generated with innovative approaches")
        if metrics["consensus_score"] > 0.6:
            insights.append("Good consensus reached among different perspectives")
            
        return insights
        
    def _generate_suggestions(self, analysis: Dict) -> List[str]:
        """Generate improvement suggestions"""
        suggestions = []
        metrics = analysis["metrics"]
        
        if metrics["engagement_score"] < 0.5:
            suggestions.append("Consider using more engaging personas or refining the topic")
        if metrics["creativity_score"] < 0.5:
            suggestions.append("Include more creative personas like the Diviner or Illustrator")
        if metrics["efficiency_score"] < 0.6:
            suggestions.append("Consider time limits or more focused discussion topics")
            
        return suggestions

class UsageAnalytics:
    def __init__(self, db):
        self.db = db
        self.real_time_stats = defaultdict(int)
        
    async def track_event(self, event_type: str, user_id: str = None, session_id: str = None, data: Dict = None):
        """Track any analytics event"""
        event = AnalyticsEvent(
            event_type=event_type,
            user_id=user_id,
            session_id=session_id,
            data=data or {},
            metadata={}
        )
        
        await self.db.analytics_events.insert_one(event.dict())
        
        # Update real-time counters
        self.real_time_stats[event_type] += 1
        self.real_time_stats["total_events"] += 1
        
    async def get_user_journey(self, user_id: str, days: int = 30) -> Dict:
        """Get detailed user journey analytics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        events = await self.db.analytics_events.find({
            "user_id": user_id,
            "timestamp": {"$gte": start_date}
        }).sort("timestamp", 1).to_list(length=None)
        
        # Analyze user behavior patterns
        journey = {
            "user_id": user_id,
            "period_days": days,
            "total_events": len(events),
            "session_count": len(set(e["session_id"] for e in events if e.get("session_id"))),
            "event_timeline": events,
            "behavior_patterns": self._analyze_user_behavior(events),
            "engagement_metrics": self._calculate_user_engagement(events),
            "feature_usage": self._analyze_feature_usage(events),
            "recommendations": self._generate_user_recommendations(events)
        }
        
        return journey
        
    async def get_platform_insights(self, days: int = 7) -> Dict:
        """Get platform-wide analytics and insights"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Aggregate platform metrics
        pipeline = [
            {"$match": {"timestamp": {"$gte": start_date}}},
            {"$group": {
                "_id": "$event_type",
                "count": {"$sum": 1},
                "unique_users": {"$addToSet": "$user_id"},
                "avg_daily": {"$sum": 1}
            }},
            {"$project": {
                "event_type": "$_id",
                "count": 1,
                "unique_users": {"$size": "$unique_users"},
                "avg_daily": {"$divide": ["$count", days]}
            }}
        ]
        
        event_stats = await self.db.analytics_events.aggregate(pipeline).to_list(length=None)
        
        insights = {
            "period_days": days,
            "start_date": start_date,
            "event_statistics": event_stats,
            "top_features": await self._get_top_features(start_date),
            "user_retention": await self._calculate_retention_metrics(start_date),
            "revenue_insights": await self._get_revenue_insights(start_date),
            "growth_metrics": await self._calculate_growth_metrics(start_date),
            "recommendations": []
        }
        
        return insights
        
    async def get_conversation_trends(self, days: int = 30) -> Dict:
        """Analyze conversation trends and popular topics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        meetings = await self.db.meetings.find({
            "created_at": {"$gte": start_date}
        }).to_list(length=None)
        
        # Extract topics and analyze trends
        topics = [meeting.get("topic", "") for meeting in meetings]
        topic_words = []
        for topic in topics:
            topic_words.extend(topic.lower().split())
            
        # Remove common words and count frequencies
        common_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with"}
        filtered_words = [word for word in topic_words if len(word) > 3 and word not in common_words]
        word_frequency = Counter(filtered_words)
        
        trends = {
            "period_days": days,
            "total_conversations": len(meetings),
            "trending_topics": word_frequency.most_common(20),
            "conversation_types": self._categorize_conversations(meetings),
            "success_rate": self._calculate_success_rate(meetings),
            "average_duration": self._calculate_average_duration(meetings),
            "persona_popularity": self._analyze_persona_usage(meetings)
        }
        
        return trends
        
    def _analyze_user_behavior(self, events: List[Dict]) -> Dict:
        """Analyze user behavior patterns"""
        if not events:
            return {}
            
        event_types = [e["event_type"] for e in events]
        event_frequency = Counter(event_types)
        
        # Time-based analysis
        hours = []
        for e in events:
            if isinstance(e["timestamp"], str):
                dt = datetime.fromisoformat(e["timestamp"])
            else:
                dt = e["timestamp"]
            hours.append(dt.hour)
        peak_hours = Counter(hours)
        
        return {
            "most_common_actions": event_frequency.most_common(5),
            "peak_usage_hours": peak_hours.most_common(3),
            "session_patterns": "regular",  # Placeholder for more complex analysis
            "feature_preferences": event_frequency
        }
        
    def _calculate_user_engagement(self, events: List[Dict]) -> Dict:
        """Calculate user engagement metrics"""
        if not events:
            return {"engagement_score": 0}
            
        # Simple engagement calculation based on event frequency and recency
        total_events = len(events)
        recent_events = sum(1 for e in events if datetime.fromisoformat(e["timestamp"]) if isinstance(e["timestamp"], str) else e["timestamp"] > datetime.utcnow() - timedelta(days=7))
        
        engagement_score = min((recent_events / max(total_events, 1)) * 2, 1.0)
        
        return {
            "engagement_score": round(engagement_score, 3),
            "total_events": total_events,
            "recent_activity": recent_events,
            "engagement_level": "high" if engagement_score > 0.7 else "medium" if engagement_score > 0.3 else "low"
        }
        
    def _analyze_feature_usage(self, events: List[Dict]) -> Dict:
        """Analyze which features the user uses most"""
        feature_events = defaultdict(int)
        
        for event in events:
            event_type = event["event_type"]
            if "meeting" in event_type:
                feature_events["meetings"] += 1
            elif "marketplace" in event_type:
                feature_events["marketplace"] += 1
            elif "auth" in event_type:
                feature_events["authentication"] += 1
            else:
                feature_events["other"] += 1
                
        return dict(feature_events)
        
    def _generate_user_recommendations(self, events: List[Dict]) -> List[str]:
        """Generate personalized recommendations for the user"""
        recommendations = []
        
        feature_usage = self._analyze_feature_usage(events)
        
        if feature_usage.get("meetings", 0) > feature_usage.get("marketplace", 0):
            recommendations.append("Explore the marketplace for custom personas and templates")
        if feature_usage.get("marketplace", 0) == 0:
            recommendations.append("Try creating your first marketplace item")
        if len(events) < 10:
            recommendations.append("Join the community chat to connect with other users")
            
        return recommendations
        
    # Additional helper methods for platform insights
    async def _get_top_features(self, start_date: datetime) -> List[Dict]:
        """Get most popular features"""
        return [{"feature": "meetings", "usage": 100}]  # Placeholder
        
    async def _calculate_retention_metrics(self, start_date: datetime) -> Dict:
        """Calculate user retention metrics"""
        return {"day_1_retention": 0.7, "day_7_retention": 0.4}  # Placeholder
        
    async def _get_revenue_insights(self, start_date: datetime) -> Dict:
        """Get revenue-related insights"""
        return {"total_revenue_units": 150.5, "avg_revenue_per_user": 2.3}  # Placeholder
        
    async def _calculate_growth_metrics(self, start_date: datetime) -> Dict:
        """Calculate growth metrics"""
        return {"new_users": 25, "growth_rate": 0.15}  # Placeholder
        
    def _categorize_conversations(self, meetings: List[Dict]) -> Dict:
        """Categorize conversations by type"""
        creation_tasks = sum(1 for m in meetings if m.get("is_creation_task", False))
        decision_tasks = len(meetings) - creation_tasks
        
        return {
            "decision_making": decision_tasks,
            "creative_projects": creation_tasks,
            "problem_solving": decision_tasks,  # Simplified categorization
        }
        
    def _calculate_success_rate(self, meetings: List[Dict]) -> float:
        """Calculate conversation success rate"""
        completed = sum(1 for m in meetings if m.get("status") == "completed")
        return round(completed / max(len(meetings), 1), 3)
        
    def _calculate_average_duration(self, meetings: List[Dict]) -> float:
        """Calculate average conversation duration"""
        return 300.0  # Placeholder (5 minutes)
        
    def _analyze_persona_usage(self, meetings: List[Dict]) -> Dict:
        """Analyze which personas are used most"""
        persona_count = defaultdict(int)
        
        for meeting in meetings:
            responses = meeting.get("personas_responses", {})
            for persona_id in responses:
                persona_count[persona_id] += 1
                
        return dict(persona_count)

# Global analytics instances
conversation_intelligence = None
usage_analytics = None

def get_conversation_intelligence():
    return conversation_intelligence
    
def get_usage_analytics():
    return usage_analytics
    
def init_analytics(db):
    global conversation_intelligence, usage_analytics
    conversation_intelligence = ConversationIntelligence(db)
    usage_analytics = UsageAnalytics(db)
    return conversation_intelligence, usage_analytics