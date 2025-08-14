#!/usr/bin/env python3
"""
OpenRouter API Integration Test
Tests the OpenRouter API functionality specifically
"""

import asyncio
import aiohttp
import json
import os

async def test_openrouter_api():
    """Test OpenRouter API directly"""
    
    # Read OpenRouter API key
    openrouter_key = None
    try:
        with open('/app/backend/.env', 'r') as f:
            for line in f:
                if line.startswith('OPENROUTER_API_KEY='):
                    openrouter_key = line.split('=', 1)[1].strip().strip('"')
                    break
    except Exception as e:
        print(f"❌ Could not read OpenRouter API key: {str(e)}")
        return False
        
    if not openrouter_key:
        print("❌ No OpenRouter API key found")
        return False
        
    print(f"🔑 Testing OpenRouter API key: {openrouter_key[:20]}...")
    
    headers = {
        "Authorization": f"Bearer {openrouter_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://parliamentarium.app",
        "X-Title": "Parliamentarium"
    }
    
    data = {
        "model": "anthropic/claude-3.5-sonnet",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello' in one word."}
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
                print(f"📡 OpenRouter Response Status: {response.status}")
                
                if response.status == 200:
                    result = await response.json()
                    content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
                    print(f"✅ OpenRouter API Working - Response: {content}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ OpenRouter API Error {response.status}: {error_text}")
                    return False
                    
    except Exception as e:
        print(f"❌ OpenRouter API Exception: {str(e)}")
        return False

async def main():
    print("🔍 Testing OpenRouter API Integration")
    print("=" * 50)
    
    success = await test_openrouter_api()
    
    if success:
        print("\n🎉 OpenRouter API is working correctly!")
    else:
        print("\n💥 OpenRouter API has issues!")

if __name__ == "__main__":
    asyncio.run(main())