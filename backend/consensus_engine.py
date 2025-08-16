"""
Advanced Consensus Engine - Unanimous, Majority, Supermajority
"""

import asyncio
from enum import Enum
from typing import Dict, List, Optional
from datetime import datetime

class ConsensusType(str, Enum):
    MAJORITY_50 = "majority_50"
    MAJORITY_75 = "majority_75" 
    UNANIMOUS = "unanimous"

class ConsensusEngine:
    def __init__(self, db, token_tracker):
        self.db = db
        self.token_tracker = token_tracker
        self.pricing = {
            ConsensusType.MAJORITY_50: 1.0,
            ConsensusType.MAJORITY_75: 1.5,
            ConsensusType.UNANIMOUS: 10.0
        }
        
    async def check_consensus(self, session_id: str, responses: Dict, 
                             consensus_type: ConsensusType, 
                             max_cycles: int = 2) -> Dict:
        """Main consensus checking engine"""
        
        # Exclude naysayer from unanimous votes
        voting_personas = list(responses.keys())
        if consensus_type == ConsensusType.UNANIMOUS and "naysayer" in voting_personas:
            voting_personas.remove("naysayer")
            
        cycle = 0
        consensus_achieved = False
        debate_history = []
        
        while cycle < max_cycles and not consensus_achieved:
            cycle += 1
            
            # Check current consensus
            consensus_result = await self._evaluate_consensus(
                responses, voting_personas, consensus_type
            )
            
            if consensus_result["achieved"]:
                consensus_achieved = True
                break
                
            # If not achieved and cycles remain, initiate debate
            if cycle < max_cycles:
                debate_round = await self._conduct_debate_round(
                    session_id, responses, consensus_result["conflicts"], cycle
                )
                debate_history.append(debate_round)
                
                # Update responses with debate results
                responses.update(debate_round.get("updated_responses", {}))
                
        # Track token usage
        cost_multiplier = self.pricing[consensus_type] * cycle
        await self.token_tracker.track_usage(
            user_id=session_id,  # Simplified for demo
            session_id=session_id,
            action_type=f"consensus_{consensus_type}",
            tokens_used=1000 * cycle,
            metadata={
                "consensus_type": consensus_type,
                "cycles_used": cycle,
                "cost_multiplier": cost_multiplier
            }
        )
        
        return {
            "consensus_achieved": consensus_achieved,
            "consensus_type": consensus_type,
            "cycles_used": cycle,
            "max_cycles": max_cycles,
            "final_agreement": consensus_result if consensus_achieved else None,
            "debate_history": debate_history,
            "cost_multiplier": cost_multiplier,
            "participating_personas": voting_personas
        }
    
    async def _evaluate_consensus(self, responses: Dict, voting_personas: List, 
                                 consensus_type: ConsensusType) -> Dict:
        """Evaluate if consensus is achieved"""
        
        total_voters = len(voting_personas)
        required_agreement = {
            ConsensusType.MAJORITY_50: total_voters // 2 + 1,
            ConsensusType.MAJORITY_75: int(total_voters * 0.75),
            ConsensusType.UNANIMOUS: total_voters
        }
        
        # Simplified agreement analysis
        agreements = await self._analyze_agreements(responses, voting_personas)
        agreed_count = len(agreements["agreed"])
        
        achieved = agreed_count >= required_agreement[consensus_type]
        
        return {
            "achieved": achieved,
            "agreed_personas": agreements["agreed"],
            "conflicted_personas": agreements["conflicted"],
            "agreement_score": agreed_count / total_voters,
            "required_score": required_agreement[consensus_type] / total_voters,
            "conflicts": agreements.get("conflict_details", [])
        }
    
    async def _analyze_agreements(self, responses: Dict, voting_personas: List) -> Dict:
        """Analyze which personas agree vs conflict"""
        # Simplified analysis - in production would use NLP
        agreed = []
        conflicted = []
        
        # Mock agreement analysis
        for persona in voting_personas:
            if persona in responses:
                # Simplified: longer responses indicate more agreement
                response_length = len(str(responses[persona].get("response", "")))
                if response_length > 100:  # Mock threshold
                    agreed.append(persona)
                else:
                    conflicted.append(persona)
                    
        return {
            "agreed": agreed,
            "conflicted": conflicted,
            "conflict_details": [f"{p} needs more alignment" for p in conflicted]
        }
    
    async def _conduct_debate_round(self, session_id: str, responses: Dict, 
                                  conflicts: List, cycle: int) -> Dict:
        """Conduct a debate round to resolve conflicts"""
        
        # Log debate initiation
        await self.db.consensus_debates.insert_one({
            "session_id": session_id,
            "cycle": cycle,
            "conflicts": conflicts,
            "timestamp": datetime.utcnow(),
            "status": "initiated"
        })
        
        # Mock debate resolution - in production would call LLMs
        debate_result = {
            "cycle": cycle,
            "conflicts_addressed": conflicts,
            "resolution_attempts": len(conflicts),
            "updated_responses": {},
            "success": cycle <= 2  # Mock success rate
        }
        
        # Update debate log
        await self.db.consensus_debates.update_one(
            {"session_id": session_id, "cycle": cycle},
            {"$set": {"result": debate_result, "status": "completed"}}
        )
        
        return debate_result

# Global instance
consensus_engine = None

def get_consensus_engine():
    return consensus_engine

def init_consensus_engine(db, token_tracker):
    global consensus_engine
    consensus_engine = ConsensusEngine(db, token_tracker)
    return consensus_engine