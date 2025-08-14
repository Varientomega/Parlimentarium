#!/usr/bin/env python3
"""
Final Comprehensive Persona Test
Complete analysis of all 11 personas and their unique characteristics
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

async def test_all_personas():
    """Test all 11 personas with detailed analysis"""
    
    # Create meeting
    meeting_data = {
        "topic": "Create a revolutionary approach to sustainable urban transportation",
        "description": "Design innovative transportation solutions that reduce environmental impact while improving urban mobility and quality of life.",
        "proposer": "Urban Innovation Council"
    }
    
    async with aiohttp.ClientSession() as session:
        # Create meeting
        async with session.post(f"{API_BASE}/meetings", json=meeting_data) as response:
            if response.status != 200:
                print("❌ Failed to create meeting")
                return False
                
            meeting_data = await response.json()
            meeting_id = meeting_data.get('id')
            print(f"✅ Meeting created: {meeting_id}")
            
        # Start deliberation
        async with session.post(f"{API_BASE}/meetings/{meeting_id}/start-deliberation") as response:
            if response.status != 200:
                print("❌ Failed to start deliberation")
                return False
                
            data = await response.json()
            ideas = data.get('ideas', [])
            
            print(f"\n🎭 COMPLETE PERSONA ANALYSIS")
            print("=" * 100)
            
            expected_personas = [
                "The Mouse", "The Dolphin", "The Patternist", "The Contextualist",
                "The Superscholar", "The Diviner", "The Naysayer", "The Court Illustrator", 
                "The ID", "The EGO", "The SUPEREGO"
            ]
            
            found_personas = []
            persona_details = {}
            
            for idea in ideas:
                persona_name = idea.get('persona_name', 'Unknown')
                persona_role = idea.get('role', 'Unknown')
                idea_text = idea.get('idea', '')
                
                found_personas.append(persona_name)
                persona_details[persona_name] = {
                    'role': persona_role,
                    'idea': idea_text,
                    'length': len(idea_text)
                }
                
                print(f"\n🎭 {persona_name} ({persona_role})")
                print(f"   Length: {len(idea_text)} chars")
                print(f"   Content: {idea_text[:150]}...")
                
                # Check for personality indicators
                personality_indicators = {
                    'The Mouse': ['historical', 'precedent', 'past', 'tradition', 'memory', 'ancestor', 'guild', 'master', 'apprentice'],
                    'The Dolphin': ['future', 'predict', 'forecast', 'trend', 'tomorrow', 'evolution', 'current', 'flow', 'stream'],
                    'The Patternist': ['pattern', 'system', 'analysis', 'structure', 'data', 'connection', 'inefficient', 'focus'],
                    'The Naysayer': ['however', 'but', 'challenge', 'concern', 'problem', 'risk', 'spare me', 'buzzword'],
                    'The Diviner': ['mystical', 'intuition', 'symbol', 'spiritual', 'vision', 'divine', 'mist', 'swirl'],
                    'The ID': ['want', 'need', 'desire', 'immediate', 'now', 'passion', 'forget', 'scrap'],
                    'The SUPEREGO': ['moral', 'ethical', 'right', 'wrong', 'principle', 'duty', 'rigor', 'laudable'],
                    'The EGO': ['balance', 'practical', 'mediate', 'solution', 'compromise', 'realistic', 'achieve'],
                    'The Court Illustrator': ['color', 'visual', 'glyph', 'crimson', 'vortex', 'vibrant', 'parchment'],
                    'The Superscholar': ['assumption', 'flaw', 'academic', 'interdisciplinary', 'complex', 'parliament'],
                    'The Contextualist': ['earth', 'actually', 'real', 'practical', 'integration', 'holistic']
                }
                
                indicators = personality_indicators.get(persona_name, [])
                matches = sum(1 for indicator in indicators if indicator.lower() in idea_text.lower())
                personality_score = matches / len(indicators) if indicators else 0
                
                print(f"   Personality Score: {personality_score:.2f} ({matches}/{len(indicators)} indicators)")
                
                if personality_score > 0.3:
                    print(f"   ✅ STRONG personality expression")
                elif personality_score > 0.1:
                    print(f"   ⚠️  MODERATE personality expression")
                else:
                    print(f"   ❌ WEAK personality expression")
                    
            # Summary
            print(f"\n📊 SUMMARY")
            print("=" * 100)
            print(f"Expected Personas: {len(expected_personas)}")
            print(f"Found Personas: {len(found_personas)}")
            
            missing = [p for p in expected_personas if p not in found_personas]
            if missing:
                print(f"❌ Missing: {missing}")
            else:
                print(f"✅ All personas present")
                
            # Check uniqueness
            response_texts = [details['idea'] for details in persona_details.values()]
            unique_responses = len(set(response_texts)) == len(response_texts)
            print(f"✅ All responses unique: {unique_responses}")
            
            # Average response length
            avg_length = sum(details['length'] for details in persona_details.values()) / len(persona_details)
            print(f"📏 Average response length: {avg_length:.0f} characters")
            
            return True

async def main():
    print("🏛️ FINAL COMPREHENSIVE PERSONA FUNCTIONALITY TEST")
    print("=" * 100)
    
    success = await test_all_personas()
    
    if success:
        print("\n🎉 Persona functionality test completed!")
    else:
        print("\n💥 Persona functionality test failed!")

if __name__ == "__main__":
    asyncio.run(main())