# Parliamentarium API Guide
## The AI Super-Brain for All Agents

### 🚀 **What is Parliamentarium?**

Parliamentarium is the **emergency council for all AI agents**. When ANY AI assistant, chatbot, or automation tool gets stuck, it can call upon our 11 mystical AI personas to provide collective intelligence and solutions.

Think of it as **"GitHub Copilot for AI Decision-Making"** - the backend brain that powers better decisions across the entire AI ecosystem.

---

## 🧠 **Core Concept: The AI Parliament**

Our system features 11 specialized AI personas, each with unique strengths:

- **🐭 The Mouse** - Historical precedent and risk assessment
- **🐬 The Dolphin** - Future trends and outcome prediction  
- **🔮 The Patternist** - System analysis and pattern recognition
- **🌍 The Contextualist** - Practical integration and holistic thinking
- **📚 The Superscholar** - Complex interdisciplinary analysis
- **✨ The Diviner** - Creative insights and intuition
- **⚠️ The Naysayer** - Critical analysis and risk identification
- **🎨 The Illustrator** - Visual communication and storytelling
- **🔥 The ID** - Authentic insights and breakthrough thinking
- **⚖️ The EGO** - Balanced pragmatism and feasibility
- **🛡️ The SUPEREGO** - Ethics and compliance standards

---

## 🔑 **Authentication**

### Get Your API Key
1. Sign up at https://parliamentarium.ai
2. Navigate to API Keys section
3. Create a new API key with appropriate permissions
4. Use the key in your requests: `Authorization: Bearer prlm_your_key_here`

### Subscription Tiers
- **Free**: 100 API calls/month, basic features
- **Gold ($50/month)**: Unlimited calls, premium features
- **VIP ($100/month)**: Priority processing, advanced analytics
- **Enterprise ($200/month)**: Custom integrations, SLA guarantees

---

## 📡 **Core API Endpoints**

### 1. Request Council Help
**POST** `/api/agent/request-council`

When your agent needs collective intelligence to solve a problem.

```javascript
{
  "agent_name": "YourBotName",
  "agent_type": "assistant", // assistant, chatbot, automation, etc
  "request_type": "decision_help", // decision_help, creative_solution, problem_solving
  "context": "Background information about the situation",
  "problem_description": "Specific problem that needs solving",
  "attempted_solutions": ["solution1", "solution2"], // optional
  "urgency_level": 5, // 1-10 scale
  "max_response_time": 300, // seconds
  "required_personas": ["mouse", "contextualist"], // optional
  "metadata": {} // optional additional data
}
```

**Response:**
```javascript
{
  "request_id": "uuid",
  "session_id": "uuid", 
  "status": "completed",
  "solution": "Detailed solution from the parliament",
  "confidence_score": 0.85,
  "reasoning": "How the parliament reached this decision",
  "participating_personas": ["mouse", "contextualist", "patternist"],
  "execution_time": 45.2,
  "follow_up_suggestions": ["Next steps to consider"],
  "cost_units": 0.75
}
```

### 2. Emergency Fallback
**POST** `/api/agent/emergency-fallback`

Ultra-fast response when your agent completely fails.

```javascript
{
  "failed_agent": "AgentName",
  "failure_context": "What went wrong and current situation", 
  "time_limit": 60, // seconds for response
  "severity_level": 8 // 1-10, affects pricing
}
```

### 3. Multi-Agent Coordination  
**POST** `/api/agent/coordinate-multi`

Orchestrate multiple AI agents working together.

```javascript
{
  "agents": [
    {"name": "Agent1", "type": "assistant", "capabilities": ["chat"]},
    {"name": "Agent2", "type": "automation", "capabilities": ["workflow"]}
  ],
  "coordination_task": "Complex task requiring multiple agents",
  "priority_level": 5
}
```

### 4. Get Pricing Info
**GET** `/api/agent/pricing`

Returns current pricing for different request types and urgency levels.

### 5. Conversation Analytics
**GET** `/api/analytics/conversation/{session_id}`

Get detailed analysis of how well a parliament session performed.

---

## 💰 **Pricing Model**

### Pay-Per-Use Structure
- **Base Costs**: $0.10 - $0.75 per request depending on type
- **Urgency Multiplier**: 1x to 4x based on urgency (1-10 scale)
- **Persona Factor**: +20% per additional persona involved
- **Time Factor**: Small adjustment for longer processing

### Request Type Pricing
- Decision Help: $0.10 base
- Creative Solution: $0.15 base  
- Problem Solving: $0.20 base
- Strategy Planning: $0.30 base
- Emergency Fallback: $0.50 base (+ 100% urgency surcharge)
- Multi-Agent Coordination: $0.75 base

### Example Calculations
```
Emergency Decision (urgency=9, 3 personas, 60s):
$0.50 × 3.0 (urgency) × 1.4 (personas) × 1.1 (time) = $2.31

Normal Creative Task (urgency=3, 2 personas, 120s):
$0.15 × 1.2 (urgency) × 1.2 (personas) × 1.2 (time) = $0.26
```

---

## 🛠 **SDK Usage Examples**

### JavaScript/Node.js

```javascript
const { ParliamentariumSDK, ParliamentariumHelpers } = require('./parliamentarium-sdk');

// Initialize
const parliament = new ParliamentariumSDK({
  apiKey: 'prlm_your_api_key',
  baseUrl: 'https://api.parliamentarium.ai'
});

// Quick decision help
const decision = await ParliamentariumHelpers.getDecisionHelp(
  parliament,
  'Should I refactor this code or ship as-is?',
  'Deadline in 2 days, code works but is messy'
);

console.log('Parliament advises:', decision.solution);
```

### Python

```python
import requests
import json

class ParliamentariumClient:
    def __init__(self, api_key, base_url="https://api.parliamentarium.ai"):
        self.api_key = api_key
        self.base_url = base_url
        
    def request_council(self, agent_name, problem, context="", urgency=1):
        payload = {
            "agent_name": agent_name,
            "agent_type": "assistant",
            "request_type": "decision_help", 
            "context": context,
            "problem_description": problem,
            "urgency_level": urgency
        }
        
        response = requests.post(
            f"{self.base_url}/api/agent/request-council",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json=payload
        )
        
        return response.json()

# Usage
client = ParliamentariumClient("prlm_your_api_key")
result = client.request_council(
    agent_name="MyBot",
    problem="User is asking for something I don't understand",
    context="Customer support chat, user seems frustrated",
    urgency=6
)

print(f"Solution: {result['solution']}")
```

### cURL Examples

```bash
# Basic council request
curl -X POST "https://api.parliamentarium.ai/api/agent/request-council" \
  -H "Authorization: Bearer prlm_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "TestBot",
    "agent_type": "assistant",
    "request_type": "decision_help",
    "context": "User needs help choosing between options",
    "problem_description": "How to prioritize feature development",
    "urgency_level": 4
  }'

# Emergency fallback
curl -X POST "https://api.parliamentarium.ai/api/agent/emergency-fallback" \
  -H "Authorization: Bearer prlm_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "failed_agent": "ChatBot",
    "failure_context": "Cannot understand user query at all",
    "time_limit": 30,
    "severity_level": 8
  }'
```

---

## 🎯 **Use Cases & Integration Patterns**

### 1. **Chatbot Enhancement**
```javascript
// When your chatbot doesn't know how to respond
if (confidence < 0.5) {
  const help = await parliament.requestCouncil({
    agentName: 'CustomerSupportBot',
    type: 'problem_solving',
    problem: userMessage,
    context: conversationHistory,
    urgency: 7
  });
  
  return help.solution;
}
```

### 2. **Decision Support Systems**
```python
# For business decision automation
def make_strategic_decision(options, constraints):
    result = parliament.request_council(
        agent_name="BusinessDecisionEngine",
        problem=f"Choose between: {options}",
        context=f"Constraints: {constraints}",
        urgency=5,
        personas=["mouse", "dolphin", "contextualist"]
    )
    return result.solution
```

### 3. **Creative Content Generation**
```javascript
// When you need creative ideas
const creative = await parliament.requestCouncil({
  agentName: 'ContentBot',
  type: 'creative_solution', 
  problem: 'Generate engaging social media campaign',
  context: 'B2B SaaS, target audience: developers',
  personas: ['diviner', 'illustrator', 'patternist']
});
```

### 4. **Multi-Agent Orchestration**
```javascript
// Coordinate multiple AI tools
const coordination = await parliament.coordinateAgents({
  agents: [
    {name: 'DataAnalyzer', type: 'analytics'},
    {name: 'ReportGenerator', type: 'content'},
    {name: 'EmailSender', type: 'automation'}
  ],
  task: 'Generate and send weekly performance report'
});
```

---

## 📊 **Rate Limits & Quotas**

### Rate Limiting by Tier
- **Free**: 10 requests/hour, 100/month
- **Gold**: 100 requests/hour, unlimited monthly  
- **VIP**: 500 requests/hour, priority queue
- **Enterprise**: 1000 requests/hour, dedicated resources

### Response Times
- **Normal Priority (1-3)**: 30-120 seconds
- **Medium Priority (4-6)**: 15-60 seconds  
- **High Priority (7-9)**: 5-30 seconds
- **Emergency (10)**: 5-15 seconds

---

## 🔍 **Analytics & Monitoring**

### Track Performance
```javascript
// Get conversation analysis
const analysis = await parliament.getAnalysis(sessionId);
console.log(`Confidence: ${analysis.overall_score}`);
console.log(`Suggestions: ${analysis.improvement_suggestions}`);

// Monitor your usage
const usage = await parliament.getUsageStats(30); // last 30 days
console.log(`Total requests: ${usage.summary.total_requests}`);
console.log(`Total cost: $${usage.summary.total_cost_units}`);
```

### Webhook Notifications
Set up webhooks to receive real-time updates:

```javascript
// When creating requests, include callback URL
const response = await parliament.requestCouncil({
  // ... other params
  callback_url: 'https://yourapp.com/webhooks/parliament'
});

// Your webhook endpoint receives:
// POST https://yourapp.com/webhooks/parliament
{
  "event": "session_completed",
  "session_id": "uuid",
  "status": "completed", 
  "solution": "...",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## ⚡ **Best Practices**

### 1. **Optimize for Cost**
- Use appropriate urgency levels (don't always use 10)
- Be specific about required personas 
- Provide good context to reduce retry needs
- Cache results when appropriate

### 2. **Error Handling**
```javascript
try {
  const result = await parliament.requestCouncil(request);
  return result.solution;
} catch (error) {
  if (error.status === 429) {
    // Rate limited - implement backoff
    await sleep(error.retry_after * 1000);
    return retry(request);
  } else if (error.status === 402) {
    // Payment required - upgrade plan
    throw new Error('Upgrade subscription for more requests');
  } else {
    // Use fallback logic
    return fallbackResponse(request);
  }
}
```

### 3. **Performance Optimization**
- Use streaming for long-running requests
- Implement caching for similar requests
- Monitor usage patterns and optimize

### 4. **Security**
- Store API keys securely (environment variables)
- Rotate keys regularly
- Use least-privilege permissions
- Validate all inputs before sending

---

## 🆘 **Support & Resources**

### Getting Help
- **Documentation**: https://docs.parliamentarium.ai
- **Discord Community**: https://discord.gg/parliamentarium  
- **Email Support**: support@parliamentarium.ai
- **Status Page**: https://status.parliamentarium.ai

### Rate Your Experience
Every API response includes a `session_id` - use it to rate the quality:

```javascript
// Rate a session (1-5 stars)
await parliament.rateSolution(sessionId, 5, "Excellent advice!");
```

### Feature Requests
Vote on new features at https://feedback.parliamentarium.ai

---

## 🚀 **What Makes Us Different**

1. **Collective Intelligence**: 11 specialized AI personas vs single AI
2. **Emergency Response**: Built for when other AI fails  
3. **Agent-First**: Designed specifically for AI-to-AI communication
4. **Pay-Per-Use**: Only pay for what you actually use
5. **Universal Compatibility**: Works with any AI system via simple API
6. **Real-Time Analytics**: Deep insights into decision quality

---

Ready to give your AI agents a super-brain? **[Get your API key now →](https://parliamentarium.ai/signup)**