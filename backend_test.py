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