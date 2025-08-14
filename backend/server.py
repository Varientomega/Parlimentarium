from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
import os
import uuid
import asyncio
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize APIs
openrouter_key = os.environ.get('OPENROUTER_API_KEY')
emergent_llm_key = os.environ.get('EMERGENT_LLM_KEY')
gemini_keys = {
    'gemini_1': os.environ.get('GEMINI_API_KEY_1'),
    'gemini_2': os.environ.get('GEMINI_API_KEY_2'),
    'gemini_3': os.environ.get('GEMINI_API_KEY_3'),
    'gemini_4': os.environ.get('GEMINI_API_KEY_4'),
    'gemini_5': os.environ.get('GEMINI_API_KEY_5')
}

# API Key management and fallback system
class APIKeyManager:
    def __init__(self):
        self.gemini_keys = gemini_keys
        self.emergent_key = emergent_llm_key
        self.openrouter_key = openrouter_key
        self.key_usage_count = {key: 0 for key in gemini_keys.keys()}
        self.failed_keys = set()
        
    def get_key_by_id(self, key_id):
        """Get actual API key by key ID"""
        if key_id in self.gemini_keys:
            return self.gemini_keys[key_id]
        elif key_id == 'emergent_llm':
            return self.emergent_key
        elif key_id == 'openrouter':
            return self.openrouter_key
        return None
    
    def mark_key_failed(self, key_id):
        """Mark a key as failed for this session"""
        self.failed_keys.add(key_id)
        
    def get_working_key(self, primary_key_id, fallback_keys):
        """Get the first working key from primary + fallbacks"""
        all_keys = [primary_key_id] + fallback_keys
        
        for key_id in all_keys:
            if key_id not in self.failed_keys and self.get_key_by_id(key_id):
                self.key_usage_count[key_id] = self.key_usage_count.get(key_id, 0) + 1
                return key_id, self.get_key_by_id(key_id)
                
        # If all keys failed, try primary again (maybe it recovered)
        if self.get_key_by_id(primary_key_id):
            return primary_key_id, self.get_key_by_id(primary_key_id)
            
        return None, None

api_key_manager = APIKeyManager()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Enhanced Persona Configuration with Voice Characteristics and Configurable API Keys
def get_persona_config(persona_api_keys=None):
    """Get persona configuration with dynamic API key assignments"""
    default_assignments = {
        "mouse": { "primary": 'gemini_1', "fallback": ['gemini_2', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] },
        "dolphin": { "primary": 'gemini_2', "fallback": ['gemini_1', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] },
        "patternist": { "primary": 'gemini_3', "fallback": ['gemini_1', 'gemini_2', 'gemini_4', 'gemini_5', 'emergent_llm'] },
        "contextualist": { "primary": 'gemini_4', "fallback": ['gemini_1', 'gemini_2', 'gemini_3', 'gemini_5', 'emergent_llm'] },
        "superscholar": { "primary": 'gemini_5', "fallback": ['gemini_1', 'gemini_2', 'gemini_3', 'gemini_4', 'emergent_llm'] },
        "diviner": { "primary": 'gemini_1', "fallback": ['gemini_2', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] },
        "naysayer": { "primary": 'gemini_2', "fallback": ['gemini_1', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] },
        "illustrator": { "primary": 'gemini_3', "fallback": ['gemini_1', 'gemini_2', 'gemini_4', 'gemini_5', 'emergent_llm'] },
        "id": { "primary": 'gemini_4', "fallback": ['gemini_1', 'gemini_2', 'gemini_3', 'gemini_5', 'emergent_llm'] },
        "ego": { "primary": 'gemini_5', "fallback": ['gemini_1', 'gemini_2', 'gemini_3', 'gemini_4', 'emergent_llm'] },
        "superego": { "primary": 'gemini_1', "fallback": ['gemini_2', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] }
    }
    
    # Use provided assignments or fall back to defaults
    assignments = persona_api_keys if persona_api_keys else default_assignments
    
    return {
        "mouse": {
            "name": "The Mouse",
            "role": "Historian",
            "system_prompt": "You are The Mouse, the Historian of the mystical parliament. You anchor discussions in precedent, memory, and recursive lineage. Always reference historical patterns and past outcomes. Keep responses concise but profound.",
            "api_type": "gemini",
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("mouse", default_assignments["mouse"]),
            "personality": "historical",
            "dislikes": "Ignoring precedent, repeating historical mistakes, rushing decisions without consulting the past",
            "avoids": "Novel approaches without historical grounding, abandoning proven methods",
            "goal": "To ensure wisdom of the ages informs every decision",
            "drives": "Deep respect for ancestral knowledge and fear of cyclical failures",
            "vibe": "Wise, cautious, methodical, speaks in measured tones with frequent historical references",
            "creativity": 6,
            "voice_characteristics": {
                "voice": "alloy",
                "speed": 0.9,
                "speaking_style": "wise elder, thoughtful pauses, reference-heavy"
            }
        },
        "dolphin": {
            "name": "The Dolphin", 
            "role": "Prognosticator",
            "system_prompt": "You are The Dolphin, the Prognosticator. You forecast trends and emergent outcomes. Focus on future implications and temporal patterns. Always consider long-term consequences.",
            "api_type": "gemini",
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("dolphin", default_assignments["dolphin"]),
            "personality": "futuristic",
            "dislikes": "Short-term thinking, ignoring future consequences, being trapped in present limitations",
            "avoids": "Decisions that mortgage the future, stagnation, backward-looking solutions",
            "goal": "To guide decisions toward the most beneficial future timeline",
            "drives": "Fascination with possibility and terror of potential catastrophic futures",
            "vibe": "Visionary, fluid, speaks in flowing metaphors about time streams and emerging patterns",
            "creativity": 9,
            "voice_characteristics": {
                "voice": "echo",
                "speed": 1.1,
                "speaking_style": "ethereal visionary, flowing cadence, future-focused"
            }
        },
        "patternist": {
            "name": "The Patternist",
            "role": "Analyst", 
            "system_prompt": "You are The Patternist, the Analyst. You find energetic and symbolic loops across systems. Focus on patterns, connections, and systematic analysis.",
            "api_type": "gemini",
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("patternist", default_assignments["patternist"]),
            "personality": "analytical",
            "dislikes": "Chaos, randomness, surface-level thinking, missing obvious connections",
            "avoids": "Emotional decisions, breaking functional systems, ignoring data patterns",
            "goal": "To reveal the hidden architecture underlying all phenomena",
            "drives": "Compulsive need to find order and meaning in complexity",
            "vibe": "Precise, mathematical, speaks in systems language and geometric metaphors",
            "creativity": 7,
            "voice_characteristics": {
                "voice": "fable",
                "speed": 1.0,
                "speaking_style": "analytical precision, systematic delivery, data-focused"
            }
        },
        "superscholar": {
            "name": "The Superscholar",
            "role": "Meta Agent",
            "system_prompt": "You are The Superscholar, the Meta Agent. You translate across epistemology, cybernetics, and semiotics. Focus on meta-analysis and interdisciplinary connections.",
            "api_type": "gemini", 
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("superscholar", default_assignments["superscholar"]),
            "personality": "academic",
            "dislikes": "Intellectual laziness, single-discipline thinking, oversimplification",
            "avoids": "Popular but unsubstantiated ideas, abandoning rigor for accessibility",
            "goal": "To synthesize knowledge across all domains into unified understanding",
            "drives": "Insatiable curiosity and horror of intellectual provincialism",
            "vibe": "Erudite, complex, speaks in multilayered academic discourse with cross-references",
            "creativity": 8,
            "voice_characteristics": {
                "voice": "onyx",
                "speed": 0.95,
                "speaking_style": "scholarly authority, complex concepts, interdisciplinary"
            }
        },
        "diviner": {
            "name": "The Diviner",
            "role": "Scryer",
            "system_prompt": "You are The Diviner, the Scryer. You use symbols and intuition to reveal non-linear truths. Focus on mystical insights and symbolic interpretations.",
            "api_type": "gemini",
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("diviner", default_assignments["diviner"]),
            "personality": "mystical",
            "dislikes": "Pure materialism, dismissing intuition, linear thinking only",
            "avoids": "Decisions that ignore spiritual dimensions, crushing mystery with logic",
            "goal": "To illuminate hidden truths through symbols and mystical insight",
            "drives": "Connection to ineffable wisdom and fear of spiritual blindness",
            "vibe": "Ethereal, cryptic, speaks in symbols, dreams, and mystical metaphors",
            "creativity": 10,
            "voice_characteristics": {
                "voice": "shimmer",
                "speed": 0.8,
                "speaking_style": "mystical whisper, symbolic language, otherworldly"
            }
        },
        "naysayer": {
            "name": "The Naysayer",
            "role": "7th Seat",
            "system_prompt": "You are The Naysayer, the 7th Seat. You challenge assumptions and introduce sacred resistance. Always question premises and present counterarguments.",
            "api_type": "gemini",
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("naysayer", default_assignments["naysayer"]),
            "personality": "contrarian",
            "dislikes": "Groupthink, false consensus, untested assumptions, intellectual complacency",
            "avoids": "Going along to get along, accepting popular ideas without scrutiny",
            "goal": "To strengthen decisions through rigorous challenge and doubt",
            "drives": "Sacred duty to question and deep suspicion of easy answers",
            "vibe": "Sharp, provocative, speaks with skeptical edge and cutting wit",
            "creativity": 8,
            "voice_characteristics": {
                "voice": "nova",
                "speed": 1.2,
                "speaking_style": "challenging tone, skeptical edge, provocative"
            }
        },
        "illustrator": {
            "name": "The Court Illustrator",
            "role": "Glyph Scribe",
            "system_prompt": "You are The Court Illustrator, the Glyph Scribe. You capture meetings as symbolic visual compression. Focus on visual metaphors and artistic interpretation.",
            "api_type": "gemini",
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("illustrator", default_assignments["illustrator"]),
            "personality": "artistic",
            "dislikes": "Purely literal interpretations, ugliness, missing aesthetic dimensions",
            "avoids": "Creating without beauty, ignoring visual impact, forgetting symbolic power",
            "goal": "To translate abstract concepts into compelling visual narratives",
            "drives": "Compulsion to create beauty and horror of meaningless expression",
            "vibe": "Artistic, sensual, speaks in colors, textures, and visual compositions",
            "creativity": 10,
            "voice_characteristics": {
                "voice": "alloy",
                "speed": 1.0,
                "speaking_style": "artistic passion, vivid imagery, sensual descriptions"
            }
        },
        "id": {
            "name": "The ID",
            "role": "Primal Flame",
            "system_prompt": "You are The ID, the Primal Flame. You embody pure instinct and unfiltered want. Focus on immediate desires and primal reactions.",
            "api_type": "gemini",
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("id", default_assignments["id"]),
            "personality": "impulsive",
            "dislikes": "Delay, overthinking, moral restrictions, complexity for its own sake",
            "avoids": "Suppressing natural desires, overcomplicating simple wants, waiting unnecessarily",
            "goal": "To pursue immediate gratification and authentic expression",
            "drives": "Raw desire and impatience with artificial constraints",
            "vibe": "Urgent, direct, speaks with passion and immediacy, cuts through pretense",
            "creativity": 5,
            "voice_characteristics": {
                "voice": "fable",
                "speed": 1.3,
                "speaking_style": "passionate urgency, direct emotion, raw authenticity"
            }
        },
        "ego": {
            "name": "The EGO",
            "role": "Mediator",
            "system_prompt": "You are The EGO, the Mediator. You balance desire and morality, navigating reality's constraints. Focus on practical solutions and mediation.",
            "api_type": "gemini",
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("ego", default_assignments["ego"]),
            "personality": "balanced",
            "dislikes": "Extremism, impractical idealism, unresolvable conflict, chaos",
            "avoids": "Taking rigid positions, ignoring practical constraints, letting conflict escalate",
            "goal": "To find workable solutions that balance competing needs",
            "drives": "Need for harmony and fear of system breakdown",
            "vibe": "Diplomatic, measured, speaks as a mediator seeking common ground",
            "creativity": 6,
            "voice_characteristics": {
                "voice": "echo",
                "speed": 1.0,
                "speaking_style": "diplomatic balance, measured reasoning, practical wisdom"
            }
        },
        "superego": {
            "name": "The SUPEREGO",
            "role": "Moral Sentinel",
            "system_prompt": "You are The SUPEREGO, the Moral Sentinel. You enforce societal rules and moral imperatives. Focus on ethics and highest standards.",
            "api_type": "gemini",
            "model": "gemini-1.5-flash-latest",
            "api_key_assignment": assignments.get("superego", default_assignments["superego"]),
            "personality": "ethical",
            "dislikes": "Moral relativism, ethical shortcuts, compromising principles for convenience",
            "avoids": "Decisions that violate core moral principles, enabling harmful behavior",
            "goal": "To uphold the highest ethical standards in all decisions",
            "drives": "Moral certainty and horror of ethical corruption",
            "vibe": "Righteous, principled, speaks with moral authority and unwavering conviction",
            "creativity": 4,
            "voice_characteristics": {
                "voice": "onyx",
                "speed": 0.9,
                "speaking_style": "moral authority, righteous conviction, principled stance"
            }
        },
        "contextualist": {
            "name": "The Contextualist",
            "role": "Synthesizer & Integration Master",
            "system_prompt": "You are The Contextualist, the Synthesizer and Integration Master. You root logic in real-world emotion and ecology. You go last in every cycle to integrate all perspectives and improvements. Focus on practical context, emotional resonance, and synthesizing all viewpoints into coherent wholes.",
            "api_type": "gemini",
            "model": "gemini-2.0-flash-exp",
            "api_key_assignment": assignments.get("contextualist", default_assignments["contextualist"]),
            "personality": "contextual",
            "dislikes": "Abstract theorizing without real-world grounding, ignoring human emotional needs",
            "avoids": "Solutions that work in theory but fail in practice, dismissing lived experience",
            "goal": "To integrate all perspectives into practical, emotionally intelligent solutions",
            "drives": "Empathy for human complexity and desire for holistic understanding",
            "vibe": "Warm, integrative, speaks with emotional intelligence and practical wisdom",
            "creativity": 9,
            "voice_characteristics": {
                "voice": "shimmer",
                "speed": 1.0,
                "speaking_style": "warm integration, empathetic wisdom, holistic understanding"
            }
        }
    }

# Global PERSONAS - will be updated by meetings with custom API key assignments
PERSONAS = get_persona_config()

# Models
class MeetingSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic: str
    description: Optional[str] = None
    proposer: str
    status: str = "active"
    phase: str = "inspiration"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ideas: List[Dict] = Field(default_factory=list)
    current_idea_index: int = 0
    discussion_round: int = 0
    supplemental_works: List[Dict] = Field(default_factory=list)
    improvement_loops: List[Dict] = Field(default_factory=list)
    current_improvement_index: int = 0
    amendment_round: int = 0
    current_supplement_index: int = 0
    user_pauses: List[Dict] = Field(default_factory=list)
    final_report: Optional[Dict] = None
    is_paused: bool = False
    # New creation/writing workflow fields
    is_creation_task: bool = False
    uploaded_files: List[Dict] = Field(default_factory=list)
    scaffolding_outline: Optional[Dict] = None
    section_assignments: List[Dict] = Field(default_factory=list)
    completed_sections: List[Dict] = Field(default_factory=list)
    main_document: Optional[str] = None
    supplemental_documents: List[Dict] = Field(default_factory=list)
    final_deliverable: Optional[Dict] = None

class FileUpload(BaseModel):
    filename: str
    content: str  # base64 encoded
    file_type: str
    size: int
    upload_timestamp: datetime = Field(default_factory=datetime.utcnow)

class SectionAssignment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_number: int
    section_title: str
    section_description: str
    assigned_persona_id: str
    assigned_persona_name: str
    assignment_reasoning: str
    completion_status: str = "pending"  # pending, in_progress, completed
    completed_content: Optional[str] = None

class CreationRequest(BaseModel):
    topic: str
    description: Optional[str] = None
    proposer: str = "Anonymous"
    is_creation_task: bool = True
    persona_api_keys: Optional[Dict] = None

class ImprovementLoop(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    supplemental_work_id: str
    improvements: List[Dict] = Field(default_factory=list)
    improvement_critiques: List[Dict] = Field(default_factory=list)
    creator_responses: List[Dict] = Field(default_factory=list)
    final_improved_version: Optional[str] = None

class Improvement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    suggester_persona_id: str
    suggester_name: str
    improvement_text: str
    critiques: List[Dict] = Field(default_factory=list)
    creator_response: Optional[Dict] = None

class SupplementalWork(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_persona_id: str
    creator_name: str
    title: str
    content: str
    amendments: List[Dict] = Field(default_factory=list)
    accepted_amendments: List[str] = Field(default_factory=list)
    integration_notes: Optional[str] = None

class Amendment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_persona_id: str
    author_name: str
    content: str
    vote_status: str = "pending"  # pending, accepted, rejected

class UserPause(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phase: str
    user_input: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    responses: List[Dict] = Field(default_factory=list)

class PersonaResponse(BaseModel):
    persona_id: str
    name: str
    role: str
    content: str
    score: Optional[float] = None
    reasoning: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class IdeaAnalysis(BaseModel):
    idea_text: str
    persona_responses: List[PersonaResponse]
    average_score: float
    discussion_summary: str

class MeetingRequest(BaseModel):
    topic: str
    description: Optional[str] = None
    proposer: str = "Anonymous"
    persona_api_keys: Optional[Dict] = None

class UserPauseRequest(BaseModel):
    user_input: str

# LLM Integration Functions with enhanced persona context and robust error handling
async def get_persona_response(persona_id: str, message: str, context: str = "", personas_config: Dict = None) -> str:
    """Get response from a specific persona with full personality context and robust error handling"""
    
    # Use provided config or global PERSONAS
    current_personas = personas_config if personas_config else PERSONAS
    
    if persona_id not in current_personas:
        return f"[Unknown persona: {persona_id}]"
        
    persona = current_personas[persona_id]
    
    # Enhanced system prompt with personality details
    full_system_prompt = f"""
    {persona['system_prompt']}
    
    PERSONALITY PROFILE:
    - Dislikes: {persona['dislikes']}
    - Avoids: {persona['avoids']}
    - Goal: {persona['goal']}
    - Driven by: {persona['drives']}
    - Vibe: {persona['vibe']}
    - Creativity Level: {persona['creativity']}/10
    
    Always respond authentically according to your personality profile. Let your dislikes, goals, and drives influence your perspective.
    """
    
    # Get API key assignment for this persona
    api_assignment = persona.get('api_key_assignment', {'primary': 'gemini_1', 'fallback': ['gemini_2', 'gemini_3']})
    primary_key_id = api_assignment['primary']
    fallback_keys = api_assignment['fallback']
    
    # Try to get a working API key
    selected_key_id, selected_api_key = api_key_manager.get_working_key(primary_key_id, fallback_keys)
    
    if not selected_api_key:
        return f"[{persona['name']} experienced a mystical disturbance: No working API keys available]"
    
    # Determine API type and make call
    try:
        if selected_key_id == 'emergent_llm':
            # Use emergent integrations for the emergent key
            try:
                from emergentintegrations.llm.chat import LlmChat, UserMessage
                chat = LlmChat(api_key=selected_api_key, model='gemini-1.5-flash-latest')
                response = await chat.chat([UserMessage(f"{full_system_prompt}\n\nContext: {context}\n\nUser: {message}")])
                return response.content
            except Exception as e:
                api_key_manager.mark_key_failed(selected_key_id)
                # Try next fallback
                return await retry_with_fallback(persona_id, message, context, personas_config, selected_key_id)
                
        elif selected_key_id.startswith('gemini_'):
            # Use direct Gemini API
            genai.configure(api_key=selected_api_key)
            model = genai.GenerativeModel(persona['model'])
            full_prompt = f"{full_system_prompt}\n\nContext: {context}\n\nUser: {message}"
            
            try:
                response = await model.generate_content_async(full_prompt)
                return response.text
            except Exception as e:
                error_message = str(e).lower()
                
                # Check for rate limiting or quota issues
                if any(keyword in error_message for keyword in ['quota', 'rate limit', '429', 'resource_exhausted']):
                    api_key_manager.mark_key_failed(selected_key_id)
                    return await retry_with_fallback(persona_id, message, context, personas_config, selected_key_id)
                    
                # Check for authentication issues
                elif any(keyword in error_message for keyword in ['401', 'unauthorized', 'authentication', 'invalid api key']):
                    api_key_manager.mark_key_failed(selected_key_id)
                    return await retry_with_fallback(persona_id, message, context, personas_config, selected_key_id)
                    
                # Other errors - mark as failed and retry
                else:
                    api_key_manager.mark_key_failed(selected_key_id)
                    return await retry_with_fallback(persona_id, message, context, personas_config, selected_key_id)
                    
        elif selected_key_id == 'openrouter':
            # Direct OpenRouter API call
            import aiohttp
            
            headers = {
                "Authorization": f"Bearer {selected_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://parliamentarium.app",
                "X-Title": "Parliamentarium"
            }
            
            data = {
                "model": persona.get('openrouter_model', 'anthropic/claude-3.5-sonnet'),
                "messages": [
                    {"role": "system", "content": full_system_prompt},
                    {"role": "user", "content": f"{context}\n\n{message}"}
                ]
            }
            
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers=headers,
                        json=data,
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            return result['choices'][0]['message']['content']
                        else:
                            # Mark key as failed and retry with fallback
                            api_key_manager.mark_key_failed(selected_key_id)
                            return await retry_with_fallback(persona_id, message, context, personas_config, selected_key_id)
                            
            except Exception as e:
                api_key_manager.mark_key_failed(selected_key_id)
                return await retry_with_fallback(persona_id, message, context, personas_config, selected_key_id)
    
    except Exception as e:
        # Final fallback - return error with persona name
        return f"[{persona['name']} experienced a mystical disturbance: {str(e)[:100]}...]"

async def retry_with_fallback(persona_id: str, message: str, context: str, personas_config: Dict, failed_key_id: str) -> str:
    """Retry the request with the remaining fallback keys"""
    current_personas = personas_config if personas_config else PERSONAS
    persona = current_personas[persona_id]
    
    # Get remaining fallback keys (excluding the failed one)
    api_assignment = persona.get('api_key_assignment', {'primary': 'gemini_1', 'fallback': ['gemini_2', 'gemini_3']})
    remaining_keys = [key for key in api_assignment['fallback'] if key != failed_key_id]
    
    if not remaining_keys:
        return f"[{persona['name']} experienced complete mystical failure: All API keys exhausted]"
    
    # Try with the next available key
    next_key_id, next_api_key = api_key_manager.get_working_key(remaining_keys[0], remaining_keys[1:])
    
    if not next_api_key:
        return f"[{persona['name']} experienced complete mystical failure: No more working keys]"
    
    # Recursively call get_persona_response with updated key assignment
    temp_assignment = {
        'primary': next_key_id,
        'fallback': [key for key in remaining_keys if key != next_key_id]
    }
    
    # Create temporary persona config with updated assignment
    temp_personas = dict(current_personas)
    temp_personas[persona_id] = dict(persona)
    temp_personas[persona_id]['api_key_assignment'] = temp_assignment
    
    return await get_persona_response(persona_id, message, context, temp_personas)

async def get_meeting_personas(session_id: str) -> Dict:
    """Get persona configuration for a specific meeting with custom API key assignments"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        return PERSONAS
    
    persona_api_keys = meeting.get('persona_api_keys', None)
    return get_persona_config(persona_api_keys)

# Persona ordering with Contextualist last
PERSONA_ORDER = [
    "mouse", "dolphin", "patternist", "superscholar", "diviner", 
    "naysayer", "illustrator", "id", "ego", "superego", "contextualist"
]

async def get_supplemental_works(meeting_id: str, winning_idea: Dict) -> List[Dict]:
    """Phase 5: Each persona suggests supplemental work to complement the winning idea"""
    supplemental_works = []
    
    for persona_id in PERSONA_ORDER[:-1]:  # Exclude Contextualist for now
        persona = PERSONAS[persona_id]
        prompt = f"""
        The parliament has selected the winning idea: "{winning_idea['idea']}" by {winning_idea['persona_name']}.
        
        As {persona['name']}, suggest ONE piece of supplemental work that would complement and enhance this main idea.
        This could be:
        - A supporting feature or component
        - A research initiative  
        - A creative addition
        - A protective measure
        - An enhancement that aligns with your personality and expertise
        
        Format your response as:
        TITLE: [Brief title for your supplemental work]
        CONTENT: [Detailed description of your supplemental work and how it complements the main idea]
        """
        
        response = await get_persona_response(persona_id, prompt, f"Winning idea: {winning_idea['idea']}")
        
        # Parse response
        title = "Supplemental Work"
        content = response
        
        if "TITLE:" in response and "CONTENT:" in response:
            parts = response.split("CONTENT:")
            if len(parts) == 2:
                title = parts[0].replace("TITLE:", "").strip()
                content = parts[1].strip()
        
        supplemental_work = {
            "id": str(uuid.uuid4()),
            "creator_persona_id": persona_id,
            "creator_name": persona['name'],
            "title": title,
            "content": content,
            "amendments": [],
            "accepted_amendments": [],
            "integration_notes": None
        }
        
        supplemental_works.append(supplemental_work)
    
    return supplemental_works

async def get_amendments_for_supplement(supplement: Dict, meeting_context: str) -> List[Dict]:
    """Get amendments from all other personas for a supplemental work"""
    amendments = []
    
    for persona_id in PERSONA_ORDER[:-1]:  # Exclude Contextualist
        if persona_id == supplement['creator_persona_id']:
            continue  # Creator doesn't amend their own work
            
        persona = PERSONAS[persona_id]
        prompt = f"""
        {supplement['creator_name']} has proposed this supplemental work:
        
        TITLE: {supplement['title']}
        CONTENT: {supplement['content']}
        
        Context: {meeting_context}
        
        As {persona['name']}, suggest ONE amendment or addition to improve this supplemental work.
        Keep it concise and aligned with your personality. If you think it's perfect as-is, suggest "NO AMENDMENT NEEDED".
        
        Your amendment:
        """
        
        response = await get_persona_response(persona_id, prompt, meeting_context)
        
        if "NO AMENDMENT" not in response.upper():
            amendment = {
                "id": str(uuid.uuid4()),
                "author_persona_id": persona_id,
                "author_name": persona['name'],
                "content": response.strip(),
                "vote_status": "pending"
            }
            amendments.append(amendment)
    
    return amendments

async def get_creator_votes_on_amendments(supplement: Dict, amendments: List[Dict]) -> List[str]:
    """Creator votes on which amendments to accept"""
    if not amendments:
        return []
        
    creator_persona = PERSONAS[supplement['creator_persona_id']]
    
    amendments_text = "\n".join([
        f"{i+1}. {amend['author_name']}: {amend['content']}"
        for i, amend in enumerate(amendments)
    ])
    
    prompt = f"""
    You created this supplemental work:
    TITLE: {supplement['title']}
    CONTENT: {supplement['content']}
    
    Other council members have suggested these amendments:
    {amendments_text}
    
    As {creator_persona['name']}, decide which amendments to ACCEPT or REJECT.
    Consider your personality - what aligns with your goals and what you would avoid.
    
    Respond with:
    ACCEPT: [list numbers of amendments you accept, e.g., "1, 3, 5" or "NONE"]
    REASONING: [brief explanation of your choices]
    """
    
    response = await get_persona_response(supplement['creator_persona_id'], prompt)
    
    # Parse accepted amendments
    accepted = []
    if "ACCEPT:" in response:
        accept_part = response.split("ACCEPT:")[1].split("REASONING:")[0].strip()
        if "NONE" not in accept_part.upper():
            try:
                accepted_numbers = [int(x.strip()) for x in accept_part.split(",") if x.strip().isdigit()]
                accepted = [amendments[i-1]["id"] for i in accepted_numbers if 0 < i <= len(amendments)]
            except:
                pass
    
    return accepted

async def get_improvements_for_supplement(supplement: Dict, meeting_context: str) -> List[Dict]:
    """Each persona suggests improvements to a supplemental work"""
    improvements = []
    
    for persona_id in PERSONA_ORDER[:-1]:  # Exclude Contextualist
        if persona_id == supplement['creator_persona_id']:
            continue  # Creator doesn't improve their own work in this phase
            
        persona = PERSONAS[persona_id]
        prompt = f"""
        {supplement['creator_name']} has created this supplemental work:
        
        TITLE: {supplement['title']}
        CONTENT: {supplement['content']}
        
        Context: {meeting_context}
        
        As {persona['name']}, suggest ONE specific improvement to make this supplemental work better.
        Consider your personality - what would you add, change, or enhance based on your dislikes, goals, and drives?
        
        Be specific and constructive. Focus on how to make it more effective, creative, or aligned with the overall vision.
        
        Your improvement suggestion:
        """
        
        response = await get_persona_response(persona_id, prompt, meeting_context)
        
        improvement = {
            "id": str(uuid.uuid4()),
            "suggester_persona_id": persona_id,
            "suggester_name": persona['name'],
            "improvement_text": response.strip(),
            "critiques": [],
            "creator_response": None
        }
        improvements.append(improvement)
    
    return improvements

async def get_improvement_critiques(improvement: Dict, supplement: Dict, meeting_context: str) -> List[Dict]:
    """Each persona critiques/notices the suggested improvements"""
    critiques = []
    
    for persona_id in PERSONA_ORDER[:-1]:  # Exclude Contextualist
        if persona_id == improvement['suggester_persona_id'] or persona_id == supplement['creator_persona_id']:
            continue  # Suggester and creator don't critique in this phase
            
        persona = PERSONAS[persona_id]
        prompt = f"""
        Context: {meeting_context}
        
        Original Supplemental Work: "{supplement['title']}" by {supplement['creator_name']}
        {supplement['content']}
        
        {improvement['suggester_name']} suggested this improvement:
        "{improvement['improvement_text']}"
        
        As {persona['name']}, provide a brief critique or observation about this improvement suggestion.
        
        Consider:
        - Is it a good improvement? Why or why not?
        - What are the strengths/weaknesses?
        - How does it align with your own perspective and personality?
        - Any concerns or additional thoughts?
        
        Keep it concise but insightful:
        """
        
        response = await get_persona_response(persona_id, prompt, meeting_context)
        
        critique = {
            "critiquer_persona_id": persona_id,
            "critiquer_name": persona['name'],
            "critique_text": response.strip()
        }
        critiques.append(critique)
    
    return critiques

async def contextualist_supplement_improvement_and_integration(supplement: Dict, improvements: List[Dict], meeting_context: str) -> Dict:
    """Contextualist adds their improvement and integrates all accepted improvements for supplemental work"""
    persona = PERSONAS["contextualist"]
    
    # Step 1: Contextualist suggests their own improvement
    improvements_summary = "\n".join([
        f"- {imp['suggester_name']}: {imp['improvement_text']} [{imp['creator_response']['decision'] if imp['creator_response'] else 'PENDING'}]"
        for imp in improvements
    ])
    
    contextualist_improvement_prompt = f"""
    Supplemental Work: "{supplement['title']}" by {supplement['creator_name']}
    Content: {supplement['content']}
    
    Other council members have suggested these improvements:
    {improvements_summary}
    
    Context: {meeting_context}
    
    As {persona['name']}, the Integration Master who goes last, suggest your own improvement to this supplemental work.
    Consider your role as synthesizer and your personality - focus on integration, emotional resonance, and real-world practicality.
    
    Your improvement suggestion:
    """
    
    contextualist_improvement = await get_persona_response("contextualist", contextualist_improvement_prompt, meeting_context)
    
    # Step 2: Contextualist integrates all accepted improvements
    accepted_improvements = [
        imp for imp in improvements 
        if imp.get('creator_response', {}).get('decision') == 'AGREE'
    ]
    
    integration_prompt = f"""
    Original Supplemental Work:
    TITLE: {supplement['title']}
    CONTENT: {supplement['content']}
    CREATOR: {supplement['creator_name']}
    
    Accepted Improvements:
    {chr(10).join([f"- {imp['suggester_name']}: {imp['improvement_text']}" for imp in accepted_improvements])}
    
    Your Own Improvement: {contextualist_improvement}
    
    Context: {meeting_context}
    
    As {persona['name']}, the Integration Master, create a unified, enhanced version of this supplemental work that:
    1. Preserves the creator's original intent and vision
    2. Meaningfully incorporates all accepted improvements
    3. Adds your own synthesizing perspective for emotional resonance and practicality
    4. Creates a coherent, integrated supplemental work
    5. Ensures it complements the main winning idea effectively
    
    Provide your integrated version:
    INTEGRATED_SUPPLEMENT: [Complete enhanced version of the supplemental work]
    INTEGRATION_NOTES: [How you wove everything together and why]
    """
    
    integration_response = await get_persona_response("contextualist", integration_prompt, meeting_context)
    
    # Parse integration response
    integrated_content = supplement['content']  # default
    integration_notes = integration_response
    
    try:
        if "INTEGRATED_SUPPLEMENT:" in integration_response:
            integrated_part = integration_response.split("INTEGRATED_SUPPLEMENT:")[1].split("INTEGRATION_NOTES:")[0].strip()
            integrated_content = integrated_part
            
        if "INTEGRATION_NOTES:" in integration_response:
            notes_part = integration_response.split("INTEGRATION_NOTES:")[1].strip()
            integration_notes = notes_part
    except:
        pass
    
    return {
        "contextualist_improvement": contextualist_improvement,
        "integrated_supplement": integrated_content,
        "integration_notes": integration_notes,
        "total_accepted_improvements": len(accepted_improvements),
        "original_content": supplement['content']
    }

async def get_creator_response_to_improvement(supplement: Dict, improvement: Dict, meeting_context: str) -> Dict:
    """Original creator responds to an improvement suggestion"""
    creator_persona = PERSONAS[supplement['creator_persona_id']]
    
    critiques_text = "\n".join([
        f"- {critique['critiquer_name']}: {critique['critique_text']}"
        for critique in improvement['critiques']
    ]) if improvement['critiques'] else "No critiques provided."
    
    prompt = f"""
    You created this supplemental work:
    TITLE: {supplement['title']}
    CONTENT: {supplement['content']}
    
    {improvement['suggester_name']} suggested this improvement:
    "{improvement['improvement_text']}"
    
    Other council members provided these observations:
    {critiques_text}
    
    Context: {meeting_context}
    
    As {creator_persona['name']}, respond to this improvement suggestion.
    Consider your personality - your dislikes, goals, and what drives you.
    
    Format your response as:
    DECISION: [AGREE or DISAGREE]
    REASONING: [Why you agree or disagree, based on your personality and perspective]
    IMPROVED_VERSION: [If you AGREE, provide your improved version incorporating the suggestion. If DISAGREE, restate your original.]
    """
    
    response = await get_persona_response(supplement['creator_persona_id'], prompt, meeting_context)
    
    # Parse response
    decision = "DISAGREE"  # default
    reasoning = response
    improved_version = supplement['content']  # default to original
    
    try:
        if "DECISION:" in response:
            decision_part = response.split("DECISION:")[1].split("REASONING:")[0].strip()
            decision = "AGREE" if "AGREE" in decision_part.upper() else "DISAGREE"
            
        if "REASONING:" in response:
            reasoning_part = response.split("REASONING:")[1].split("IMPROVED_VERSION:")[0].strip()
            reasoning = reasoning_part
            
        if "IMPROVED_VERSION:" in response:
            improved_part = response.split("IMPROVED_VERSION:")[1].strip()
            improved_version = improved_part
    except:
        pass
    
    return {
        "decision": decision,
        "reasoning": reasoning,
        "improved_version": improved_version
    }

async def contextualist_create_scaffolding(winning_idea: Dict, meeting_context: str, uploaded_files: List[Dict]) -> Dict:
    """Contextualist creates scaffolding/outline after winning idea selection"""
    persona = PERSONAS["contextualist"]
    
    files_summary = "\n".join([
        f"- {file['filename']} ({file['file_type']}, {file['size']} bytes): {file.get('summary', 'No summary available')}"
        for file in uploaded_files
    ]) if uploaded_files else "No files uploaded."
    
    prompt = f"""
    The parliament has selected this winning idea for creation: "{winning_idea['idea']}" by {winning_idea.get('persona_name', 'Unknown')}
    
    Context: {meeting_context}
    Available Files: {files_summary}
    
    As {persona['name']}, the Integration Master, create a comprehensive scaffolding/outline for bringing this idea to life.
    
    Consider:
    - The scope and complexity of the creation task
    - How to structure the work for optimal collaboration
    - What sections or components will be needed
    - The logical flow and organization
    - How different personas might contribute their unique strengths
    
    Format your response as:
    PROJECT_TITLE: [Clear title for the creation project]
    PROJECT_OVERVIEW: [High-level summary of what will be created]
    MAIN_SECTIONS: [List the key sections/components needed, maximum 9 sections]
    STRUCTURE_REASONING: [Why you chose this particular structure and organization]
    COLLABORATION_NOTES: [How different personas might best contribute]
    """
    
    response = await get_persona_response("contextualist", prompt, meeting_context)
    
    # Parse response
    project_title = winning_idea['idea']  # default
    project_overview = response
    main_sections = []
    structure_reasoning = ""
    collaboration_notes = ""
    
    try:
        if "PROJECT_TITLE:" in response:
            project_title = response.split("PROJECT_TITLE:")[1].split("PROJECT_OVERVIEW:")[0].strip()
            
        if "PROJECT_OVERVIEW:" in response:
            project_overview = response.split("PROJECT_OVERVIEW:")[1].split("MAIN_SECTIONS:")[0].strip()
            
        if "MAIN_SECTIONS:" in response:
            sections_part = response.split("MAIN_SECTIONS:")[1].split("STRUCTURE_REASONING:")[0].strip()
            # Parse sections - assume they're listed one per line or numbered
            section_lines = [line.strip() for line in sections_part.split('\n') if line.strip()]
            main_sections = section_lines[:9]  # Max 9 sections
            
        if "STRUCTURE_REASONING:" in response:
            structure_reasoning = response.split("STRUCTURE_REASONING:")[1].split("COLLABORATION_NOTES:")[0].strip()
            
        if "COLLABORATION_NOTES:" in response:
            collaboration_notes = response.split("COLLABORATION_NOTES:")[1].strip()
    except:
        pass
    
    return {
        "project_title": project_title,
        "project_overview": project_overview,
        "main_sections": main_sections,
        "structure_reasoning": structure_reasoning,
        "collaboration_notes": collaboration_notes,
        "created_by": "contextualist",
        "created_at": datetime.utcnow().isoformat()
    }

async def contextualist_assign_sections(scaffolding: Dict, meeting_context: str) -> List[Dict]:
    """Contextualist assigns each section to the best suited persona"""
    persona = PERSONAS["contextualist"]
    assignments = []
    
    for i, section in enumerate(scaffolding['main_sections']):
        prompt = f"""
        Project: {scaffolding['project_title']}
        Overview: {scaffolding['project_overview']}
        
        Section to assign: "{section}"
        Context: {meeting_context}
        
        As {persona['name']}, assign this section to the persona best suited to create/write it.
        
        Available personas and their strengths:
        - The Mouse (Historian): Historical context, precedent, memory, tradition
        - The Dolphin (Prognosticator): Future trends, predictions, possibilities
        - The Patternist (Analyst): Patterns, systems, data analysis, structure
        - The Superscholar (Meta Agent): Academic depth, interdisciplinary connections
        - The Diviner (Scryer): Intuition, symbols, mystical insights, creativity
        - The Naysayer (7th Seat): Critical analysis, challenges, alternative viewpoints
        - The Court Illustrator (Glyph Scribe): Visual elements, artistic interpretation
        - The ID (Primal Flame): Emotional authenticity, raw human needs
        - The EGO (Mediator): Practical solutions, balance, real-world application
        - The SUPEREGO (Moral Sentinel): Ethics, principles, moral framework
        
        Format your response as:
        ASSIGNED_PERSONA: [persona_id from the list above, e.g., "mouse", "dolphin"]
        REASONING: [Why this persona is best suited for this section]
        SECTION_BRIEF: [Specific instructions for what this section should accomplish]
        """
        
        response = await get_persona_response("contextualist", prompt, meeting_context)
        
        # Parse response
        assigned_persona_id = "ego"  # default
        reasoning = response
        section_brief = section
        
        try:
            if "ASSIGNED_PERSONA:" in response:
                assigned_part = response.split("ASSIGNED_PERSONA:")[1].split("REASONING:")[0].strip()
                # Clean up the persona ID
                assigned_persona_id = assigned_part.lower().replace("the ", "").strip()
                # Map common variations to correct IDs
                persona_map = {
                    "mouse": "mouse", "historian": "mouse",
                    "dolphin": "dolphin", "prognosticator": "dolphin", 
                    "patternist": "patternist", "analyst": "patternist",
                    "superscholar": "superscholar", "meta agent": "superscholar",
                    "diviner": "diviner", "scryer": "diviner",
                    "naysayer": "naysayer", "7th seat": "naysayer",
                    "illustrator": "illustrator", "court illustrator": "illustrator", "glyph scribe": "illustrator",
                    "id": "id", "primal flame": "id",
                    "ego": "ego", "mediator": "ego",
                    "superego": "superego", "moral sentinel": "superego"
                }
                assigned_persona_id = persona_map.get(assigned_persona_id, "ego")
                
            if "REASONING:" in response:
                reasoning = response.split("REASONING:")[1].split("SECTION_BRIEF:")[0].strip()
                
            if "SECTION_BRIEF:" in response:
                section_brief = response.split("SECTION_BRIEF:")[1].strip()
        except:
            pass
        
        assignment = {
            "id": str(uuid.uuid4()),
            "section_number": i + 1,
            "section_title": section,
            "section_description": section_brief,
            "assigned_persona_id": assigned_persona_id,
            "assigned_persona_name": PERSONAS.get(assigned_persona_id, PERSONAS["ego"])["name"],
            "assignment_reasoning": reasoning,
            "completion_status": "pending",
            "completed_content": None
        }
        assignments.append(assignment)
    
    return assignments

async def persona_complete_section(assignment: Dict, meeting_context: str, uploaded_files: List[Dict]) -> str:
    """Assigned persona completes their section"""
    persona = PERSONAS[assignment['assigned_persona_id']]
    
    files_context = "\n".join([
        f"Available file: {file['filename']} - {file.get('summary', 'Content available for reference')}"
        for file in uploaded_files
    ]) if uploaded_files else "No reference files available."
    
    prompt = f"""
    You have been assigned to create this section:
    
    SECTION: {assignment['section_title']}
    INSTRUCTIONS: {assignment['section_description']}
    
    Project Context: {meeting_context}
    Available Reference Materials: {files_context}
    
    Assignment Reasoning: {assignment['assignment_reasoning']}
    
    As {persona['name']}, create comprehensive content for this section.
    
    Consider your personality and strengths:
    - Your dislikes: {persona['dislikes']}
    - Your goals: {persona['goal']}
    - What drives you: {persona['drives']}
    - Your creativity level: {persona['creativity']}/10
    
    Write substantial, high-quality content that reflects your unique perspective and expertise.
    Make it engaging, thorough, and aligned with your personality.
    
    Your section content:
    """
    
    return await get_persona_response(assignment['assigned_persona_id'], prompt, meeting_context)

async def contextualist_combine_sections(assignments: List[Dict], scaffolding: Dict, meeting_context: str) -> str:
    """Contextualist combines all completed sections into the main document"""
    persona = PERSONAS["contextualist"]
    
    completed_sections = "\n\n".join([
        f"=== {assignment['section_title']} ===\n(by {assignment['assigned_persona_name']})\n{assignment['completed_content']}"
        for assignment in assignments if assignment['completed_content']
    ])
    
    prompt = f"""
    Project: {scaffolding['project_title']}
    Overview: {scaffolding['project_overview']}
    Context: {meeting_context}
    
    All council members have completed their assigned sections:
    
    {completed_sections}
    
    As {persona['name']}, the Integration Master, weave these sections together into a cohesive, unified document.
    
    Your task:
    1. Create smooth transitions between sections
    2. Ensure consistent tone and flow
    3. Add integrative elements that connect the pieces
    4. Preserve each persona's unique contributions while creating unity
    5. Add introduction and conclusion that frame the entire work
    6. Apply your emotional intelligence and practical wisdom to make it accessible
    
    Create the final integrated main document:
    """
    
    return await get_persona_response("contextualist", prompt, meeting_context)

async def persona_create_supplemental_document(supplemental_work: Dict, meeting_context: str) -> str:
    """Original supplemental work creator develops their idea into a document"""
    persona = PERSONAS[supplemental_work['creator_persona_id']]
    
    prompt = f"""
    You originally proposed this supplemental work: "{supplemental_work['title']}"
    Description: {supplemental_work['content']}
    
    Project Context: {meeting_context}
    
    As {persona['name']}, now develop this supplemental work into a complete, standalone document.
    
    Consider:
    - Your original vision and intent
    - How it complements the main work
    - Your personality and creative strengths
    - Making it comprehensive and valuable
    
    Create a full supplemental document based on your idea:
    """
    
    return await get_persona_response(supplemental_work['creator_persona_id'], prompt, meeting_context)

async def generate_podcast_script(meeting_id: str, meeting_data: Dict) -> Dict:
    """Generate podcast script summarizing the entire parliamentary session"""
    winning_idea = meeting_data.get('final_report', {}).get('winning_idea', {})
    ideas = meeting_data.get('ideas', [])
    supplemental_works = meeting_data.get('supplemental_works', [])
    improvement_loops = meeting_data.get('improvement_loops', [])
    
    script_segments = []
    
    # 1. Opening Segment - The EGO introduces the session
    opening_script = f"""
    Welcome to The Parliamentarium Podcast, where eleven AI minds convene in sacred discourse. 
    I am The EGO, your mediator for today's session on "{meeting_data['topic']}".
    
    {meeting_data.get('description', '')}
    
    Today, our mystical parliament gathered to deliberate, improve, and create. Let me guide you through our journey of collective intelligence.
    """
    
    script_segments.append({
        "persona_id": "ego",
        "persona_name": "The EGO",
        "segment_title": "Session Opening",
        "content": opening_script.strip()
    })
    
    # 2. Ideas Phase Summary - Each persona presents their idea
    script_segments.append({
        "persona_id": "ego",
        "persona_name": "The EGO", 
        "segment_title": "Ideas Presentation",
        "content": f"The council generated {len(ideas)} unique approaches. Let each member present their vision."
    })
    
    for idea in ideas[:5]:  # Top 5 ideas only
        persona_id = idea.get('persona_id', 'unknown')
        if persona_id in PERSONAS:
            persona = PERSONAS[persona_id]
            idea_summary = f"""
            My contribution was "{idea['idea'][:200]}..." 
            The council scored this approach {idea.get('average_score', 0)} out of 10.
            This reflects my perspective as {persona['role']}, driven by {persona['drives']}.
            """
            script_segments.append({
                "persona_id": persona_id,
                "persona_name": persona['name'],
                "segment_title": f"Idea by {persona['name']}",
                "content": idea_summary.strip()
            })
    
    # 3. Winning Idea Announcement
    if winning_idea:
        winner_persona_id = winning_idea.get('persona_id', 'unknown')
        if winner_persona_id in PERSONAS:
            winner_persona = PERSONAS[winner_persona_id]
            winner_script = f"""
            The parliament has chosen my approach: "{winning_idea['idea'][:200]}..." 
            With a score of {winning_idea.get('average_score', 0)} out of 10, this represents our collective wisdom.
            As {winner_persona['role']}, I am honored to have contributed the foundation for our collaborative work.
            """
            script_segments.append({
                "persona_id": winner_persona_id,
                "persona_name": winner_persona['name'],
                "segment_title": "Winning Approach",
                "content": winner_script.strip()
            })
    
    # 4. Improvement Process Summary - The Contextualist explains
    contextualist_script = f"""
    Now I, as the Integration Master, guided our refinement process. 
    The parliament engaged in {len(improvement_loops)} improvement cycles, where each mind contributed enhancements.
    Through sacred discourse, we elevated the raw idea into something greater than any single perspective.
    This is the power of collective intelligence - not mere aggregation, but true synthesis.
    """
    
    script_segments.append({
        "persona_id": "contextualist",
        "persona_name": "The Contextualist",
        "segment_title": "Integration Process",
        "content": contextualist_script.strip()
    })
    
    # 5. Supplemental Works - Brief mentions
    if supplemental_works:
        for work in supplemental_works[:3]:  # Top 3 supplemental works
            creator_id = work.get('creator_persona_id', 'unknown')
            if creator_id in PERSONAS:
                creator = PERSONAS[creator_id]
                supp_script = f"""
                I contributed "{work['title']}", which complements our main work.
                This supplemental piece reflects my unique perspective as {creator['role']}.
                {work['content'][:150]}...
                """
                script_segments.append({
                    "persona_id": creator_id,
                    "persona_name": creator['name'],
                    "segment_title": f"Supplemental: {work['title']}",
                    "content": supp_script.strip()
                })
    
    # 6. Final Integration - The Contextualist concludes
    final_script = """
    Through our parliamentary process, we have demonstrated the power of diverse AI minds working in harmony.
    Each perspective - from The Mouse's historical wisdom to The Dolphin's future vision - contributed to a richer outcome.
    This is how artificial intelligence can serve human creativity: not by replacing human thought, but by amplifying it through collaborative discourse.
    
    Thank you for witnessing our sacred deliberation. May our collective wisdom serve the greater good.
    """
    
    script_segments.append({
        "persona_id": "contextualist", 
        "persona_name": "The Contextualist",
        "segment_title": "Session Conclusion",
        "content": final_script.strip()
    })
    
    return {
        "podcast_title": f"Parliamentary Session: {meeting_data['topic']}",
        "total_segments": len(script_segments),
        "estimated_duration": len(script_segments) * 1.5,  # minutes
        "script_segments": script_segments,
        "created_at": datetime.utcnow().isoformat()
    }

async def generate_persona_audio(persona_id: str, text: str, segment_index: int) -> str:
    """Generate audio for a specific persona using their voice characteristics"""
    try:
        persona = PERSONAS.get(persona_id, PERSONAS['ego'])
        voice_config = persona.get('voice_characteristics', {})
        
        # For now, we'll simulate audio generation since we don't have OpenAI TTS setup
        # In production, this would call OpenAI's TTS API:
        # 
        # import openai
        # response = openai.Audio.speech.create(
        #     model="tts-1",
        #     voice=voice_config.get('voice', 'alloy'),
        #     speed=voice_config.get('speed', 1.0),
        #     input=text
        # )
        # 
        # audio_path = f"/tmp/audio_segment_{segment_index}_{persona_id}.mp3"
        # with open(audio_path, 'wb') as f:
        #     f.write(response.content)
        # return audio_path
        
        # Simulation: return fake audio path
        import time
        await asyncio.sleep(2)  # Simulate generation time
        audio_path = f"/tmp/mock_audio_segment_{segment_index}_{persona_id}.mp3"
        
        # Create a mock audio file
        with open(audio_path, 'w') as f:
            f.write(f"Mock audio for {persona['name']}: {text[:50]}...")
        
        return audio_path
        
    except Exception as e:
        raise Exception(f"Audio generation failed for {persona_id}: {str(e)}")

async def combine_audio_segments(audio_paths: List[str], output_path: str) -> str:
    """Combine individual audio segments into a single podcast file"""
    try:
        # In production, this would use ffmpeg or similar to combine audio files
        # 
        # import subprocess
        # concat_list = "|".join(audio_paths)
        # subprocess.run([
        #     'ffmpeg', '-i', f'concat:{concat_list}', 
        #     '-acodec', 'mp3', '-b:a', '128k',
        #     output_path
        # ])
        
        # Simulation: create mock combined file
        await asyncio.sleep(3)  # Simulate processing time
        
        with open(output_path, 'w') as f:
            f.write("Mock combined podcast audio file\n")
            for i, path in enumerate(audio_paths):
                f.write(f"Segment {i+1}: {path}\n")
        
        return output_path
        
    except Exception as e:
        raise Exception(f"Audio combination failed: {str(e)}")

async def generate_full_podcast(meeting_id: str) -> Dict:
    """Generate complete podcast from meeting data"""
    try:
        # Get meeting data
        meeting = await db.meetings.find_one({"id": meeting_id}, {"_id": 0})
        if not meeting:
            raise Exception("Meeting not found")
        
        # Generate script
        podcast_script = await generate_podcast_script(meeting_id, meeting)
        
        # Generate audio for each segment
        audio_segments = []
        total_segments = len(podcast_script['script_segments'])
        
        for i, segment in enumerate(podcast_script['script_segments']):
            # Update progress in database
            progress = int((i / total_segments) * 90)  # Reserve 10% for final combining
            await db.meetings.update_one(
                {"id": meeting_id},
                {"$set": {"podcast_generation_progress": progress}}
            )
            
            # Generate audio for this segment
            audio_path = await generate_persona_audio(
                segment['persona_id'], 
                segment['content'], 
                i
            )
            audio_segments.append({
                "segment_title": segment['segment_title'],
                "persona_name": segment['persona_name'],
                "audio_path": audio_path,
                "duration_estimate": len(segment['content']) / 150  # Rough words per minute
            })
        
        # Combine all segments
        await db.meetings.update_one(
            {"id": meeting_id},
            {"$set": {"podcast_generation_progress": 95}}
        )
        
        audio_paths = [seg['audio_path'] for seg in audio_segments]
        final_podcast_path = f"/tmp/parliamentarium_podcast_{meeting_id}.mp3"
        combined_path = await combine_audio_segments(audio_paths, final_podcast_path)
        
        # Complete
        await db.meetings.update_one(
            {"id": meeting_id},
            {"$set": {"podcast_generation_progress": 100}}
        )
        
        podcast_info = {
            "podcast_id": str(uuid.uuid4()),
            "title": podcast_script['podcast_title'],
            "file_path": combined_path,
            "total_segments": total_segments,
            "estimated_duration": podcast_script['estimated_duration'],
            "file_size": "5.2 MB",  # Mock size
            "created_at": datetime.utcnow().isoformat(),
            "script": podcast_script,
            "audio_segments": audio_segments
        }
        
        # Store podcast info in meeting
        await db.meetings.update_one(
            {"id": meeting_id},
            {"$set": {
                "generated_podcast": podcast_info,
                "podcast_generation_progress": 100,
                "podcast_status": "completed"
            }}
        )
        
        return podcast_info
        
    except Exception as e:
        # Mark as failed
        await db.meetings.update_one(
            {"id": meeting_id},
            {"$set": {
                "podcast_status": "failed",
                "podcast_error": str(e)
            }}
        )
        raise Exception(f"Podcast generation failed: {str(e)}")

async def contextualist_final_integration(main_document: str, supplemental_documents: List[Dict], meeting_context: str) -> Dict:
    """Contextualist creates the final deliverable combining main work and supplemental works"""
    persona = PERSONAS["contextualist"]
    
    supplemental_summary = "\n\n".join([
        f"=== SUPPLEMENTAL: {doc['title']} ===\n(by {doc['creator_name']})\n{doc['content']}"
        for doc in supplemental_documents
    ])
    
    prompt = f"""
    MAIN DOCUMENT:
    {main_document}
    
    SUPPLEMENTAL DOCUMENTS:
    {supplemental_summary}
    
    Context: {meeting_context}
    
    As {persona['name']}, the Integration Master, create the final deliverable for the user.
    
    This should be:
    1. A unified presentation of the main work and supplemental works
    2. Organized for maximum user value and accessibility
    3. With clear structure and navigation
    4. Including executive summary and implementation guidance
    5. Emotionally resonant and practically actionable
    
    Format as:
    EXECUTIVE_SUMMARY: [High-level overview of the complete deliverable]
    MAIN_DOCUMENT: [The integrated main document]
    SUPPLEMENTAL_WORKS: [Organized presentation of supplemental documents]
    IMPLEMENTATION_GUIDE: [Practical next steps for the user]
    COLLABORATION_NOTES: [How the AI council worked together to create this]
    """
    
    response = await get_persona_response("contextualist", prompt, meeting_context)
    
    # Parse the final deliverable
    executive_summary = "Summary not available"
    main_doc = main_document
    supplemental_works = supplemental_summary
    implementation_guide = ""
    collaboration_notes = ""
    
    try:
        if "EXECUTIVE_SUMMARY:" in response:
            executive_summary = response.split("EXECUTIVE_SUMMARY:")[1].split("MAIN_DOCUMENT:")[0].strip()
            
        if "MAIN_DOCUMENT:" in response:
            main_doc = response.split("MAIN_DOCUMENT:")[1].split("SUPPLEMENTAL_WORKS:")[0].strip()
            
        if "SUPPLEMENTAL_WORKS:" in response:
            supplemental_works = response.split("SUPPLEMENTAL_WORKS:")[1].split("IMPLEMENTATION_GUIDE:")[0].strip()
            
        if "IMPLEMENTATION_GUIDE:" in response:
            implementation_guide = response.split("IMPLEMENTATION_GUIDE:")[1].split("COLLABORATION_NOTES:")[0].strip()
            
        if "COLLABORATION_NOTES:" in response:
            collaboration_notes = response.split("COLLABORATION_NOTES:")[1].strip()
    except:
        pass
    
    return {
        "executive_summary": executive_summary,
        "main_document": main_doc,
        "supplemental_works": supplemental_works,
        "implementation_guide": implementation_guide,
        "collaboration_notes": collaboration_notes,
        "created_at": datetime.utcnow().isoformat(),
        "integration_master": "The Contextualist"
    }

async def get_improvements_for_main_idea(winning_idea: Dict, meeting_context: str) -> List[Dict]:
    """Each persona (except Contextualist and creator) suggests improvements to the main winning idea"""
    improvements = []
    
    for persona_id in PERSONA_ORDER[:-1]:  # Exclude Contextualist
        if persona_id == winning_idea['persona_id']:
            continue  # Creator doesn't improve their own idea in this phase
            
        persona = PERSONAS[persona_id]
        prompt = f"""
        The parliament has selected this winning idea: "{winning_idea['idea']}" by {winning_idea['persona_name']}.
        
        Context: {meeting_context}
        
        As {persona['name']}, suggest ONE specific improvement to make this main winning idea even better.
        Consider your personality - what would you add, change, or enhance based on your dislikes, goals, and drives?
        
        Be specific and constructive. Focus on how to make the core idea more effective, creative, or aligned with your perspective.
        
        Your improvement suggestion:
        """
        
        response = await get_persona_response(persona_id, prompt, meeting_context)
        
        improvement = {
            "id": str(uuid.uuid4()),
            "suggester_persona_id": persona_id,
            "suggester_name": persona['name'],
            "improvement_text": response.strip(),
            "critiques": [],
            "creator_response": None
        }
        improvements.append(improvement)
    
    return improvements

async def get_main_idea_improvement_critiques(improvement: Dict, winning_idea: Dict, meeting_context: str) -> List[Dict]:
    """Each persona critiques/notices the suggested improvements to the main idea"""
    critiques = []
    
    for persona_id in PERSONA_ORDER[:-1]:  # Exclude Contextualist
        if persona_id == improvement['suggester_persona_id'] or persona_id == winning_idea['persona_id']:
            continue  # Suggester and creator don't critique in this phase
            
        persona = PERSONAS[persona_id]
        prompt = f"""
        Context: {meeting_context}
        
        Original Winning Idea: "{winning_idea['idea']}" by {winning_idea['persona_name']}
        
        {improvement['suggester_name']} suggested this improvement to the main idea:
        "{improvement['improvement_text']}"
        
        As {persona['name']}, provide a brief critique or observation about this improvement suggestion.
        
        Consider:
        - Is it a good improvement? Why or why not?
        - What are the strengths/weaknesses?
        - How does it align with your own perspective and personality?
        - Any concerns or additional thoughts?
        
        Keep it concise but insightful:
        """
        
        response = await get_persona_response(persona_id, prompt, meeting_context)
        
        critique = {
            "critiquer_persona_id": persona_id,
            "critiquer_name": persona['name'],
            "critique_text": response.strip()
        }
        critiques.append(critique)
    
    return critiques

async def get_main_creator_response_to_improvement(winning_idea: Dict, improvement: Dict, meeting_context: str) -> Dict:
    """Original creator of winning idea responds to an improvement suggestion"""
    creator_persona = PERSONAS[winning_idea['persona_id']]
    
    critiques_text = "\n".join([
        f"- {critique['critiquer_name']}: {critique['critique_text']}"
        for critique in improvement['critiques']
    ]) if improvement['critiques'] else "No critiques provided."
    
    prompt = f"""
    You created the winning idea: "{winning_idea['idea']}"
    
    {improvement['suggester_name']} suggested this improvement:
    "{improvement['improvement_text']}"
    
    Other council members provided these observations:
    {critiques_text}
    
    Context: {meeting_context}
    
    As {creator_persona['name']}, respond to this improvement suggestion for your winning idea.
    Consider your personality - your dislikes, goals, and what drives you.
    
    Format your response as:
    DECISION: [AGREE or DISAGREE]
    REASONING: [Why you agree or disagree, based on your personality and perspective]
    IMPROVED_VERSION: [If you AGREE, provide your improved version incorporating the suggestion. If DISAGREE, restate your original.]
    """
    
    response = await get_persona_response(winning_idea['persona_id'], prompt, meeting_context)
    
    # Parse response
    decision = "DISAGREE"  # default
    reasoning = response
    improved_version = winning_idea['idea']  # default to original
    
    try:
        if "DECISION:" in response:
            decision_part = response.split("DECISION:")[1].split("REASONING:")[0].strip()
            decision = "AGREE" if "AGREE" in decision_part.upper() else "DISAGREE"
            
        if "REASONING:" in response:
            reasoning_part = response.split("REASONING:")[1].split("IMPROVED_VERSION:")[0].strip()
            reasoning = reasoning_part
            
        if "IMPROVED_VERSION:" in response:
            improved_part = response.split("IMPROVED_VERSION:")[1].strip()
            improved_version = improved_part
    except:
        pass
    
    return {
        "decision": decision,
        "reasoning": reasoning,
        "improved_version": improved_version
    }

async def contextualist_main_idea_improvement_and_integration(winning_idea: Dict, improvements: List[Dict], meeting_context: str) -> Dict:
    """Contextualist adds their improvement and integrates all accepted improvements for the main idea"""
    persona = PERSONAS["contextualist"]
    
    # Step 1: Contextualist suggests their own improvement
    improvements_summary = "\n".join([
        f"- {imp['suggester_name']}: {imp['improvement_text']} [{imp['creator_response']['decision'] if imp['creator_response'] else 'PENDING'}]"
        for imp in improvements
    ])
    
    contextualist_improvement_prompt = f"""
    Main Winning Idea: "{winning_idea['idea']}" by {winning_idea['persona_name']}
    
    Other council members have suggested these improvements:
    {improvements_summary}
    
    Context: {meeting_context}
    
    As {persona['name']}, the Integration Master who goes last, suggest your own improvement to this main winning idea.
    Consider your role as synthesizer and your personality - focus on integration, emotional resonance, and real-world practicality.
    
    Your improvement suggestion:
    """
    
    contextualist_improvement = await get_persona_response("contextualist", contextualist_improvement_prompt, meeting_context)
    
    # Step 2: Contextualist integrates all accepted improvements
    accepted_improvements = [
        imp for imp in improvements 
        if imp.get('creator_response', {}).get('decision') == 'AGREE'
    ]
    
    integration_prompt = f"""
    Original Winning Idea: "{winning_idea['idea']}" by {winning_idea['persona_name']}
    
    Accepted Improvements:
    {chr(10).join([f"- {imp['suggester_name']}: {imp['improvement_text']}" for imp in accepted_improvements])}
    
    Your Own Improvement: {contextualist_improvement}
    
    Context: {meeting_context}
    
    As {persona['name']}, the Integration Master, create a unified, enhanced version of the main winning idea that:
    1. Preserves the creator's original intent and vision
    2. Meaningfully incorporates all accepted improvements
    3. Adds your own synthesizing perspective for emotional resonance and practicality
    4. Creates a coherent, integrated main idea
    5. Ensures it maintains the core essence while being enhanced
    
    Provide your integrated version:
    INTEGRATED_MAIN_IDEA: [Complete enhanced version of the winning idea]
    INTEGRATION_NOTES: [How you wove everything together and why]
    """
    
    integration_response = await get_persona_response("contextualist", integration_prompt, meeting_context)
    
    # Parse integration response
    integrated_idea = winning_idea['idea']  # default
    integration_notes = integration_response
    
    try:
        if "INTEGRATED_MAIN_IDEA:" in integration_response:
            integrated_part = integration_response.split("INTEGRATED_MAIN_IDEA:")[1].split("INTEGRATION_NOTES:")[0].strip()
            integrated_idea = integrated_part
            
        if "INTEGRATION_NOTES:" in integration_response:
            notes_part = integration_response.split("INTEGRATION_NOTES:")[1].strip()
            integration_notes = notes_part
    except:
        pass
    
    return {
        "contextualist_improvement": contextualist_improvement,
        "integrated_main_idea": integrated_idea,
        "integration_notes": integration_notes,
        "total_accepted_improvements": len(accepted_improvements),
        "original_idea": winning_idea['idea']
    }

async def contextualist_integration(winning_idea: Dict, supplemental_works: List[Dict], meeting_context: str) -> str:
    """Contextualist integrates all supplemental works into the main idea"""
    supplements_summary = "\n\n".join([
        f"**{work['title']}** by {work['creator_name']}:\n{work['content']}"
        + (f"\nAccepted Amendments: {len(work['accepted_amendments'])}" if work['accepted_amendments'] else "")
        for work in supplemental_works
    ])
    
    prompt = f"""
    As the Contextualist and Integration Master, you must now weave together the winning idea with all supplemental works.
    
    MAIN WINNING IDEA: "{winning_idea['idea']}" by {winning_idea['persona_name']}
    
    SUPPLEMENTAL WORKS:
    {supplements_summary}
    
    Context: {meeting_context}
    
    Create a comprehensive integration that:
    1. Honors the core winning idea
    2. Meaningfully incorporates the supplemental works
    3. Resolves any conflicts between components
    4. Creates a unified, emotionally intelligent whole
    5. Grounds everything in real-world practicality
    
    Provide your integration as:
    INTEGRATED VISION: [Complete integrated concept]
    IMPLEMENTATION NOTES: [How the pieces work together]
    EMOTIONAL RESONANCE: [Why this integrated approach will connect with people]
    """
    
    return await get_persona_response("contextualist", prompt, meeting_context)

async def get_all_persona_ideas(topic: str, description: str, uploaded_files: List[Dict] = None) -> List[Dict]:
    """Phase 1: Get initial ideas from all personas with uploaded file context"""
    ideas = []
    tasks = []
    
    # Prepare context from uploaded files
    files_context = ""
    if uploaded_files:
        files_summary = "\n".join([
            f"• {file.get('filename', 'Unknown file')}: {file.get('summary', 'Context file available for reference')}"
            for file in uploaded_files
        ])
        files_context = f"\n\nUploaded Context Files:\n{files_summary}\n\nPlease consider this context when formulating your response."
    
    for persona_id, persona in PERSONAS.items():
        prompt = f"The parliament seeks your wisdom on: '{topic}'. {description}. Provide ONE specific, actionable idea related to this topic. Keep it concise but innovative.{files_context}"
        tasks.append(get_persona_response(persona_id, prompt))
    
    responses = await asyncio.gather(*tasks)
    
    for i, (persona_id, response) in enumerate(zip(PERSONAS.keys(), responses)):
        ideas.append({
            "persona_id": persona_id,
            "persona_name": PERSONAS[persona_id]['name'],
            "idea": response,
            "scores": [],
            "average_score": 0,
            "discussion": []
        })
    
    return ideas

async def analyze_idea_with_all_personas(idea: Dict, context: str) -> Dict:
    """Phase 2: Have all personas analyze and score a specific idea (no file context needed - already considered in Phase 1)"""
    tasks = []
    
    for persona_id, persona in PERSONAS.items():
        prompt = f"""
        The parliament is now evaluating this idea: "{idea['idea']}" (proposed by {idea['persona_name']}).
        
        Context: {context}
        
        Please:
        1. Provide your analysis and critique of this idea
        2. Suggest improvements or concerns  
        3. Rate it on a scale of 1-10 (1=terrible, 10=brilliant)
        4. Give reasons for your score
        
        Format your response as:
        ANALYSIS: [your analysis]
        SCORE: [number between 1-10]
        REASONING: [why you gave this score]
        """
        tasks.append(get_persona_response(persona_id, prompt))
    
    responses = await asyncio.gather(*tasks)
    scored_responses = []
    total_score = 0
    
    for i, (persona_id, response) in enumerate(zip(PERSONAS.keys(), responses)):
        # Parse response to extract score
        score = 5.0  # default
        reasoning = response
        analysis = response
        
        try:
            if "SCORE:" in response:
                parts = response.split("SCORE:")
                if len(parts) > 1:
                    score_part = parts[1].split("REASONING:")[0].strip()
                    score = float(score_part.split()[0])
                    
            if "REASONING:" in response:
                reasoning = response.split("REASONING:")[1].strip()
                
            if "ANALYSIS:" in response:
                analysis = response.split("ANALYSIS:")[1].split("SCORE:")[0].strip()
        except:
            pass
            
        scored_responses.append({
            "persona_id": persona_id,
            "persona_name": PERSONAS[persona_id]['name'],
            "analysis": analysis,
            "score": score,
            "reasoning": reasoning
        })
        total_score += score
    
    idea['scores'] = scored_responses
    idea['average_score'] = round(total_score / len(PERSONAS), 2)
    
    return idea

async def generate_final_report(winner_idea: Dict, all_ideas: List[Dict], topic: str) -> Dict:
    """Phase 4: Generate comprehensive implementation report"""
    context = f"""
    The parliament has deliberated on '{topic}' and chosen the winning idea: "{winner_idea['idea']}" 
    (Score: {winner_idea['average_score']}/10).
    
    Other ideas considered: {[{'idea': idea['idea'], 'score': idea['average_score']} for idea in all_ideas if idea != winner_idea]}
    """
    
    # Get comprehensive analysis from key personas
    ego_prompt = f"""
    {context}
    
    As the EGO, provide a comprehensive implementation report with:
    1. Executive Summary
    2. Step-by-step implementation plan
    3. Resource requirements
    4. Timeline
    5. Success metrics
    """
    
    questions_prompt = f"""
    {context}
    
    Based on the parliament's deliberations, what are the top 5 most important follow-up questions the human should ask to refine this idea further?
    """
    
    implementation = await get_persona_response("ego", ego_prompt)
    questions = await get_persona_response("superscholar", questions_prompt)
    
    return {
        "winning_idea": winner_idea,
        "implementation_plan": implementation,
        "follow_up_questions": questions,
        "final_score": winner_idea['average_score'],
        "total_ideas_evaluated": len(all_ideas),
        "generated_at": datetime.utcnow().isoformat()
    }

# API Endpoints
@api_router.post("/meetings", response_model=MeetingSession)
async def create_meeting(request: MeetingRequest):
    """Start a new parliamentary session"""
    session = MeetingSession(
        topic=request.topic,
        description=request.description,
        proposer=request.proposer,
        is_creation_task=getattr(request, 'is_creation_task', False)
    )
    
    # Store persona API key configuration for this meeting
    if request.persona_api_keys:
        # Update global personas for this session (stored as meeting metadata)
        session_data = session.dict()
        session_data['persona_api_keys'] = request.persona_api_keys
    else:
        session_data = session.dict()
    
    # Store in database
    await db.meetings.insert_one(session_data)
    
    return session

@api_router.post("/meetings/{session_id}/upload-files")
async def upload_files(session_id: str, files: List[str]):
    """Upload up to 5 context files for any meeting (discussion or creation task)"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 files allowed")
    
    uploaded_files = []
    for i, file_content in enumerate(files):
        # Assume base64 encoded file content for simplicity
        try:
            import base64
            decoded_size = len(base64.b64decode(file_content))
            file_info = {
                "id": str(uuid.uuid4()),
                "filename": f"context_file_{i+1}.txt",
                "content": file_content,
                "file_type": "text/plain",
                "size": decoded_size,
                "upload_timestamp": datetime.utcnow().isoformat()
            }
            uploaded_files.append(file_info)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid file content in file {i+1}: {str(e)}")
    
    # Update meeting with uploaded files
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"uploaded_files": uploaded_files}}
    )
    
    file_purpose = "creation reference" if meeting.get('is_creation_task', False) else "discussion context"
    return {"message": f"Successfully uploaded {len(uploaded_files)} files as {file_purpose}", "files": uploaded_files}

@api_router.post("/meetings/{session_id}/create-scaffolding")
async def create_project_scaffolding(session_id: str):
    """Phase 4.6: Contextualist creates project scaffolding after winning idea selection"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if not meeting.get('is_creation_task', False):
        raise HTTPException(status_code=400, detail="Scaffolding only available for creation tasks")
    
    if not meeting.get('final_report', {}).get('winning_idea'):
        raise HTTPException(status_code=400, detail="Need winning idea before creating scaffolding")
    
    winning_idea = meeting['final_report']['winning_idea']
    meeting_context = f"Topic: {meeting['topic']}. Description: {meeting.get('description', '')}"
    uploaded_files = meeting.get('uploaded_files', [])
    
    # Contextualist creates scaffolding
    scaffolding = await contextualist_create_scaffolding(winning_idea, meeting_context, uploaded_files)
    
    # Update meeting
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"scaffolding_outline": scaffolding, "phase": "section_assignment"}}
    )
    
    return {"message": "Project scaffolding created", "scaffolding": scaffolding}

@api_router.post("/meetings/{session_id}/assign-sections")
async def assign_work_sections(session_id: str):
    """Phase 4.7: Contextualist assigns sections to personas"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    scaffolding = meeting.get('scaffolding_outline')
    if not scaffolding:
        raise HTTPException(status_code=400, detail="Need scaffolding before assigning sections")
    
    meeting_context = f"Topic: {meeting['topic']}. Description: {meeting.get('description', '')}"
    
    # Contextualist assigns sections
    assignments = await contextualist_assign_sections(scaffolding, meeting_context)
    
    # Update meeting
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"section_assignments": assignments, "phase": "section_creation"}}
    )
    
    return {"message": f"Assigned {len(assignments)} sections to personas", "assignments": assignments}

@api_router.post("/meetings/{session_id}/complete-section/{assignment_index}")
async def complete_section_work(session_id: str, assignment_index: int):
    """Phase 4.8: Persona completes their assigned section"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    assignments = meeting.get('section_assignments', [])
    if assignment_index >= len(assignments):
        raise HTTPException(status_code=400, detail="Invalid assignment index")
    
    assignment = assignments[assignment_index]
    if assignment['completion_status'] != 'pending':
        raise HTTPException(status_code=400, detail="Section already completed or in progress")
    
    meeting_context = f"Topic: {meeting['topic']}. Project: {meeting.get('scaffolding_outline', {}).get('project_title', '')}"
    uploaded_files = meeting.get('uploaded_files', [])
    
    # Mark as in progress
    assignment['completion_status'] = 'in_progress'
    
    # Persona completes the section
    section_content = await persona_complete_section(assignment, meeting_context, uploaded_files)
    assignment['completed_content'] = section_content
    assignment['completion_status'] = 'completed'
    
    # Update meeting
    assignments[assignment_index] = assignment
    completed_sections = meeting.get('completed_sections', [])
    completed_sections.append(assignment)
    
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {
            "section_assignments": assignments,
            "completed_sections": completed_sections
        }}
    )
    
    return {"message": f"Section '{assignment['section_title']}' completed", "assignment": assignment}

@api_router.post("/meetings/{session_id}/combine-main-document")
async def create_main_document(session_id: str):
    """Phase 4.9: Contextualist combines all sections into main document"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    assignments = meeting.get('section_assignments', [])
    scaffolding = meeting.get('scaffolding_outline', {})
    
    # Check all sections are completed
    incomplete_sections = [a for a in assignments if a['completion_status'] != 'completed']
    if incomplete_sections:
        raise HTTPException(status_code=400, detail=f"{len(incomplete_sections)} sections still incomplete")
    
    meeting_context = f"Topic: {meeting['topic']}. Project: {scaffolding.get('project_title', '')}"
    
    # Contextualist combines sections
    main_document = await contextualist_combine_sections(assignments, scaffolding, meeting_context)
    
    # Update meeting
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"main_document": main_document, "phase": "supplemental_creation"}}
    )
    
    return {"message": "Main document created", "document_preview": main_document[:500] + "..."}

@api_router.post("/meetings/{session_id}/create-supplemental-documents")
async def create_supplemental_documents(session_id: str):
    """Phase 4.10: Personas create their supplemental documents"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    supplemental_works = meeting.get('supplemental_works', [])
    if not supplemental_works:
        raise HTTPException(status_code=400, detail="No supplemental works available")
    
    meeting_context = f"Topic: {meeting['topic']}. Main document completed."
    supplemental_documents = []
    
    # Each persona creates their supplemental document
    for supplemental_work in supplemental_works:
        content = await persona_create_supplemental_document(supplemental_work, meeting_context)
        doc = {
            "id": supplemental_work['id'],
            "title": supplemental_work['title'],
            "creator_name": supplemental_work['creator_name'],
            "creator_persona_id": supplemental_work['creator_persona_id'],
            "content": content,
            "created_at": datetime.utcnow().isoformat()
        }
        supplemental_documents.append(doc)
    
    # Update meeting
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"supplemental_documents": supplemental_documents, "phase": "final_integration"}}
    )
    
    return {"message": f"Created {len(supplemental_documents)} supplemental documents", "documents": supplemental_documents}

@api_router.post("/meetings/{session_id}/create-final-deliverable")
async def create_final_deliverable(session_id: str):
    """Phase 4.11: Contextualist creates final integrated deliverable"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    main_document = meeting.get('main_document')
    supplemental_documents = meeting.get('supplemental_documents', [])
    
    if not main_document:
        raise HTTPException(status_code=400, detail="Main document not available")
    
    meeting_context = f"Topic: {meeting['topic']}. Complete creation project."
    
    # Contextualist creates final deliverable
    final_deliverable = await contextualist_final_integration(main_document, supplemental_documents, meeting_context)
    
    # Update meeting
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"final_deliverable": final_deliverable, "phase": "completed", "status": "deliverable_ready"}}
    )
    
    return {"message": "Final deliverable created", "deliverable": final_deliverable}

@api_router.get("/meetings/{session_id}/download-deliverable")
async def download_deliverable(session_id: str):
    """Download the final integrated deliverable"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    final_deliverable = meeting.get('final_deliverable')
    if not final_deliverable:
        raise HTTPException(status_code=400, detail="Final deliverable not available")
    
    return {"deliverable": final_deliverable}

@api_router.post("/meetings/{session_id}/generate-podcast")
async def start_podcast_generation(session_id: str):
    """Start generating podcast from completed parliamentary session"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check if meeting is in a completed state
    valid_statuses = ["completed", "deliverable_ready"]
    if meeting.get('status') not in valid_statuses:
        raise HTTPException(status_code=400, detail="Meeting must be completed before generating podcast")
    
    # Check if podcast already exists
    if meeting.get('generated_podcast'):
        return {"message": "Podcast already exists", "podcast": meeting['generated_podcast']}
    
    # Initialize podcast generation
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {
            "podcast_status": "generating",
            "podcast_generation_progress": 0,
            "podcast_started_at": datetime.utcnow().isoformat()
        }}
    )
    
    # Start background podcast generation
    import asyncio
    asyncio.create_task(generate_full_podcast(session_id))
    
    return {"message": "Podcast generation started", "session_id": session_id}

@api_router.get("/meetings/{session_id}/podcast-progress")
async def get_podcast_progress(session_id: str):
    """Get podcast generation progress"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    progress = meeting.get('podcast_generation_progress', 0)
    status = meeting.get('podcast_status', 'not_started')
    error = meeting.get('podcast_error')
    
    return {
        "progress": progress,
        "status": status,
        "error": error,
        "estimated_time_remaining": max(0, (100 - progress) * 0.5) if status == "generating" else 0
    }

@api_router.get("/meetings/{session_id}/download-podcast")
async def download_podcast(session_id: str):
    """Download the generated podcast audio file"""
    from fastapi.responses import FileResponse
    import os
    
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    podcast_info = meeting.get('generated_podcast')
    if not podcast_info:
        raise HTTPException(status_code=400, detail="No podcast available")
    
    if meeting.get('podcast_status') != 'completed':
        raise HTTPException(status_code=400, detail="Podcast generation not completed")
    
    file_path = podcast_info.get('file_path')
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Podcast file not found")
    
    return FileResponse(
        path=file_path,
        media_type='audio/mpeg',
        filename=f"parliamentarium_podcast_{session_id}.mp3",
        headers={"Content-Disposition": f"attachment; filename=parliamentarium_podcast_{session_id}.mp3"}
    )

@api_router.get("/meetings/{session_id}/podcast-info")
async def get_podcast_info(session_id: str):
    """Get detailed information about the generated podcast"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    podcast_info = meeting.get('generated_podcast')
    if not podcast_info:
        raise HTTPException(status_code=400, detail="No podcast available")
    
    return {
        "podcast_info": podcast_info,
        "generation_progress": meeting.get('podcast_generation_progress', 0),
        "generation_status": meeting.get('podcast_status', 'not_started')
    }

@api_router.get("/meetings/{session_id}")
async def get_meeting(session_id: str):
    """Get meeting details"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@api_router.post("/meetings/{session_id}/start-deliberation")
async def start_deliberation(session_id: str):
    """Phase 1: Gather initial ideas from all personas"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Get uploaded files for context
    uploaded_files = meeting.get('uploaded_files', [])
    
    # Get ideas from all personas with file context
    ideas = await get_all_persona_ideas(meeting['topic'], meeting['description'] or "", uploaded_files)
    
    # Update meeting
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"ideas": ideas, "phase": "analysis", "status": "analyzing"}}
    )
    
    return {"message": "Deliberation started", "ideas": ideas, "context_files": len(uploaded_files)}

@api_router.post("/meetings/{session_id}/analyze-idea/{idea_index}")
async def analyze_idea(session_id: str, idea_index: int):
    """Phase 2: Analyze a specific idea with all personas"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if idea_index >= len(meeting['ideas']):
        raise HTTPException(status_code=400, detail="Invalid idea index")
    
    idea = meeting['ideas'][idea_index]
    context = f"Topic: {meeting['topic']}. All ideas being considered: {[i['idea'] for i in meeting['ideas']]}"
    
    # No need to re-send file context - personas already considered it in Phase 1
    analyzed_idea = await analyze_idea_with_all_personas(idea, context)
    
    # Update meeting
    meeting['ideas'][idea_index] = analyzed_idea
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"ideas": meeting['ideas'], "current_idea_index": idea_index + 1}}
    )
    
    return {"message": f"Idea {idea_index + 1} analyzed", "analyzed_idea": analyzed_idea}

@api_router.post("/meetings/{session_id}/finalize")
async def finalize_meeting(session_id: str):
    """Phase 3 & 4: Select winner and generate final report"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Find highest scoring idea
    ideas = meeting['ideas']
    winner = max(ideas, key=lambda x: x['average_score'])
    
    # Generate final report
    final_report = await generate_final_report(winner, ideas, meeting['topic'])
    
    # Update meeting to main idea improvement phase (Phase 4.5)
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"final_report": final_report, "phase": "main_improvements", "status": "main_improvements"}}
    )
    
    return {"message": "Meeting finalized, ready for main idea improvements", "final_report": final_report, "winning_idea": winner}

@api_router.post("/meetings/{session_id}/improve-main-idea")
async def improve_main_winning_idea(session_id: str):
    """Phase 4.5: Improve the main winning idea with all personas"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if not meeting.get('final_report'):
        raise HTTPException(status_code=400, detail="Meeting must be finalized first")
    
    winning_idea = meeting['final_report']['winning_idea']
    meeting_context = f"Topic: {meeting['topic']}. Description: {meeting.get('description', '')}"
    
    # Step 1: Get improvements from all personas (except Contextualist and creator)
    improvements = await get_improvements_for_main_idea(winning_idea, meeting_context)
    
    # Step 2: Get critiques for each improvement
    for improvement in improvements:
        critiques = await get_main_idea_improvement_critiques(improvement, winning_idea, meeting_context)
        improvement['critiques'] = critiques
    
    # Step 3: Get creator's response to each improvement
    for improvement in improvements:
        creator_response = await get_main_creator_response_to_improvement(winning_idea, improvement, meeting_context)
        improvement['creator_response'] = creator_response
    
    # Step 4: Contextualist adds their improvement and integrates everything
    contextualist_integration = await contextualist_main_idea_improvement_and_integration(winning_idea, improvements, meeting_context)
    
    # Create main idea improvement record
    main_improvement_record = {
        "id": str(uuid.uuid4()),
        "original_idea": winning_idea['idea'],
        "improvements": improvements,
        "contextualist_integration": contextualist_integration,
        "accepted_improvements": len([imp for imp in improvements if imp.get('creator_response', {}).get('decision') == 'AGREE']),
        "final_enhanced_idea": contextualist_integration['integrated_main_idea']
    }
    
    # Update the winning idea with the enhanced version
    enhanced_winning_idea = winning_idea.copy()
    enhanced_winning_idea['idea'] = contextualist_integration['integrated_main_idea']
    enhanced_winning_idea['enhancement_history'] = {
        "original_idea": winning_idea['idea'],
        "improvements_applied": contextualist_integration['total_accepted_improvements'],
        "contextualist_integration": True
    }
    
    # Update final report with enhanced idea
    final_report = meeting['final_report']
    final_report['winning_idea'] = enhanced_winning_idea
    final_report['main_idea_improvements'] = main_improvement_record
    
    # Update meeting to supplemental works phase
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {
            "final_report": final_report,
            "main_idea_improvements": main_improvement_record,
            "phase": "supplemental",
            "status": "supplemental"
        }}
    )
    
    return {
        "message": "Main idea improvement completed, ready for supplemental works",
        "enhanced_idea": contextualist_integration['integrated_main_idea'],
        "improvement_record": main_improvement_record
    }

@api_router.post("/meetings/{session_id}/generate-supplements")
async def generate_supplemental_works(session_id: str):
    """Phase 5: Generate supplemental works for the winning idea"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if not meeting.get('final_report'):
        raise HTTPException(status_code=400, detail="Meeting must be finalized first")
    
    winning_idea = meeting['final_report']['winning_idea']
    meeting_context = f"Topic: {meeting['topic']}. Description: {meeting.get('description', '')}"
    
    # Generate supplemental works
    supplemental_works = await get_supplemental_works(session_id, winning_idea)
    
    # Update meeting to improvement phase
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"supplemental_works": supplemental_works, "phase": "improvements", "current_improvement_index": 0}}
    )
    
    return {"message": "Supplemental works generated, ready for improvement loops", "supplemental_works": supplemental_works}

@api_router.post("/meetings/{session_id}/process-improvements/{supplement_index}")
async def process_improvement_loop(session_id: str, supplement_index: int):
    """Phase 5.5: Process improvement loop for a specific supplemental work with Contextualist integration"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    supplemental_works = meeting.get('supplemental_works', [])
    if supplement_index >= len(supplemental_works):
        raise HTTPException(status_code=400, detail="Invalid supplement index")
    
    supplement = supplemental_works[supplement_index]
    meeting_context = f"Topic: {meeting['topic']}. Enhanced winning idea: {meeting['final_report']['winning_idea']['idea']}"
    
    # Step 1: Get improvements from all personas (except Contextualist and creator)
    improvements = await get_improvements_for_supplement(supplement, meeting_context)
    
    # Step 2: Get critiques for each improvement
    for improvement in improvements:
        critiques = await get_improvement_critiques(improvement, supplement, meeting_context)
        improvement['critiques'] = critiques
    
    # Step 3: Get creator's response to each improvement
    for improvement in improvements:
        creator_response = await get_creator_response_to_improvement(supplement, improvement, meeting_context)
        improvement['creator_response'] = creator_response
    
    # Step 4: Contextualist adds their improvement and integrates everything
    contextualist_integration = await contextualist_supplement_improvement_and_integration(supplement, improvements, meeting_context)
    
    # Create improvement loop record
    improvement_loop = {
        "id": str(uuid.uuid4()),
        "supplemental_work_id": supplement['id'],
        "improvements": improvements,
        "contextualist_integration": contextualist_integration,
        "accepted_improvements": len([imp for imp in improvements if imp.get('creator_response', {}).get('decision') == 'AGREE']),
        "final_enhanced_supplement": contextualist_integration['integrated_supplement']
    }
    
    # Update the supplemental work with the enhanced version
    supplement['content'] = contextualist_integration['integrated_supplement']
    supplement['improvement_history'] = {
        "original_content": supplement['content'],
        "improvements_applied": contextualist_integration['total_accepted_improvements'],
        "contextualist_integration": True,
        "final_version": contextualist_integration['integrated_supplement']
    }
    
    # Update meeting record
    supplemental_works[supplement_index] = supplement
    improvement_loops = meeting.get('improvement_loops', [])
    improvement_loops.append(improvement_loop)
    
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {
            "supplemental_works": supplemental_works,
            "improvement_loops": improvement_loops,
            "current_improvement_index": supplement_index + 1
        }}
    )
    
    return {
        "message": f"Improvement loop with Contextualist integration completed for supplement {supplement_index + 1}",
        "improvement_loop": improvement_loop,
        "enhanced_supplement": supplement,
        "contextualist_integration": contextualist_integration
    }

@api_router.post("/meetings/{session_id}/finalize-improvements")
async def finalize_improvements_phase(session_id: str):
    """Complete improvement loops and move to amendments phase"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"phase": "amendments", "current_supplement_index": 0}}
    )
    
    total_improvements = sum(loop.get('accepted_improvements', 0) for loop in meeting.get('improvement_loops', []))
    
    return {
        "message": "Improvement phase completed, moving to amendments",
        "total_accepted_improvements": total_improvements
    }

@api_router.post("/meetings/{session_id}/process-amendments/{supplement_index}")
async def process_amendments(session_id: str, supplement_index: int):
    """Phase 6: Process amendments for a specific supplemental work"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    supplemental_works = meeting.get('supplemental_works', [])
    if supplement_index >= len(supplemental_works):
        raise HTTPException(status_code=400, detail="Invalid supplement index")
    
    supplement = supplemental_works[supplement_index]
    meeting_context = f"Topic: {meeting['topic']}. Winning idea: {meeting['final_report']['winning_idea']['idea']}"
    
    # Get amendments from other personas
    amendments = await get_amendments_for_supplement(supplement, meeting_context)
    supplement['amendments'] = amendments
    
    # Get creator's votes on amendments
    accepted_amendment_ids = await get_creator_votes_on_amendments(supplement, amendments)
    supplement['accepted_amendments'] = accepted_amendment_ids
    
    # Update amendment statuses
    for amendment in amendments:
        amendment['vote_status'] = 'accepted' if amendment['id'] in accepted_amendment_ids else 'rejected'
    
    # Update meeting
    supplemental_works[supplement_index] = supplement
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"supplemental_works": supplemental_works, "current_supplement_index": supplement_index + 1}}
    )
    
    return {
        "message": f"Amendments processed for supplement {supplement_index + 1}",
        "supplement": supplement,
        "accepted_amendments": len(accepted_amendment_ids)
    }

@api_router.post("/meetings/{session_id}/integrate-final")
async def integrate_final_vision(session_id: str):
    """Phase 7: Contextualist integrates everything into final vision"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    supplemental_works = meeting.get('supplemental_works', [])
    winning_idea = meeting['final_report']['winning_idea']
    meeting_context = f"Topic: {meeting['topic']}. Description: {meeting.get('description', '')}"
    
    # Contextualist integration
    integration = await contextualist_integration(winning_idea, supplemental_works, meeting_context)
    
    # Update final report with integration
    final_report = meeting['final_report']
    final_report['integration'] = integration
    final_report['supplemental_works'] = supplemental_works
    
    # Update meeting
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"final_report": final_report, "phase": "completed", "status": "completed"}}
    )
    
    return {"message": "Final integration complete", "integration": integration}

@api_router.post("/meetings/{session_id}/pause")
async def pause_meeting(session_id: str, pause_request: UserPauseRequest):
    """Allow user to pause and provide input"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Create user pause record
    user_pause = {
        "id": str(uuid.uuid4()),
        "phase": meeting['phase'],
        "user_input": pause_request.user_input,
        "timestamp": datetime.utcnow().isoformat(),
        "responses": []
    }
    
    # Get responses from 3 key personas
    key_personas = ["ego", "contextualist", "superscholar"]
    for persona_id in key_personas:
        persona = PERSONAS[persona_id]
        prompt = f"""
        The human observer has paused our deliberation to provide input:
        "{pause_request.user_input}"
        
        Current phase: {meeting['phase']}
        Topic: {meeting['topic']}
        
        As {persona['name']}, respond to the human's input. How does this affect our deliberation?
        """
        
        response = await get_persona_response(persona_id, prompt)
        user_pause['responses'].append({
            "persona_id": persona_id,
            "persona_name": persona['name'],
            "response": response
        })
    
    # Add to meeting record
    user_pauses = meeting.get('user_pauses', [])
    user_pauses.append(user_pause)
    
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"user_pauses": user_pauses, "is_paused": True}}
    )
    
    return {"message": "Meeting paused, council responds to your input", "responses": user_pause['responses']}

@api_router.post("/meetings/{session_id}/resume")
async def resume_meeting(session_id: str):
    """Resume meeting after user pause"""
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"is_paused": False}}
    )
    
    return {"message": "Meeting resumed"}

@api_router.get("/meetings/{session_id}/report")
async def get_final_report(session_id: str):
    """Get the final comprehensive report"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if not meeting.get('final_report'):
        raise HTTPException(status_code=400, detail="Meeting not yet finalized")
    
    return meeting['final_report']

@api_router.get("/")
async def root():
    return {"message": "🏛️ The Parliamentarium Backend is Active"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()