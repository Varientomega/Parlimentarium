#!/usr/bin/env python3
"""
Detailed Persona Functionality Test
Tests the specific persona responses and LLM integration
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
import sys

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

class PersonaDetailedTester:
    def __init__(self):
        self.session = None
        self.meeting_id = None
        self.test_results = []
        self.persona_responses = {}
        
    async def setup_session(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
            
    async def create_test_meeting(self):
        """Create a test meeting for persona testing"""
        try:
            meeting_data = {
                "topic": "Design an innovative educational system that adapts to individual learning styles",
                "description": "We need creative approaches to revolutionize education by personalizing learning experiences for each student's unique cognitive patterns and interests.",
                "proposer": "Educational Innovation Council"
            }
            
            async with self.session.post(f"{API_BASE}/meetings", json=meeting_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.meeting_id = data.get('id')
                    self.log_test("Create Test Meeting", True, f"Meeting created: {self.meeting_id}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_test("Create Test Meeting", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Create Test Meeting", False, f"Exception: {str(e)}")
            return False
            
    async def test_persona_idea_generation(self):
        """Test detailed persona idea generation"""
        if not self.meeting_id:
            self.log_test("Persona Idea Generation", False, "No meeting ID available")
            return False
            
        try:
            async with self.session.post(f"{API_BASE}/meetings/{self.meeting_id}/start-deliberation") as response:
                if response.status == 200:
                    data = await response.json()
                    ideas = data.get('ideas', [])
                    
                    print(f"\n🎭 PERSONA IDEA ANALYSIS")
                    print("=" * 80)
                    
                    expected_personas = {
                        'The Mouse': 'Historian',
                        'The Dolphin': 'Prognosticator', 
                        'The Patternist': 'Analyst',
                        'The Contextualist': 'Synthesizer',
                        'The Superscholar': 'Meta Agent',
                        'The Diviner': 'Scryer',
                        'The Naysayer': '7th Seat',
                        'The Court Illustrator': 'Glyph Scribe',
                        'The ID': 'Primal Flame',
                        'The EGO': 'Mediator',
                        'The SUPEREGO': 'Moral Sentinel'
                    }
                    
                    persona_found = {}
                    unique_responses = True
                    llm_errors = []
                    
                    for idea in ideas:
                        persona_name = idea.get('persona_name', 'Unknown')
                        persona_role = idea.get('role', 'Unknown')
                        idea_text = idea.get('idea', '')
                        
                        persona_found[persona_name] = True
                        self.persona_responses[persona_name] = {
                            'role': persona_role,
                            'idea': idea_text,
                            'length': len(idea_text),
                            'has_error_markers': any(marker in idea_text for marker in ['experienced an error', 'mystical disturbance', 'OpenRouter error', 'Gemini error'])
                        }
                        
                        print(f"\n🎭 {persona_name} ({persona_role})")
                        print(f"   Idea Length: {len(idea_text)} characters")
                        
                        # Check for error markers
                        if self.persona_responses[persona_name]['has_error_markers']:
                            llm_errors.append(persona_name)
                            print(f"   ❌ ERROR DETECTED: {idea_text[:100]}...")
                        else:
                            print(f"   ✅ Response: {idea_text[:100]}...")
                            
                        # Check for generic/duplicate responses
                        if len(idea_text) < 50:
                            print(f"   ⚠️  WARNING: Very short response")
                            
                    # Check if all expected personas responded
                    missing_personas = [name for name in expected_personas.keys() if name not in persona_found]
                    if missing_personas:
                        self.log_test("All Personas Present", False, f"Missing personas: {missing_personas}")
                    else:
                        self.log_test("All Personas Present", True, "All 11 personas responded")
                        
                    # Check for LLM errors
                    if llm_errors:
                        self.log_test("LLM Integration", False, f"Personas with LLM errors: {llm_errors}")
                        print(f"\n❌ LLM ERRORS DETECTED IN: {', '.join(llm_errors)}")
                    else:
                        self.log_test("LLM Integration", True, "All personas generated content without errors")
                        
                    # Check response uniqueness
                    response_texts = [resp['idea'] for resp in self.persona_responses.values()]
                    unique_texts = set(response_texts)
                    if len(unique_texts) == len(response_texts):
                        self.log_test("Response Uniqueness", True, "All persona responses are unique")
                    else:
                        duplicates = len(response_texts) - len(unique_texts)
                        self.log_test("Response Uniqueness", False, f"{duplicates} duplicate responses detected")
                        
                    return len(llm_errors) == 0
                    
                else:
                    error_text = await response.text()
                    self.log_test("Persona Idea Generation", False, f"HTTP {response.status}: {error_text}")
                    return False
                    
        except Exception as e:
            self.log_test("Persona Idea Generation", False, f"Exception: {str(e)}")
            return False
            
    async def test_persona_personality_analysis(self):
        """Analyze if personas are showing distinct personalities"""
        if not self.persona_responses:
            self.log_test("Personality Analysis", False, "No persona responses to analyze")
            return False
            
        print(f"\n🧠 PERSONALITY ANALYSIS")
        print("=" * 80)
        
        personality_indicators = {
            'The Mouse': ['historical', 'precedent', 'past', 'tradition', 'memory', 'ancestor'],
            'The Dolphin': ['future', 'predict', 'forecast', 'trend', 'tomorrow', 'evolution'],
            'The Patternist': ['pattern', 'system', 'analysis', 'structure', 'data', 'connection'],
            'The Naysayer': ['however', 'but', 'challenge', 'concern', 'problem', 'risk'],
            'The Diviner': ['mystical', 'intuition', 'symbol', 'spiritual', 'vision', 'divine'],
            'The ID': ['want', 'need', 'desire', 'immediate', 'now', 'passion'],
            'The SUPEREGO': ['moral', 'ethical', 'right', 'wrong', 'principle', 'duty'],
            'The EGO': ['balance', 'practical', 'mediate', 'solution', 'compromise', 'realistic']
        }
        
        personality_scores = {}
        
        for persona_name, response_data in self.persona_responses.items():
            if response_data['has_error_markers']:
                continue
                
            idea_text = response_data['idea'].lower()
            indicators = personality_indicators.get(persona_name, [])
            
            matches = sum(1 for indicator in indicators if indicator in idea_text)
            personality_score = matches / len(indicators) if indicators else 0
            personality_scores[persona_name] = personality_score
            
            print(f"🎭 {persona_name}: {personality_score:.2f} personality match")
            if personality_score > 0.3:
                print(f"   ✅ Strong personality indicators detected")
            elif personality_score > 0.1:
                print(f"   ⚠️  Weak personality indicators")
            else:
                print(f"   ❌ No clear personality indicators")
                
        avg_personality_score = sum(personality_scores.values()) / len(personality_scores) if personality_scores else 0
        
        if avg_personality_score > 0.2:
            self.log_test("Personality Distinctiveness", True, f"Average personality score: {avg_personality_score:.2f}")
            return True
        else:
            self.log_test("Personality Distinctiveness", False, f"Low personality distinctiveness: {avg_personality_score:.2f}")
            return False
            
    async def test_gemini_api_keys(self):
        """Test if Gemini API keys are working"""
        print(f"\n🔑 GEMINI API KEY TESTING")
        print("=" * 80)
        
        # Read API keys from backend .env
        gemini_keys = []
        try:
            with open('/app/backend/.env', 'r') as f:
                for line in f:
                    if line.startswith('GEMINI_API_KEY_'):
                        key = line.split('=', 1)[1].strip().strip('"')
                        gemini_keys.append(key)
        except Exception as e:
            self.log_test("Read Gemini Keys", False, f"Could not read API keys: {str(e)}")
            return False
            
        print(f"Found {len(gemini_keys)} Gemini API keys")
        
        # Test each key with a simple API call
        import google.generativeai as genai
        working_keys = 0
        
        for i, key in enumerate(gemini_keys):
            try:
                genai.configure(api_key=key)
                model = genai.GenerativeModel('gemini-1.5-flash-latest')
                response = await model.generate_content_async("Say 'Hello' in one word.")
                
                if response and response.text:
                    working_keys += 1
                    print(f"   ✅ Key {i+1}: Working")
                else:
                    print(f"   ❌ Key {i+1}: No response")
                    
            except Exception as e:
                print(f"   ❌ Key {i+1}: Error - {str(e)}")
                
        if working_keys > 0:
            self.log_test("Gemini API Keys", True, f"{working_keys}/{len(gemini_keys)} keys working")
            return True
        else:
            self.log_test("Gemini API Keys", False, "No working Gemini API keys found")
            return False
            
    async def run_detailed_persona_tests(self):
        """Run detailed persona functionality tests"""
        print(f"🎭 Starting Detailed Persona Functionality Tests")
        print(f"Backend URL: {BASE_URL}")
        print("=" * 80)
        
        await self.setup_session()
        
        try:
            # Test 1: Create meeting
            if not await self.create_test_meeting():
                print("❌ Cannot create meeting, stopping tests")
                return False
                
            # Test 2: Test Gemini API keys
            await self.test_gemini_api_keys()
            
            # Test 3: Generate ideas and analyze personas
            if not await self.test_persona_idea_generation():
                print("❌ Persona idea generation failed")
                
            # Test 4: Analyze personality distinctiveness
            await self.test_persona_personality_analysis()
            
        finally:
            await self.cleanup_session()
            
        # Print summary
        print("\n" + "=" * 80)
        print("📊 DETAILED TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%" if total > 0 else "No tests run")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
                    
        return passed == total

async def main():
    """Main test runner"""
    tester = PersonaDetailedTester()
    success = await tester.run_detailed_persona_tests()
    
    if success:
        print("\n🎉 All detailed persona tests passed!")
    else:
        print("\n💥 Some persona functionality issues detected.")

if __name__ == "__main__":
    asyncio.run(main())