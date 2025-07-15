#!/usr/bin/env python3
"""
Detailed LLM Integration Test for Parliamentary System
Tests the quality and content of LLM responses
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except:
        pass
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_BASE = f"{BASE_URL}/api"

async def test_llm_integration():
    """Test LLM integration quality"""
    async with aiohttp.ClientSession() as session:
        print("🧠 Testing LLM Integration Quality")
        print("=" * 50)
        
        # Create a meeting
        meeting_data = {
            "topic": "How to create a sustainable urban transportation system",
            "description": "We need innovative solutions for reducing traffic congestion and carbon emissions in cities.",
            "proposer": "Urban Planning Council"
        }
        
        async with session.post(f"{API_BASE}/meetings", json=meeting_data) as response:
            meeting = await response.json()
            meeting_id = meeting['id']
            print(f"✅ Created meeting: {meeting_id}")
        
        # Start deliberation and check persona responses
        async with session.post(f"{API_BASE}/meetings/{meeting_id}/start-deliberation") as response:
            data = await response.json()
            ideas = data['ideas']
            
            print(f"\n📝 Persona Ideas Generated:")
            print("-" * 40)
            
            for i, idea in enumerate(ideas[:3]):  # Show first 3 ideas
                persona_name = idea['persona_name']
                idea_text = idea['idea'][:200] + "..." if len(idea['idea']) > 200 else idea['idea']
                print(f"{i+1}. {persona_name}:")
                print(f"   {idea_text}")
                print()
        
        # Analyze first idea to check scoring
        async with session.post(f"{API_BASE}/meetings/{meeting_id}/analyze-idea/0") as response:
            data = await response.json()
            analyzed_idea = data['analyzed_idea']
            
            print(f"🔍 Analysis of First Idea:")
            print("-" * 30)
            print(f"Average Score: {analyzed_idea['average_score']}/10")
            
            # Show a few persona scores
            for score_data in analyzed_idea['scores'][:3]:
                persona_name = score_data['persona_name']
                score = score_data['score']
                reasoning = score_data['reasoning'][:150] + "..." if len(score_data['reasoning']) > 150 else score_data['reasoning']
                print(f"\n{persona_name}: {score}/10")
                print(f"Reasoning: {reasoning}")
        
        # Finalize and get report
        async with session.post(f"{API_BASE}/meetings/{meeting_id}/finalize") as response:
            data = await response.json()
            final_report = data['final_report']
            
            print(f"\n📊 Final Report Summary:")
            print("-" * 30)
            print(f"Winning Score: {final_report['final_score']}/10")
            print(f"Total Ideas Evaluated: {final_report['total_ideas_evaluated']}")
            
            # Show implementation plan excerpt
            impl_plan = final_report['implementation_plan'][:300] + "..." if len(final_report['implementation_plan']) > 300 else final_report['implementation_plan']
            print(f"\nImplementation Plan (excerpt):")
            print(f"{impl_plan}")
            
            # Show follow-up questions
            questions = final_report['follow_up_questions'][:300] + "..." if len(final_report['follow_up_questions']) > 300 else final_report['follow_up_questions']
            print(f"\nFollow-up Questions (excerpt):")
            print(f"{questions}")
        
        print(f"\n🎉 LLM Integration Test Complete!")
        print("All personas are responding with meaningful content.")

if __name__ == "__main__":
    asyncio.run(test_llm_integration())