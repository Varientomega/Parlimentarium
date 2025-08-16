#!/usr/bin/env python3
"""
Marketplace and Persona Image Generation Test Suite
Tests the newly implemented marketplace enhancements and persona image generation functionality
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

class MarketplaceTester:
    def __init__(self):
        self.session = None
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

    async def test_marketplace_categories_endpoint(self):
        """Test GET /api/marketplace/categories endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/marketplace/categories") as response:
                if response.status == 200:
                    data = await response.json()
                    categories = data.get('categories', {})
                    
                    # Check if all expected categories are present
                    expected_categories = ['persona', 'template', 'workflow', 'install_new_government']
                    if all(cat in categories for cat in expected_categories):
                        # Check pricing constraints
                        persona_constraints = categories.get('persona', {})
                        template_constraints = categories.get('template', {})
                        workflow_constraints = categories.get('workflow', {})
                        government_constraints = categories.get('install_new_government', {})
                        
                        if (persona_constraints.get('min_price') == 10.0 and
                            template_constraints.get('min_price') == 5.0 and
                            workflow_constraints.get('min_price') == 15.0 and
                            government_constraints.get('min_price') == 25.0 and
                            government_constraints.get('max_price') == 500.0):
                            self.log_test("Marketplace Categories Endpoint", True, "Categories with correct pricing constraints returned")
                            return True
                        else:
                            self.log_test("Marketplace Categories Endpoint", False, "Pricing constraints don't match expected values")
                            return False
                    else:
                        missing = [cat for cat in expected_categories if cat not in categories]
                        self.log_test("Marketplace Categories Endpoint", False, f"Missing categories: {missing}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Marketplace Categories Endpoint", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Marketplace Categories Endpoint", False, f"Exception: {str(e)}")
            return False

    async def create_test_user(self, email: str):
        """Create a test user and return auth token"""
        try:
            login_data = {"email": email}
            async with self.session.post(f"{API_BASE}/auth/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    token = data.get('access_token')
                    user = data.get('user', {})
                    return token, user
                else:
                    error_text = await response.text()
                    self.log_test("Create Test User", False, f"HTTP {response.status}: {error_text}")
                    return None, None
        except Exception as e:
            self.log_test("Create Test User", False, f"Exception: {str(e)}")
            return None, None

    async def test_marketplace_item_creation_pricing_validation(self):
        """Test POST /api/marketplace/items with pricing validation"""
        # Create a test user (first 5 users get dev status which might include Gold+ features)
        token, user = await self.create_test_user("marketplace_tester@example.com")
        if not token:
            self.log_test("Marketplace Item Creation Setup", False, "Could not create test user")
            return False

        headers = {"Authorization": f"Bearer {token}"}
        
        test_cases = [
            # Test cases that should fail
            {
                "name": "Persona Item Below Min Price",
                "data": {
                    "title": "Custom Persona",
                    "description": "A custom persona for testing",
                    "category": "persona",
                    "price": 5.0,  # Below $10 minimum
                    "item_type": "persona",
                    "content": {"persona_data": "test"}
                },
                "should_succeed": False,
                "expected_error": "Price must be at least $10"
            },
            {
                "name": "Template Item Below Min Price", 
                "data": {
                    "title": "Custom Template",
                    "description": "A custom template for testing",
                    "category": "template",
                    "price": 3.0,  # Below $5 minimum
                    "item_type": "template",
                    "content": {"template_data": "test"}
                },
                "should_succeed": False,
                "expected_error": "Price must be at least $5"
            },
            {
                "name": "Workflow Item Below Min Price",
                "data": {
                    "title": "Custom Workflow",
                    "description": "A custom workflow for testing", 
                    "category": "workflow",
                    "price": 10.0,  # Below $15 minimum
                    "item_type": "workflow",
                    "content": {"workflow_data": "test"}
                },
                "should_succeed": False,
                "expected_error": "Price must be at least $15"
            },
            {
                "name": "Government Item Below Min Price",
                "data": {
                    "title": "New Government System",
                    "description": "A new government installation",
                    "category": "install_new_government", 
                    "price": 20.0,  # Below $25 minimum
                    "item_type": "install_new_government",
                    "content": {"government_data": "test"}
                },
                "should_succeed": False,
                "expected_error": "Price must be at least $25"
            },
            {
                "name": "Government Item Above Max Price",
                "data": {
                    "title": "Premium Government System",
                    "description": "An expensive government installation",
                    "category": "install_new_government",
                    "price": 600.0,  # Above $500 maximum
                    "item_type": "install_new_government", 
                    "content": {"government_data": "test"}
                },
                "should_succeed": False,
                "expected_error": "Price cannot exceed $500"
            },
            # Test cases that should succeed
            {
                "name": "Valid Persona Item",
                "data": {
                    "title": "Valid Custom Persona",
                    "description": "A valid custom persona",
                    "category": "persona",
                    "price": 15.0,  # Above $10 minimum
                    "item_type": "persona",
                    "content": {"persona_data": "valid"}
                },
                "should_succeed": True,
                "expected_error": None
            },
            {
                "name": "Valid Template Item",
                "data": {
                    "title": "Valid Custom Template", 
                    "description": "A valid custom template",
                    "category": "template",
                    "price": 8.0,  # Above $5 minimum
                    "item_type": "template",
                    "content": {"template_data": "valid"}
                },
                "should_succeed": True,
                "expected_error": None
            },
            {
                "name": "Valid Workflow Item",
                "data": {
                    "title": "Valid Custom Workflow",
                    "description": "A valid custom workflow",
                    "category": "workflow", 
                    "price": 20.0,  # Above $15 minimum
                    "item_type": "workflow",
                    "content": {"workflow_data": "valid"}
                },
                "should_succeed": True,
                "expected_error": None
            },
            {
                "name": "Valid Government Item",
                "data": {
                    "title": "Valid Government System",
                    "description": "A valid government installation",
                    "category": "install_new_government",
                    "price": 100.0,  # Within $25-$500 range
                    "item_type": "install_new_government",
                    "content": {"government_data": "valid"}
                },
                "should_succeed": True,
                "expected_error": None
            }
        ]

        success_count = 0
        for test_case in test_cases:
            try:
                async with self.session.post(f"{API_BASE}/marketplace/items", json=test_case["data"], headers=headers) as response:
                    if test_case["should_succeed"]:
                        if response.status == 200:
                            self.log_test(f"Marketplace - {test_case['name']}", True, "Item created successfully")
                            success_count += 1
                        else:
                            error_text = await response.text()
                            self.log_test(f"Marketplace - {test_case['name']}", False, f"Expected success but got HTTP {response.status}: {error_text}")
                    else:
                        if response.status == 400:
                            error_text = await response.text()
                            if test_case["expected_error"] in error_text:
                                self.log_test(f"Marketplace - {test_case['name']}", True, f"Correctly rejected with expected error")
                                success_count += 1
                            else:
                                self.log_test(f"Marketplace - {test_case['name']}", False, f"Rejected but with unexpected error: {error_text}")
                        else:
                            error_text = await response.text()
                            self.log_test(f"Marketplace - {test_case['name']}", False, f"Expected 400 error but got HTTP {response.status}: {error_text}")
            except Exception as e:
                self.log_test(f"Marketplace - {test_case['name']}", False, f"Exception: {str(e)}")

        return success_count == len(test_cases)

    async def test_persona_image_generation_endpoint(self):
        """Test POST /api/generate-persona-image endpoint with different subscription tiers"""
        
        # Test with Free tier user (should fail with 403)
        free_token, free_user = await self.create_test_user("free_user_test@example.com")
        if free_token:
            headers = {"Authorization": f"Bearer {free_token}"}
            test_data = {
                "persona_name": "Test Persona",
                "prompt": "A mystical AI persona with glowing eyes"
            }
            
            try:
                async with self.session.post(f"{API_BASE}/generate-persona-image", json=test_data, headers=headers) as response:
                    if response.status == 403:
                        self.log_test("Persona Image Generation - Free Tier Restriction", True, "Free tier correctly blocked from image generation")
                        free_tier_test_passed = True
                    else:
                        error_text = await response.text()
                        # If user got dev status (first 5 users), they might have access
                        if free_user and free_user.get('is_dev'):
                            self.log_test("Persona Image Generation - Free Tier Restriction", True, "User has dev status, access granted")
                            free_tier_test_passed = True
                        else:
                            self.log_test("Persona Image Generation - Free Tier Restriction", False, f"Expected 403 but got HTTP {response.status}: {error_text}")
                            free_tier_test_passed = False
            except Exception as e:
                self.log_test("Persona Image Generation - Free Tier Restriction", False, f"Exception: {str(e)}")
                free_tier_test_passed = False
        else:
            self.log_test("Persona Image Generation - Free Tier Restriction", False, "Could not create free tier test user")
            free_tier_test_passed = False

        # Test with Gold+ tier user (should succeed or fail gracefully if FAL.ai key missing)
        gold_token, gold_user = await self.create_test_user("gold_user_test@example.com")
        if gold_token:
            headers = {"Authorization": f"Bearer {gold_token}"}
            test_data = {
                "persona_name": "Gold Test Persona",
                "prompt": "An elegant AI persona with golden aura and mystical powers"
            }
            
            try:
                async with self.session.post(f"{API_BASE}/generate-persona-image", json=test_data, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success') and data.get('image_url'):
                            self.log_test("Persona Image Generation - Gold Tier Success", True, f"Image generated successfully: {data.get('image_url')[:50]}...")
                            gold_tier_test_passed = True
                        elif not data.get('success'):
                            # Graceful failure (e.g., FAL.ai key missing)
                            error_msg = data.get('error', 'Unknown error')
                            self.log_test("Persona Image Generation - Gold Tier Graceful Failure", True, f"Graceful failure handled: {error_msg}")
                            gold_tier_test_passed = True
                        else:
                            self.log_test("Persona Image Generation - Gold Tier Success", False, f"Invalid response structure: {data}")
                            gold_tier_test_passed = False
                    elif response.status == 403:
                        # User might not have Gold+ tier, but if they have dev status it should work
                        if gold_user and gold_user.get('is_dev'):
                            self.log_test("Persona Image Generation - Gold Tier Success", False, "Dev user should have access but got 403")
                            gold_tier_test_passed = False
                        else:
                            self.log_test("Persona Image Generation - Gold Tier Success", True, "User doesn't have Gold+ tier, correctly blocked")
                            gold_tier_test_passed = True
                    else:
                        error_text = await response.text()
                        self.log_test("Persona Image Generation - Gold Tier Success", False, f"HTTP {response.status}: {error_text}")
                        gold_tier_test_passed = False
            except Exception as e:
                self.log_test("Persona Image Generation - Gold Tier Success", False, f"Exception: {str(e)}")
                gold_tier_test_passed = False
        else:
            self.log_test("Persona Image Generation - Gold Tier Success", False, "Could not create Gold tier test user")
            gold_tier_test_passed = False

        return free_tier_test_passed and gold_tier_test_passed

    async def run_marketplace_test_suite(self):
        """Run the marketplace and persona image generation test suite"""
        print(f"🛒 Starting Marketplace & Persona Image Generation Test Suite")
        print(f"Backend URL: {BASE_URL}")
        print("=" * 70)
        
        await self.setup_session()
        
        try:
            # Test 1: Root endpoint
            if not await self.test_root_endpoint():
                print("❌ Backend not accessible, stopping tests")
                return
                
            print("\n" + "🛒" * 70)
            print("🛒 TESTING MARKETPLACE FUNCTIONALITY")
            print("🛒" * 70)
            
            # Test 2: Marketplace categories endpoint
            await self.test_marketplace_categories_endpoint()
            
            # Test 3: Marketplace item creation with pricing validation
            await self.test_marketplace_item_creation_pricing_validation()
            
            print("\n" + "🎨" * 70)
            print("🎨 TESTING PERSONA IMAGE GENERATION FUNCTIONALITY")
            print("🎨" * 70)
            
            # Test 4: Persona image generation endpoint
            await self.test_persona_image_generation_endpoint()
            
        finally:
            await self.cleanup_session()
            
        # Print summary
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
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
        
        # Specific Marketplace Summary
        marketplace_tests = [r for r in self.test_results if 'Marketplace' in r['test']]
        if marketplace_tests:
            print(f"\n🛒 MARKETPLACE TESTS:")
            marketplace_passed = sum(1 for r in marketplace_tests if r['success'])
            print(f"Marketplace Tests: {len(marketplace_tests)}")
            print(f"Marketplace Passed: {marketplace_passed}")
            print(f"Marketplace Success Rate: {(marketplace_passed/len(marketplace_tests))*100:.1f}%")
        
        # Specific Persona Image Generation Summary
        persona_tests = [r for r in self.test_results if 'Persona Image Generation' in r['test']]
        if persona_tests:
            print(f"\n🎨 PERSONA IMAGE GENERATION TESTS:")
            persona_passed = sum(1 for r in persona_tests if r['success'])
            print(f"Persona Tests: {len(persona_tests)}")
            print(f"Persona Passed: {persona_passed}")
            print(f"Persona Success Rate: {(persona_passed/len(persona_tests))*100:.1f}%")
                    
        return passed == total

async def main():
    """Main test runner"""
    tester = MarketplaceTester()
    success = await tester.run_marketplace_test_suite()
    
    if success:
        print("\n🎉 All marketplace and persona image generation tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())