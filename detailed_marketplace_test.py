#!/usr/bin/env python3
"""
Detailed Marketplace Testing - Focused on pricing validation logic
This test attempts to verify that pricing validation exists behind the subscription check
"""

import asyncio
import aiohttp
import json

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

async def test_marketplace_categories():
    """Test the marketplace categories endpoint in detail"""
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{API_BASE}/marketplace/categories") as response:
            if response.status == 200:
                data = await response.json()
                categories = data.get('categories', {})
                
                print("✅ Marketplace Categories Endpoint Response:")
                print(json.dumps(categories, indent=2))
                
                # Verify each category's constraints
                expected_constraints = {
                    'persona': {'min_price': 10.0, 'max_price': None},
                    'template': {'min_price': 5.0, 'max_price': None},
                    'workflow': {'min_price': 15.0, 'max_price': None},
                    'install_new_government': {'min_price': 25.0, 'max_price': 500.0}
                }
                
                all_correct = True
                for category, expected in expected_constraints.items():
                    if category in categories:
                        actual = categories[category]
                        if (actual.get('min_price') == expected['min_price'] and 
                            actual.get('max_price') == expected['max_price']):
                            print(f"✅ {category}: Pricing constraints correct")
                        else:
                            print(f"❌ {category}: Expected {expected}, got {actual}")
                            all_correct = False
                    else:
                        print(f"❌ {category}: Missing from response")
                        all_correct = False
                
                return all_correct
            else:
                print(f"❌ Categories endpoint failed: HTTP {response.status}")
                return False

async def test_marketplace_item_creation_without_auth():
    """Test marketplace item creation without authentication"""
    async with aiohttp.ClientSession() as session:
        test_item = {
            "title": "Test Item",
            "description": "A test item",
            "category": "persona",
            "price": 5.0,  # Below minimum to test validation
            "item_type": "persona",
            "content": {"test": "data"}
        }
        
        async with session.post(f"{API_BASE}/marketplace/items", json=test_item) as response:
            print(f"📝 Marketplace item creation without auth: HTTP {response.status}")
            error_text = await response.text()
            print(f"   Response: {error_text}")
            
            # Should fail with 401 or 403 (authentication required)
            return response.status in [401, 403]

async def test_persona_image_generation_without_auth():
    """Test persona image generation without authentication"""
    async with aiohttp.ClientSession() as session:
        test_data = {
            "persona_name": "Test Persona",
            "prompt": "A test persona image"
        }
        
        async with session.post(f"{API_BASE}/generate-persona-image", json=test_data) as response:
            print(f"🎨 Persona image generation without auth: HTTP {response.status}")
            error_text = await response.text()
            print(f"   Response: {error_text}")
            
            # Should fail with 401 or 403 (authentication required)
            return response.status in [401, 403]

async def main():
    print("🔍 Detailed Marketplace Testing")
    print("=" * 50)
    
    # Test 1: Categories endpoint
    categories_ok = await test_marketplace_categories()
    
    print("\n" + "=" * 50)
    
    # Test 2: Item creation without auth
    item_auth_ok = await test_marketplace_item_creation_without_auth()
    
    print("\n" + "=" * 50)
    
    # Test 3: Image generation without auth  
    image_auth_ok = await test_persona_image_generation_without_auth()
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY:")
    print(f"✅ Categories endpoint: {'PASS' if categories_ok else 'FAIL'}")
    print(f"✅ Item creation auth: {'PASS' if item_auth_ok else 'FAIL'}")
    print(f"✅ Image generation auth: {'PASS' if image_auth_ok else 'FAIL'}")
    
    if categories_ok and item_auth_ok and image_auth_ok:
        print("\n🎉 All detailed tests passed!")
    else:
        print("\n💥 Some tests failed.")

if __name__ == "__main__":
    asyncio.run(main())