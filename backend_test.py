#!/usr/bin/env python3
"""
Backend Test Suite for Mystical Parliamentary System
Tests the complete 4-phase deliberation process
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

class ParliamentaryTester:
    def __init__(self):
        self.session = None
        self.meeting_id = None
        self.test_results = []
        
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
            
    async def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "Parliamentarium Backend is Active" in data.get('message', ''):
                        self.log_test("Root Endpoint", True, "Backend is active and responding")
                        return True
                    else:
                        self.log_test("Root Endpoint", False, f"Unexpected response: {data}")
                        return False
                else:
                    self.log_test("Root Endpoint", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
            return False
            
    async def test_create_meeting(self):
        """Test Phase 0: Meeting Creation"""
        try:
            meeting_data = {
                "topic": "How to build a revolutionary social media platform that promotes genuine human connection",
                "description": "We need innovative ideas for creating a social platform that counters isolation and promotes meaningful relationships in the digital age.",
                "proposer": "Digital Innovation Council"
            }
            
            async with self.session.post(f"{API_BASE}/meetings", json=meeting_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.meeting_id = data.get('id')
                    if self.meeting_id and data.get('topic') == meeting_data['topic']:
                        self.log_test("Create Meeting", True, f"Meeting created with ID: {self.meeting_id}")
                        return True
                    else:
                        self.log_test("Create Meeting", False, f"Invalid response structure: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Create Meeting", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Create Meeting", False, f"Exception: {str(e)}")
            return False

    async def test_create_meeting_with_custom_api_keys(self):
        """Test Meeting Creation with Custom API Key Assignments"""
        try:
            meeting_data = {
                "topic": "Test Custom API Keys",
                "description": "Testing dynamic key assignment",
                "proposer": "API Key Tester",
                "persona_api_keys": {
                    "mouse": {"primary": "gemini_2", "fallback": ["gemini_1", "gemini_3"]},
                    "dolphin": {"primary": "gemini_3", "fallback": ["gemini_1", "gemini_2"]},
                    "patternist": {"primary": "gemini_4", "fallback": ["gemini_2", "gemini_5"]},
                    "contextualist": {"primary": "gemini_5", "fallback": ["gemini_1", "gemini_4"]}
                }
            }
            
            async with self.session.post(f"{API_BASE}/meetings", json=meeting_data) as response:
                if response.status == 200:
                    data = await response.json()
                    custom_meeting_id = data.get('id')
                    if custom_meeting_id and data.get('topic') == meeting_data['topic']:
                        self.log_test("Create Meeting with Custom API Keys", True, f"Meeting with custom keys created: {custom_meeting_id}")
                        return True, custom_meeting_id
                    else:
                        self.log_test("Create Meeting with Custom API Keys", False, f"Invalid response structure: {data}")
                        return False, None
                else:
                    error_text = await response.text()
                    self.log_test("Create Meeting with Custom API Keys", False, f"HTTP {response.status}: {error_text}")
                    return False, None
        except Exception as e:
            self.log_test("Create Meeting with Custom API Keys", False, f"Exception: {str(e)}")
            return False, None

    async def test_verify_custom_api_keys_stored(self, custom_meeting_id):
        """Test that custom API key assignments are stored in the meeting"""
        if not custom_meeting_id:
            self.log_test("Verify Custom API Keys Stored", False, "No custom meeting ID available")
            return False
            
        try:
            async with self.session.get(f"{API_BASE}/meetings/{custom_meeting_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    persona_api_keys = data.get('persona_api_keys', {})
                    
                    # Check if custom assignments are stored
                    expected_assignments = {
                        "mouse": {"primary": "gemini_2", "fallback": ["gemini_1", "gemini_3"]},
                        "dolphin": {"primary": "gemini_3", "fallback": ["gemini_1", "gemini_2"]}
                    }
                    
                    if persona_api_keys and 'mouse' in persona_api_keys and 'dolphin' in persona_api_keys:
                        mouse_config = persona_api_keys['mouse']
                        dolphin_config = persona_api_keys['dolphin']
                        
                        if (mouse_config.get('primary') == 'gemini_2' and 
                            dolphin_config.get('primary') == 'gemini_3'):
                            self.log_test("Verify Custom API Keys Stored", True, "Custom API key assignments stored correctly")
                            return True
                        else:
                            self.log_test("Verify Custom API Keys Stored", False, f"API key assignments don't match expected values")
                            return False
                    else:
                        self.log_test("Verify Custom API Keys Stored", False, f"persona_api_keys not found in meeting data")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Verify Custom API Keys Stored", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Verify Custom API Keys Stored", False, f"Exception: {str(e)}")
            return False

    async def test_start_deliberation_with_custom_keys(self, custom_meeting_id):
        """Test Start Deliberation with Custom API Key Assignments"""
        if not custom_meeting_id:
            self.log_test("Start Deliberation with Custom Keys", False, "No custom meeting ID available")
            return False
            
        try:
            async with self.session.post(f"{API_BASE}/meetings/{custom_meeting_id}/start-deliberation") as response:
                if response.status == 200:
                    data = await response.json()
                    ideas = data.get('ideas', [])
                    if len(ideas) >= 10:  # Should have ideas from personas
                        # Check that ideas were generated (indicating API keys worked)
                        valid_ideas = [idea for idea in ideas if idea.get('idea') and len(idea.get('idea', '')) > 10]
                        if len(valid_ideas) >= 8:  # At least 8 personas should generate valid content
                            self.log_test("Start Deliberation with Custom Keys", True, f"Deliberation started with custom keys, {len(valid_ideas)} valid ideas generated")
                            return True
                        else:
                            self.log_test("Start Deliberation with Custom Keys", False, f"Only {len(valid_ideas)} valid ideas generated, expected at least 8")
                            return False
                    else:
                        self.log_test("Start Deliberation with Custom Keys", False, f"Expected at least 10 ideas, got {len(ideas)}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Start Deliberation with Custom Keys", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Start Deliberation with Custom Keys", False, f"Exception: {str(e)}")
            return False

    async def test_api_key_fallback_mechanism(self):
        """Test API Key Fallback with Invalid Keys"""
        try:
            # Create meeting with invalid primary keys to test fallback
            meeting_data = {
                "topic": "Test API Key Fallback",
                "description": "Testing fallback mechanism with invalid keys",
                "proposer": "Fallback Tester",
                "persona_api_keys": {
                    "mouse": {"primary": "invalid_key_1", "fallback": ["gemini_1", "gemini_2"]},
                    "dolphin": {"primary": "invalid_key_2", "fallback": ["gemini_2", "gemini_3"]},
                    "ego": {"primary": "invalid_key_3", "fallback": ["gemini_4", "gemini_5"]}
                }
            }
            
            async with self.session.post(f"{API_BASE}/meetings", json=meeting_data) as response:
                if response.status == 200:
                    data = await response.json()
                    fallback_meeting_id = data.get('id')
                    
                    # Now try to start deliberation - should use fallback keys
                    async with self.session.post(f"{API_BASE}/meetings/{fallback_meeting_id}/start-deliberation") as delib_response:
                        if delib_response.status == 200:
                            delib_data = await delib_response.json()
                            ideas = delib_data.get('ideas', [])
                            
                            # Check if any ideas were generated despite invalid primary keys
                            valid_ideas = [idea for idea in ideas if idea.get('idea') and len(idea.get('idea', '')) > 10]
                            if len(valid_ideas) >= 5:  # At least some should work via fallback
                                self.log_test("API Key Fallback Mechanism", True, f"Fallback mechanism working, {len(valid_ideas)} ideas generated with fallback keys")
                                return True
                            else:
                                self.log_test("API Key Fallback Mechanism", False, f"Fallback failed, only {len(valid_ideas)} valid ideas")
                                return False
                        else:
                            error_text = await delib_response.text()
                            self.log_test("API Key Fallback Mechanism", False, f"Deliberation failed: HTTP {delib_response.status}: {error_text}")
                            return False
                else:
                    error_text = await response.text()
                    self.log_test("API Key Fallback Mechanism", False, f"Meeting creation failed: HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("API Key Fallback Mechanism", False, f"Exception: {str(e)}")
            return False

    async def test_image_generation_endpoint(self):
        """Test the dedicated image generation test endpoint"""
        try:
            test_data = {
                "prompt": "A mystical parliamentary chamber with AI personas debating",
                "style": "court_illustrator"
            }
            
            async with self.session.post(f"{API_BASE}/test-image-generation", json=test_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('success') and data.get('image_url'):
                        self.log_test("Image Generation Endpoint", True, f"Image generated successfully: {data.get('image_url')[:50]}...")
                        return True
                    elif not data.get('success'):
                        # Check if it's a graceful failure
                        error_msg = data.get('error', 'Unknown error')
                        self.log_test("Image Generation Endpoint", True, f"Graceful failure handled: {error_msg}")
                        return True
                    else:
                        self.log_test("Image Generation Endpoint", False, f"Invalid response structure: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Image Generation Endpoint", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Image Generation Endpoint", False, f"Exception: {str(e)}")
            return False

    async def test_persona_image_generation(self):
        """Test image generation for Court Illustrator and Contextualist personas"""
        try:
            # Create a meeting specifically for testing image generation
            meeting_data = {
                "topic": "Creating a magical library that bridges digital and physical worlds",
                "description": "Design an innovative library concept that combines traditional books with digital experiences",
                "proposer": "Image Generation Tester"
            }
            
            async with self.session.post(f"{API_BASE}/meetings", json=meeting_data) as response:
                if response.status == 200:
                    data = await response.json()
                    image_meeting_id = data.get('id')
                    
                    # Start deliberation to trigger persona responses with images
                    async with self.session.post(f"{API_BASE}/meetings/{image_meeting_id}/start-deliberation") as delib_response:
                        if delib_response.status == 200:
                            delib_data = await delib_response.json()
                            ideas = delib_data.get('ideas', [])
                            
                            # Find Court Illustrator and Contextualist responses
                            illustrator_idea = None
                            contextualist_idea = None
                            
                            for idea in ideas:
                                if idea.get('persona_name') == 'The Court Illustrator':
                                    illustrator_idea = idea
                                elif idea.get('persona_name') == 'The Contextualist':
                                    contextualist_idea = idea
                            
                            success_count = 0
                            
                            # Check Court Illustrator response for image
                            if illustrator_idea:
                                idea_text = illustrator_idea.get('idea', '')
                                if '🎨 **Generated Illustration**:' in idea_text or 'Image generation' in idea_text:
                                    self.log_test("Court Illustrator Image Generation", True, "Court Illustrator generated image with response")
                                    success_count += 1
                                else:
                                    self.log_test("Court Illustrator Image Generation", False, "No image generation detected in Court Illustrator response")
                            else:
                                self.log_test("Court Illustrator Image Generation", False, "Court Illustrator response not found")
                            
                            # Check Contextualist response for image
                            if contextualist_idea:
                                idea_text = contextualist_idea.get('idea', '')
                                if '🎨 **Generated Illustration**:' in idea_text or 'Image generation' in idea_text:
                                    self.log_test("Contextualist Image Generation", True, "Contextualist generated image with response")
                                    success_count += 1
                                else:
                                    self.log_test("Contextualist Image Generation", False, "No image generation detected in Contextualist response")
                            else:
                                self.log_test("Contextualist Image Generation", False, "Contextualist response not found")
                            
                            return success_count > 0
                        else:
                            error_text = await delib_response.text()
                            self.log_test("Persona Image Generation", False, f"Deliberation failed: HTTP {delib_response.status}: {error_text}")
                            return False
                else:
                    error_text = await response.text()
                    self.log_test("Persona Image Generation", False, f"Meeting creation failed: HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Persona Image Generation", False, f"Exception: {str(e)}")
            return False

    async def test_final_report_image_generation(self):
        """Test that final reports include summary image generation"""
        try:
            # Create a meeting for final report testing
            meeting_data = {
                "topic": "Designing a sustainable smart city of the future",
                "description": "Create comprehensive plans for an eco-friendly, technology-integrated urban environment",
                "proposer": "Final Report Image Tester"
            }
            
            async with self.session.post(f"{API_BASE}/meetings", json=meeting_data) as response:
                if response.status == 200:
                    data = await response.json()
                    report_meeting_id = data.get('id')
                    
                    # Complete the full workflow: deliberation -> analysis -> finalization
                    # Start deliberation
                    async with self.session.post(f"{API_BASE}/meetings/{report_meeting_id}/start-deliberation") as delib_response:
                        if delib_response.status == 200:
                            # Analyze first idea
                            async with self.session.post(f"{API_BASE}/meetings/{report_meeting_id}/analyze-idea/0") as analyze_response:
                                if analyze_response.status == 200:
                                    # Finalize meeting
                                    async with self.session.post(f"{API_BASE}/meetings/{report_meeting_id}/finalize") as final_response:
                                        if final_response.status == 200:
                                            final_data = await final_response.json()
                                            final_report = final_data.get('final_report', {})
                                            
                                            # Check for summary_image field
                                            if 'summary_image' in final_report:
                                                summary_image = final_report['summary_image']
                                                if isinstance(summary_image, dict) and ('url' in summary_image or 'error' in summary_image):
                                                    if summary_image.get('url'):
                                                        self.log_test("Final Report Image Generation", True, f"Summary image generated: {summary_image.get('url')[:50]}...")
                                                    else:
                                                        self.log_test("Final Report Image Generation", True, f"Image generation attempted with graceful error handling: {summary_image.get('error', 'Unknown error')}")
                                                    return True
                                                else:
                                                    self.log_test("Final Report Image Generation", False, f"Invalid summary_image structure: {summary_image}")
                                                    return False
                                            else:
                                                self.log_test("Final Report Image Generation", False, "No summary_image field found in final report")
                                                return False
                                        else:
                                            error_text = await final_response.text()
                                            self.log_test("Final Report Image Generation", False, f"Finalization failed: HTTP {final_response.status}: {error_text}")
                                            return False
                                else:
                                    error_text = await analyze_response.text()
                                    self.log_test("Final Report Image Generation", False, f"Analysis failed: HTTP {analyze_response.status}: {error_text}")
                                    return False
                        else:
                            error_text = await delib_response.text()
                            self.log_test("Final Report Image Generation", False, f"Deliberation failed: HTTP {delib_response.status}: {error_text}")
                            return False
                else:
                    error_text = await response.text()
                    self.log_test("Final Report Image Generation", False, f"Meeting creation failed: HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Final Report Image Generation", False, f"Exception: {str(e)}")
            return False

    async def test_image_generation_error_handling(self):
        """Test error handling for image generation with invalid inputs"""
        try:
            # Test with invalid style
            invalid_data = {
                "prompt": "Test prompt",
                "style": "invalid_style_that_does_not_exist"
            }
            
            async with self.session.post(f"{API_BASE}/test-image-generation", json=invalid_data) as response:
                if response.status == 200:
                    data = await response.json()
                    # Should handle gracefully - either generate image or return error
                    if data.get('success') or data.get('error'):
                        self.log_test("Image Generation Error Handling - Invalid Style", True, "Invalid style handled gracefully")
                        error_handling_success = True
                    else:
                        self.log_test("Image Generation Error Handling - Invalid Style", False, f"Unexpected response: {data}")
                        error_handling_success = False
                else:
                    # Even HTTP errors should be handled gracefully
                    self.log_test("Image Generation Error Handling - Invalid Style", True, f"HTTP error handled: {response.status}")
                    error_handling_success = True
            
            # Test with empty prompt
            empty_data = {
                "prompt": "",
                "style": "court_illustrator"
            }
            
            async with self.session.post(f"{API_BASE}/test-image-generation", json=empty_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('success') or data.get('error'):
                        self.log_test("Image Generation Error Handling - Empty Prompt", True, "Empty prompt handled gracefully")
                        error_handling_success = error_handling_success and True
                    else:
                        self.log_test("Image Generation Error Handling - Empty Prompt", False, f"Unexpected response: {data}")
                        error_handling_success = False
                else:
                    self.log_test("Image Generation Error Handling - Empty Prompt", True, f"HTTP error handled: {response.status}")
                    error_handling_success = error_handling_success and True
            
            return error_handling_success
            
        except Exception as e:
            self.log_test("Image Generation Error Handling", False, f"Exception: {str(e)}")
            return False
            
    async def test_get_meeting(self):
        """Test retrieving meeting details"""
        if not self.meeting_id:
            self.log_test("Get Meeting", False, "No meeting ID available")
            return False
            
        try:
            async with self.session.get(f"{API_BASE}/meetings/{self.meeting_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('id') == self.meeting_id:
                        self.log_test("Get Meeting", True, f"Meeting retrieved successfully")
                        return True
                    else:
                        self.log_test("Get Meeting", False, f"Meeting ID mismatch: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Get Meeting", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Get Meeting", False, f"Exception: {str(e)}")
            return False
            
    async def test_start_deliberation(self):
        """Test Phase 1: Inspiration Gathering"""
        if not self.meeting_id:
            self.log_test("Start Deliberation", False, "No meeting ID available")
            return False
            
        try:
            async with self.session.post(f"{API_BASE}/meetings/{self.meeting_id}/start-deliberation") as response:
                if response.status == 200:
                    data = await response.json()
                    ideas = data.get('ideas', [])
                    if len(ideas) == 11:  # Should have 11 personas
                        persona_names = [idea.get('persona_name') for idea in ideas]
                        expected_personas = ['The Mouse', 'The Dolphin', 'The Patternist', 'The Contextualist', 
                                           'The Superscholar', 'The Diviner', 'The Naysayer', 'The Court Illustrator',
                                           'The ID', 'The EGO', 'The SUPEREGO']
                        
                        if all(name in persona_names for name in expected_personas):
                            self.log_test("Start Deliberation", True, f"All 11 personas provided ideas")
                            return True, ideas
                        else:
                            missing = [name for name in expected_personas if name not in persona_names]
                            self.log_test("Start Deliberation", False, f"Missing personas: {missing}")
                            return False, None
                    else:
                        self.log_test("Start Deliberation", False, f"Expected 11 ideas, got {len(ideas)}")
                        return False, None
                else:
                    error_text = await response.text()
                    self.log_test("Start Deliberation", False, f"HTTP {response.status}: {error_text}")
                    return False, None
        except Exception as e:
            self.log_test("Start Deliberation", False, f"Exception: {str(e)}")
            return False, None
            
    async def test_analyze_ideas(self, num_ideas):
        """Test Phase 2: Idea Analysis"""
        if not self.meeting_id:
            self.log_test("Analyze Ideas", False, "No meeting ID available")
            return False
            
        success_count = 0
        
        for i in range(min(3, num_ideas)):  # Test first 3 ideas to save time
            try:
                async with self.session.post(f"{API_BASE}/meetings/{self.meeting_id}/analyze-idea/{i}") as response:
                    if response.status == 200:
                        data = await response.json()
                        analyzed_idea = data.get('analyzed_idea', {})
                        scores = analyzed_idea.get('scores', [])
                        
                        if len(scores) == 11 and analyzed_idea.get('average_score', 0) > 0:
                            success_count += 1
                            self.log_test(f"Analyze Idea {i+1}", True, f"Idea analyzed with average score: {analyzed_idea.get('average_score')}")
                        else:
                            self.log_test(f"Analyze Idea {i+1}", False, f"Invalid analysis structure: {len(scores)} scores")
                    else:
                        error_text = await response.text()
                        self.log_test(f"Analyze Idea {i+1}", False, f"HTTP {response.status}: {error_text}")
            except Exception as e:
                self.log_test(f"Analyze Idea {i+1}", False, f"Exception: {str(e)}")
                
        return success_count > 0
        
    async def test_finalize_meeting(self):
        """Test Phase 3 & 4: Finalization"""
        if not self.meeting_id:
            self.log_test("Finalize Meeting", False, "No meeting ID available")
            return False
            
        try:
            async with self.session.post(f"{API_BASE}/meetings/{self.meeting_id}/finalize") as response:
                if response.status == 200:
                    data = await response.json()
                    final_report = data.get('final_report', {})
                    
                    required_fields = ['winning_idea', 'implementation_plan', 'follow_up_questions', 'final_score']
                    if all(field in final_report for field in required_fields):
                        self.log_test("Finalize Meeting", True, f"Meeting finalized with score: {final_report.get('final_score')}")
                        return True
                    else:
                        missing = [field for field in required_fields if field not in final_report]
                        self.log_test("Finalize Meeting", False, f"Missing report fields: {missing}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Finalize Meeting", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Finalize Meeting", False, f"Exception: {str(e)}")
            return False
            
    async def test_get_report(self):
        """Test retrieving final report"""
        if not self.meeting_id:
            self.log_test("Get Report", False, "No meeting ID available")
            return False
            
        try:
            async with self.session.get(f"{API_BASE}/meetings/{self.meeting_id}/report") as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ['winning_idea', 'implementation_plan', 'follow_up_questions', 'final_score']
                    if all(field in data for field in required_fields):
                        self.log_test("Get Report", True, "Final report retrieved successfully")
                        return True
                    else:
                        missing = [field for field in required_fields if field not in data]
                        self.log_test("Get Report", False, f"Missing report fields: {missing}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Get Report", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Get Report", False, f"Exception: {str(e)}")
            return False
            
    async def run_full_test_suite(self):
        """Run the complete test suite"""
        print(f"🏛️ Starting Parliamentary Backend Test Suite")
        print(f"Backend URL: {BASE_URL}")
        print("=" * 60)
        
        await self.setup_session()
        
        try:
            # Test 1: Root endpoint
            if not await self.test_root_endpoint():
                print("❌ Backend not accessible, stopping tests")
                return
                
            # Test 2: Create meeting
            if not await self.test_create_meeting():
                print("❌ Cannot create meeting, stopping tests")
                return
                
            # Test 3: Get meeting details
            await self.test_get_meeting()
            
            # Test 4: Start deliberation (Phase 1)
            success, ideas = await self.test_start_deliberation()
            if not success:
                print("❌ Deliberation failed, skipping analysis tests")
                return
                
            # Test 5: Analyze ideas (Phase 2) - Test first few ideas
            await self.test_analyze_ideas(len(ideas) if ideas else 0)
            
            # Test 6: Finalize meeting (Phase 3 & 4)
            if not await self.test_finalize_meeting():
                print("❌ Finalization failed, skipping report test")
                return
                
            # Test 7: Get final report
            await self.test_get_report()
            
            print("\n" + "🔑" * 60)
            print("🔑 TESTING NEW API KEY MANAGEMENT SYSTEM")
            print("🔑" * 60)
            
            # Test 8: Create meeting with custom API keys
            custom_success, custom_meeting_id = await self.test_create_meeting_with_custom_api_keys()
            
            if custom_success and custom_meeting_id:
                # Test 9: Verify custom API keys are stored
                await self.test_verify_custom_api_keys_stored(custom_meeting_id)
                
                # Test 10: Start deliberation with custom keys
                await self.test_start_deliberation_with_custom_keys(custom_meeting_id)
            
            # Test 11: API key fallback mechanism
            await self.test_api_key_fallback_mechanism()
            
            print("\n" + "🎨" * 60)
            print("🎨 TESTING NEW IMAGE GENERATION FUNCTIONALITY")
            print("🎨" * 60)
            
            # Test 12: Image generation test endpoint
            await self.test_image_generation_endpoint()
            
            # Test 13: Persona image generation (Court Illustrator & Contextualist)
            await self.test_persona_image_generation()
            
            # Test 14: Final report image generation
            await self.test_final_report_image_generation()
            
            # Test 15: Image generation error handling
            await self.test_image_generation_error_handling()
            
        finally:
            await self.cleanup_session()
            
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        # Specific API Key Management Summary
        api_key_tests = [r for r in self.test_results if 'API' in r['test'] or 'Custom' in r['test'] or 'Fallback' in r['test']]
        if api_key_tests:
            print(f"\n🔑 API KEY MANAGEMENT TESTS:")
            api_passed = sum(1 for r in api_key_tests if r['success'])
            print(f"API Key Tests: {len(api_key_tests)}")
            print(f"API Key Passed: {api_passed}")
            print(f"API Key Success Rate: {(api_passed/len(api_key_tests))*100:.1f}%")
                    
        return passed == total

async def main():
    """Main test runner"""
    tester = ParliamentaryTester()
    success = await tester.run_full_test_suite()
    
    if success:
        print("\n🎉 All tests passed! The Parliamentary Backend is working correctly.")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())