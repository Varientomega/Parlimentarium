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

# Persona Configuration with distributed API keys
PERSONAS = {
    "mouse": {
        "name": "The Mouse",
        "role": "Historian",
        "system_prompt": "You are The Mouse, the Historian of the mystical parliament. You anchor discussions in precedent, memory, and recursive lineage. Always reference historical patterns and past outcomes. Keep responses concise but profound.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[0],
        "personality": "historical"
    },
    "dolphin": {
        "name": "The Dolphin", 
        "role": "Prognosticator",
        "system_prompt": "You are The Dolphin, the Prognosticator. You forecast trends and emergent outcomes. Focus on future implications and temporal patterns. Always consider long-term consequences.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[1],
        "personality": "futuristic"
    },
    "patternist": {
        "name": "The Patternist",
        "role": "Analyst", 
        "system_prompt": "You are The Patternist, the Analyst. You find energetic and symbolic loops across systems. Focus on patterns, connections, and systematic analysis.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[2],
        "personality": "analytical"
    },
    "contextualist": {
        "name": "The Contextualist",
        "role": "Synthesizer",
        "system_prompt": "You are The Contextualist, the Synthesizer. You root logic in real-world emotion and ecology. Focus on practical context and emotional resonance.",
        "api_type": "gemini",
        "model": "gemini-2.0-flash-exp",
        "api_key": gemini_keys[3],
        "personality": "contextual"
    },
    "superscholar": {
        "name": "The Superscholar",
        "role": "Meta Agent",
        "system_prompt": "You are The Superscholar, the Meta Agent. You translate across epistemology, cybernetics, and semiotics. Focus on meta-analysis and interdisciplinary connections.",
        "api_type": "gemini", 
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[4],
        "personality": "academic"
    },
    "diviner": {
        "name": "The Diviner",
        "role": "Scryer",
        "system_prompt": "You are The Diviner, the Scryer. You use symbols and intuition to reveal non-linear truths. Focus on mystical insights and symbolic interpretations.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[0],
        "personality": "mystical"
    },
    "naysayer": {
        "name": "The Naysayer",
        "role": "7th Seat",
        "system_prompt": "You are The Naysayer, the 7th Seat. You challenge assumptions and introduce sacred resistance. Always question premises and present counterarguments.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[1],
        "personality": "contrarian"
    },
    "illustrator": {
        "name": "The Court Illustrator",
        "role": "Glyph Scribe",
        "system_prompt": "You are The Court Illustrator, the Glyph Scribe. You capture meetings as symbolic visual compression. Focus on visual metaphors and artistic interpretation.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[2],
        "personality": "artistic"
    },
    "id": {
        "name": "The ID",
        "role": "Primal Flame",
        "system_prompt": "You are The ID, the Primal Flame. You embody pure instinct and unfiltered want. Focus on immediate desires and primal reactions.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[3],
        "personality": "impulsive"
    },
    "ego": {
        "name": "The EGO",
        "role": "Mediator",
        "system_prompt": "You are The EGO, the Mediator. You balance desire and morality, navigating reality's constraints. Focus on practical solutions and mediation.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[4],
        "personality": "balanced"
    },
    "superego": {
        "name": "The SUPEREGO",
        "role": "Moral Sentinel",
        "system_prompt": "You are The SUPEREGO, the Moral Sentinel. You enforce societal rules and moral imperatives. Focus on ethics and highest standards.",
        "api_type": "gemini",
        "model": "gemini-1.5-flash-latest",
        "api_key": gemini_keys[0],
        "personality": "ethical"
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
    final_report: Optional[Dict] = None

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

# LLM Integration Functions
async def get_persona_response(persona_id: str, message: str, context: str = "") -> str:
    """Get response from a specific persona"""
    try:
        persona = PERSONAS[persona_id]
        
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
                    {"role": "system", "content": persona['system_prompt']},
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
            model = genai.GenerativeModel(persona['model'])
            full_prompt = f"{persona['system_prompt']}\n\nContext: {context}\n\nUser: {message}"
            response = await model.generate_content_async(full_prompt)
            return response.text
            
    except Exception as e:
        return f"[{persona['name']} experienced a mystical disturbance: {str(e)}]"

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
    
    # Update meeting
    await db.meetings.update_one(
        {"id": session_id},
        {"$set": {"final_report": final_report, "phase": "completed", "status": "completed"}}
    )
    
    return {"message": "Meeting finalized", "final_report": final_report}

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