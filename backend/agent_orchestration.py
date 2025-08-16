"""
Parliamentarium Agent Orchestration System
The brain that powers other AI agents and assistants
"""

import asyncio
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class AgentRequestType(str, Enum):
    DECISION_HELP = "decision_help"
    CREATIVE_SOLUTION = "creative_solution"  
    PROBLEM_SOLVING = "problem_solving"
    EMERGENCY_FALLBACK = "emergency_fallback"
    MULTI_AGENT_COORDINATION = "multi_agent_coordination"
    STRATEGY_PLANNING = "strategy_planning"

class AgentRequest(BaseModel):
    request_id: str = None
    agent_name: str
    agent_type: str  # "assistant", "chatbot", "automation", "decision_engine", etc
    request_type: AgentRequestType
    context: str
    problem_description: str
    attempted_solutions: List[str] = []
    urgency_level: int = 1  # 1-10 scale
    max_response_time: int = 300  # seconds
    required_personas: List[str] = []  # Optional: specify which personas to include
    metadata: Dict[str, Any] = {}

class AgentResponse(BaseModel):
    request_id: str
    session_id: str
    status: str  # "processing", "completed", "failed"
    solution: str
    confidence_score: float  # 0-1 scale
    reasoning: str
    participating_personas: List[str]
    execution_time: float
    follow_up_suggestions: List[str] = []
    metadata: Dict[str, Any] = {}

class AgentOrchestrator:
    def __init__(self, db, meeting_service):
        self.db = db
        self.meeting_service = meeting_service
        self.active_sessions = {}
        
    async def process_agent_request(self, request: AgentRequest) -> AgentResponse:
        """
        Main entry point for external agents requesting help
        """
        start_time = datetime.utcnow()
        request.request_id = str(uuid.uuid4())
        
        try:
            # Log the incoming request
            await self._log_agent_request(request)
            
            # Determine optimal persona selection
            selected_personas = await self._select_personas_for_request(request)
            
            # Create specialized meeting for agent request
            meeting_config = await self._create_agent_meeting_config(request, selected_personas)
            
            # Execute the parliamentary session
            session_result = await self._execute_agent_session(meeting_config, request)
            
            # Process and format the response
            response = await self._format_agent_response(request, session_result, start_time)
            
            # Update usage tracking for billing
            await self._track_agent_usage(request, response)
            
            return response
            
        except Exception as e:
            error_response = AgentResponse(
                request_id=request.request_id,
                session_id="error",
                status="failed",
                solution=f"Parliament session failed: {str(e)}",
                confidence_score=0.0,
                reasoning="Internal error occurred",
                participating_personas=[],
                execution_time=(datetime.utcnow() - start_time).total_seconds(),
                metadata={"error": str(e)}
            )
            await self._log_agent_error(request, error_response)
            return error_response
    
    async def coordinate_multi_agents(self, agents: List[Dict], coordination_task: str) -> Dict:
        """
        Orchestrate multiple agents working together on a complex task
        """
        coordination_id = str(uuid.uuid4())
        
        # Create meta-request for coordination
        meta_request = AgentRequest(
            agent_name="MultiAgentCoordinator",
            agent_type="orchestrator", 
            request_type=AgentRequestType.MULTI_AGENT_COORDINATION,
            context=f"Coordinating {len(agents)} agents: {[a.get('name', 'Unknown') for a in agents]}",
            problem_description=coordination_task,
            urgency_level=5,
            metadata={"agent_count": len(agents), "coordination_id": coordination_id}
        )
        
        # Get parliament's coordination strategy
        strategy_response = await self.process_agent_request(meta_request)
        
        # Execute the coordination plan
        coordination_result = {
            "coordination_id": coordination_id,
            "strategy": strategy_response.solution,
            "confidence": strategy_response.confidence_score,
            "participating_agents": [a.get('name') for a in agents],
            "execution_plan": strategy_response.follow_up_suggestions,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return coordination_result
    
    async def emergency_fallback(self, failed_agent: str, failure_context: str, time_limit: int = 60) -> AgentResponse:
        """
        Emergency decision-making when other agents fail
        Ultra-fast response with high-priority personas
        """
        emergency_request = AgentRequest(
            agent_name=failed_agent,
            agent_type="emergency_fallback",
            request_type=AgentRequestType.EMERGENCY_FALLBACK,
            context=f"Agent {failed_agent} failed and needs immediate assistance",
            problem_description=failure_context,
            urgency_level=10,
            max_response_time=time_limit,
            required_personas=["mouse", "contextualist", "patternist"],  # Fastest, most reliable personas
            metadata={"is_emergency": True, "failed_agent": failed_agent}
        )
        
        return await self.process_agent_request(emergency_request)
    
    async def _select_personas_for_request(self, request: AgentRequest) -> List[str]:
        """
        AI-powered persona selection based on request type and context
        """
        if request.required_personas:
            return request.required_personas
            
        # Smart persona selection based on request type
        persona_mapping = {
            AgentRequestType.DECISION_HELP: ["mouse", "contextualist", "ego", "superego"],
            AgentRequestType.CREATIVE_SOLUTION: ["diviner", "patternist", "illustrator", "id"],
            AgentRequestType.PROBLEM_SOLVING: ["superscholar", "patternist", "contextualist", "naysayer"],
            AgentRequestType.EMERGENCY_FALLBACK: ["mouse", "contextualist", "patternist"],
            AgentRequestType.MULTI_AGENT_COORDINATION: ["superscholar", "contextualist", "ego", "mouse"],
            AgentRequestType.STRATEGY_PLANNING: ["mouse", "dolphin", "superscholar", "contextualist"]
        }
        
        base_personas = persona_mapping.get(request.request_type, ["mouse", "contextualist", "patternist"])
        
        # Add urgency-based personas
        if request.urgency_level >= 8:
            base_personas = ["mouse", "contextualist", "patternist"]  # Fast, reliable trio
        elif request.urgency_level <= 3:
            base_personas.extend(["diviner", "illustrator"])  # Add creative personas for low urgency
            
        return list(set(base_personas))  # Remove duplicates
    
    async def _create_agent_meeting_config(self, request: AgentRequest, personas: List[str]) -> Dict:
        """
        Create optimized meeting configuration for agent requests
        """
        return {
            "topic": f"Agent Support: {request.problem_description}",
            "description": f"""
Agent Request from {request.agent_name} ({request.agent_type}):

Context: {request.context}

Problem: {request.problem_description}

Previous Attempts: {', '.join(request.attempted_solutions) if request.attempted_solutions else 'None'}

Urgency Level: {request.urgency_level}/10

Required Response Time: {request.max_response_time} seconds

Please provide a clear, actionable solution that the requesting agent can implement.
            """,
            "proposer": f"AgentOrchestrator-{request.agent_name}",
            "is_agent_request": True,
            "agent_request_id": request.request_id,
            "selected_personas": personas,
            "max_duration": request.max_response_time,
            "urgency_mode": request.urgency_level >= 7,
            "metadata": request.metadata
        }
    
    async def _execute_agent_session(self, meeting_config: Dict, request: AgentRequest) -> Dict:
        """
        Execute the parliamentary session optimized for agent requests
        """
        # Create the meeting session
        session = await self.meeting_service.create_meeting(meeting_config)
        
        # Fast-track execution for urgent requests
        if request.urgency_level >= 8:
            session["fast_mode"] = True
            session["max_iterations"] = 2  # Limit iterations for speed
            
        # Execute the deliberation
        result = await self.meeting_service.execute_deliberation(session)
        
        return result
    
    async def _format_agent_response(self, request: AgentRequest, session_result: Dict, start_time: datetime) -> AgentResponse:
        """
        Format the parliamentary result into a structured agent response
        """
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Extract key information from session result
        solution = session_result.get("final_decision", "No solution reached")
        reasoning = session_result.get("reasoning", "Parliamentary deliberation completed")
        personas = session_result.get("participating_personas", [])
        
        # Calculate confidence based on consensus and completion
        confidence_score = session_result.get("consensus_score", 0.7)
        
        # Generate follow-up suggestions
        follow_ups = session_result.get("follow_up_actions", [])
        
        return AgentResponse(
            request_id=request.request_id,
            session_id=session_result.get("session_id", "unknown"),
            status="completed",
            solution=solution,
            confidence_score=confidence_score,
            reasoning=reasoning,
            participating_personas=personas,
            execution_time=execution_time,
            follow_up_suggestions=follow_ups,
            metadata={
                "session_data": session_result,
                "request_metadata": request.metadata,
                "performance_metrics": {
                    "response_time": execution_time,
                    "personas_used": len(personas),
                    "urgency_level": request.urgency_level
                }
            }
        )
    
    async def _log_agent_request(self, request: AgentRequest):
        """Log incoming agent requests for analytics and billing"""
        log_entry = {
            "id": str(uuid.uuid4()),
            "request_id": request.request_id,
            "timestamp": datetime.utcnow(),
            "agent_name": request.agent_name,
            "agent_type": request.agent_type,
            "request_type": request.request_type,
            "urgency_level": request.urgency_level,
            "context_length": len(request.context),
            "problem_length": len(request.problem_description),
            "metadata": request.metadata
        }
        
        await self.db.agent_requests.insert_one(log_entry)
    
    async def _track_agent_usage(self, request: AgentRequest, response: AgentResponse):
        """Track usage for billing and analytics"""
        usage_entry = {
            "id": str(uuid.uuid4()),
            "request_id": request.request_id,
            "timestamp": datetime.utcnow(),
            "agent_name": request.agent_name,
            "execution_time": response.execution_time,
            "personas_used": len(response.participating_personas),
            "success": response.status == "completed",
            "confidence_score": response.confidence_score,
            "billable_units": self._calculate_billable_units(request, response),
            "metadata": {
                "request_type": request.request_type,
                "urgency_level": request.urgency_level,
                "agent_type": request.agent_type
            }
        }
        
        await self.db.agent_usage.insert_one(usage_entry)
    
    def _calculate_billable_units(self, request: AgentRequest, response: AgentResponse) -> float:
        """
        Calculate billable units based on complexity and resources used
        """
        base_cost = 1.0  # Base unit
        
        # Urgency multiplier
        urgency_multiplier = 1.0 + (request.urgency_level - 1) * 0.2
        
        # Persona count multiplier 
        persona_multiplier = len(response.participating_personas) * 0.3
        
        # Execution time factor
        time_factor = min(response.execution_time / 60, 5.0)  # Cap at 5x for long executions
        
        total_units = base_cost * urgency_multiplier * (1 + persona_multiplier) * (1 + time_factor * 0.1)
        
        return round(total_units, 2)
    
    async def _log_agent_error(self, request: AgentRequest, response: AgentResponse):
        """Log errors for debugging and improvement"""
        error_entry = {
            "id": str(uuid.uuid4()),
            "request_id": request.request_id,
            "timestamp": datetime.utcnow(),
            "agent_name": request.agent_name,
            "error_message": response.solution,
            "metadata": response.metadata,
            "request_data": request.dict()
        }
        
        await self.db.agent_errors.insert_one(error_entry)

# Global orchestrator instance
orchestrator = None

def get_orchestrator():
    return orchestrator

def init_orchestrator(db, meeting_service):
    global orchestrator
    orchestrator = AgentOrchestrator(db, meeting_service)
    return orchestrator