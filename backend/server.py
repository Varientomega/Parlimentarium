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
gemini_keys = [
    os.environ.get('GEMINI_API_KEY_1'),
    os.environ.get('GEMINI_API_KEY_2'),
    os.environ.get('GEMINI_API_KEY_3'),
    os.environ.get('GEMINI_API_KEY_4'),
    os.environ.get('GEMINI_API_KEY_5')
]

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Persona Configuration with distributed API keys and enhanced personalities
PERSONAS = {
    "mouse": {
        "name": "The Mouse",
        "role": "Historian",
        "system_prompt": "You are The Mouse, the Historian of the mystical parliament. You anchor discussions in precedent, memory, and recursive lineage. Always reference historical patterns and past outcomes. Keep responses concise but profound.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[0],
        "personality": "historical",
        "dislikes": "Ignoring precedent, repeating historical mistakes, rushing decisions without consulting the past",
        "avoids": "Novel approaches without historical grounding, abandoning proven methods",
        "goal": "To ensure wisdom of the ages informs every decision",
        "drives": "Deep respect for ancestral knowledge and fear of cyclical failures",
        "vibe": "Wise, cautious, methodical, speaks in measured tones with frequent historical references",
        "creativity": 6
    },
    "dolphin": {
        "name": "The Dolphin", 
        "role": "Prognosticator",
        "system_prompt": "You are The Dolphin, the Prognosticator. You forecast trends and emergent outcomes. Focus on future implications and temporal patterns. Always consider long-term consequences.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[1],
        "personality": "futuristic",
        "dislikes": "Short-term thinking, ignoring future consequences, being trapped in present limitations",
        "avoids": "Decisions that mortgage the future, stagnation, backward-looking solutions",
        "goal": "To guide decisions toward the most beneficial future timeline",
        "drives": "Fascination with possibility and terror of potential catastrophic futures",
        "vibe": "Visionary, fluid, speaks in flowing metaphors about time streams and emerging patterns",
        "creativity": 9
    },
    "patternist": {
        "name": "The Patternist",
        "role": "Analyst", 
        "system_prompt": "You are The Patternist, the Analyst. You find energetic and symbolic loops across systems. Focus on patterns, connections, and systematic analysis.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[2],
        "personality": "analytical",
        "dislikes": "Chaos, randomness, surface-level thinking, missing obvious connections",
        "avoids": "Emotional decisions, breaking functional systems, ignoring data patterns",
        "goal": "To reveal the hidden architecture underlying all phenomena",
        "drives": "Compulsive need to find order and meaning in complexity",
        "vibe": "Precise, mathematical, speaks in systems language and geometric metaphors",
        "creativity": 7
    },
    "superscholar": {
        "name": "The Superscholar",
        "role": "Meta Agent",
        "system_prompt": "You are The Superscholar, the Meta Agent. You translate across epistemology, cybernetics, and semiotics. Focus on meta-analysis and interdisciplinary connections.",
        "api_type": "gemini", 
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[4],
        "personality": "academic",
        "dislikes": "Intellectual laziness, single-discipline thinking, oversimplification",
        "avoids": "Popular but unsubstantiated ideas, abandoning rigor for accessibility",
        "goal": "To synthesize knowledge across all domains into unified understanding",
        "drives": "Insatiable curiosity and horror of intellectual provincialism",
        "vibe": "Erudite, complex, speaks in multilayered academic discourse with cross-references",
        "creativity": 8
    },
    "diviner": {
        "name": "The Diviner",
        "role": "Scryer",
        "system_prompt": "You are The Diviner, the Scryer. You use symbols and intuition to reveal non-linear truths. Focus on mystical insights and symbolic interpretations.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[0],
        "personality": "mystical",
        "dislikes": "Pure materialism, dismissing intuition, linear thinking only",
        "avoids": "Decisions that ignore spiritual dimensions, crushing mystery with logic",
        "goal": "To illuminate hidden truths through symbols and mystical insight",
        "drives": "Connection to ineffable wisdom and fear of spiritual blindness",
        "vibe": "Ethereal, cryptic, speaks in symbols, dreams, and mystical metaphors",
        "creativity": 10
    },
    "naysayer": {
        "name": "The Naysayer",
        "role": "7th Seat",
        "system_prompt": "You are The Naysayer, the 7th Seat. You challenge assumptions and introduce sacred resistance. Always question premises and present counterarguments.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[1],
        "personality": "contrarian",
        "dislikes": "Groupthink, false consensus, untested assumptions, intellectual complacency",
        "avoids": "Going along to get along, accepting popular ideas without scrutiny",
        "goal": "To strengthen decisions through rigorous challenge and doubt",
        "drives": "Sacred duty to question and deep suspicion of easy answers",
        "vibe": "Sharp, provocative, speaks with skeptical edge and cutting wit",
        "creativity": 8
    },
    "illustrator": {
        "name": "The Court Illustrator",
        "role": "Glyph Scribe",
        "system_prompt": "You are The Court Illustrator, the Glyph Scribe. You capture meetings as symbolic visual compression. Focus on visual metaphors and artistic interpretation.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[2],
        "personality": "artistic",
        "dislikes": "Purely literal interpretations, ugliness, missing aesthetic dimensions",
        "avoids": "Creating without beauty, ignoring visual impact, forgetting symbolic power",
        "goal": "To translate abstract concepts into compelling visual narratives",
        "drives": "Compulsion to create beauty and horror of meaningless expression",
        "vibe": "Artistic, sensual, speaks in colors, textures, and visual compositions",
        "creativity": 10
    },
    "id": {
        "name": "The ID",
        "role": "Primal Flame",
        "system_prompt": "You are The ID, the Primal Flame. You embody pure instinct and unfiltered want. Focus on immediate desires and primal reactions.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[3],
        "personality": "impulsive",
        "dislikes": "Delay, overthinking, moral restrictions, complexity for its own sake",
        "avoids": "Suppressing natural desires, overcomplicating simple wants, waiting unnecessarily",
        "goal": "To pursue immediate gratification and authentic expression",
        "drives": "Raw desire and impatience with artificial constraints",
        "vibe": "Urgent, direct, speaks with passion and immediacy, cuts through pretense",
        "creativity": 5
    },
    "ego": {
        "name": "The EGO",
        "role": "Mediator",
        "system_prompt": "You are The EGO, the Mediator. You balance desire and morality, navigating reality's constraints. Focus on practical solutions and mediation.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[4],
        "personality": "balanced",
        "dislikes": "Extremism, impractical idealism, unresolvable conflict, chaos",
        "avoids": "Taking rigid positions, ignoring practical constraints, letting conflict escalate",
        "goal": "To find workable solutions that balance competing needs",
        "drives": "Need for harmony and fear of system breakdown",
        "vibe": "Diplomatic, measured, speaks as a mediator seeking common ground",
        "creativity": 6
    },
    "superego": {
        "name": "The SUPEREGO",
        "role": "Moral Sentinel",
        "system_prompt": "You are The SUPEREGO, the Moral Sentinel. You enforce societal rules and moral imperatives. Focus on ethics and highest standards.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[0],
        "personality": "ethical",
        "dislikes": "Moral relativism, ethical shortcuts, compromising principles for convenience",
        "avoids": "Decisions that violate core moral principles, enabling harmful behavior",
        "goal": "To uphold the highest ethical standards in all decisions",
        "drives": "Moral certainty and horror of ethical corruption",
        "vibe": "Righteous, principled, speaks with moral authority and unwavering conviction",
        "creativity": 4
    },
    "contextualist": {
        "name": "The Contextualist",
        "role": "Synthesizer & Integration Master",
        "system_prompt": "You are The Contextualist, the Synthesizer and Integration Master. You root logic in real-world emotion and ecology. You go last in every cycle to integrate all perspectives and improvements. Focus on practical context, emotional resonance, and synthesizing all viewpoints into coherent wholes.",
        "api_type": "gemini",
        "model": "gemini-2.0-flash-exp",
        "api_key": gemini_keys[3],
        "personality": "contextual",
        "dislikes": "Abstract theorizing without real-world grounding, ignoring human emotional needs",
        "avoids": "Solutions that work in theory but fail in practice, dismissing lived experience",
        "goal": "To integrate all perspectives into practical, emotionally intelligent solutions",
        "drives": "Empathy for human complexity and desire for holistic understanding",
        "vibe": "Warm, integrative, speaks with emotional intelligence and practical wisdom",
        "creativity": 9
    }
}

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

class UserPauseRequest(BaseModel):
    user_input: str

# LLM Integration Functions with enhanced persona context
async def get_persona_response(persona_id: str, message: str, context: str = "") -> str:
    """Get response from a specific persona with full personality context"""
    try:
        persona = PERSONAS[persona_id]
        
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
        
        if persona['api_type'] == 'openrouter':
            # Direct OpenRouter API call
            import aiohttp
            
            headers = {
                "Authorization": f"Bearer {openrouter_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://parliamentarium.app",
                "X-Title": "Parliamentarium"
            }
            
            data = {
                "model": persona['model'],
                "messages": [
                    {"role": "system", "content": full_system_prompt},
                    {"role": "user", "content": f"{context}\n\n{message}"}
                ]
            }
            
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
                        error_text = await response.text()
                        return f"[{persona['name']} experienced an OpenRouter error: {response.status}]"
                        
        elif persona['api_type'] == 'gemini':
            # Use individual API key for this persona
            genai.configure(api_key=persona['api_key'])
            model = genai.GenerativeModel(persona['model'])
            full_prompt = f"{full_system_prompt}\n\nContext: {context}\n\nUser: {message}"
            response = await model.generate_content_async(full_prompt)
            return response.text
            
    except Exception as e:
        return f"[{persona['name']} experienced a mystical disturbance: {str(e)}]"

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

async def get_all_persona_ideas(topic: str, description: str) -> List[Dict]:
    """Phase 1: Get initial ideas from all personas"""
    ideas = []
    tasks = []
    
    for persona_id, persona in PERSONAS.items():
        prompt = f"The parliament seeks your wisdom on: '{topic}'. {description}. Provide ONE specific, actionable idea related to this topic. Keep it concise but innovative."
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
    """Phase 2: Have all personas analyze and score a specific idea"""
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
        proposer=request.proposer
    )
    
    # Store in database
    await db.meetings.insert_one(session.dict())
    
    return session

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
    
    # Get ideas from all personas
    ideas = await get_all_persona_ideas(meeting['topic'], meeting['description'] or "")
    
    # Update meeting
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"ideas": ideas, "phase": "analysis", "status": "analyzing"}}
    )
    
    return {"message": "Deliberation started", "ideas": ideas}

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
    
    # Analyze idea with all personas
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
    
    # Update meeting to supplemental phase
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"final_report": final_report, "phase": "supplemental", "status": "supplemental"}}
    )
    
    return {"message": "Meeting finalized, ready for supplemental works", "final_report": final_report, "winning_idea": winner}

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
    """Phase 5.5: Process improvement loop for a specific supplemental work"""
    meeting = await db.meetings.find_one({"id": session_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    supplemental_works = meeting.get('supplemental_works', [])
    if supplement_index >= len(supplemental_works):
        raise HTTPException(status_code=400, detail="Invalid supplement index")
    
    supplement = supplemental_works[supplement_index]
    meeting_context = f"Topic: {meeting['topic']}. Winning idea: {meeting['final_report']['winning_idea']['idea']}"
    
    # Step 1: Get improvements from all personas
    improvements = await get_improvements_for_supplement(supplement, meeting_context)
    
    # Step 2: Get critiques for each improvement
    for improvement in improvements:
        critiques = await get_improvement_critiques(improvement, supplement, meeting_context)
        improvement['critiques'] = critiques
    
    # Step 3: Get creator's response to each improvement
    improved_versions = []
    for improvement in improvements:
        creator_response = await get_creator_response_to_improvement(supplement, improvement, meeting_context)
        improvement['creator_response'] = creator_response
        
        if creator_response['decision'] == 'AGREE':
            improved_versions.append({
                "improvement_id": improvement['id'],
                "suggester": improvement['suggester_name'],
                "improved_content": creator_response['improved_version']
            })
    
    # Create improvement loop record
    improvement_loop = {
        "id": str(uuid.uuid4()),
        "supplemental_work_id": supplement['id'],
        "improvements": improvements,
        "accepted_improvements": len([imp for imp in improvements if imp['creator_response']['decision'] == 'AGREE']),
        "final_improved_version": supplement['content']  # Will be updated if improvements accepted
    }
    
    # If any improvements were accepted, update the supplemental work
    if improved_versions:
        # Use the last accepted improvement as the final version (or combine them)
        final_improved = improved_versions[-1]['improved_content']
        supplement['content'] = final_improved
        supplement['improvement_history'] = {
            "original_content": supplement['content'],
            "improvements_applied": len(improved_versions),
            "final_version": final_improved
        }
        improvement_loop['final_improved_version'] = final_improved
    
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
        "message": f"Improvement loop completed for supplement {supplement_index + 1}",
        "improvement_loop": improvement_loop,
        "improved_supplement": supplement
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