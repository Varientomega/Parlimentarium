# 🏛️ Parliamentarium SDK & API
## The AI Super-Brain That Powers Every Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Version](https://img.shields.io/badge/API-v1.0.0-blue.svg)](https://api.parliamentarium.ai)
[![Uptime](https://img.shields.io/badge/Uptime-99.9%25-green.svg)](https://status.parliamentarium.ai)

**Parliamentarium** is the emergency council for all AI agents. When ANY AI assistant, chatbot, or automation tool gets stuck, it can call upon our 11 mystical AI personas to provide collective intelligence and breakthrough solutions.

---

## ⚡ **Quick Start**

### 1. Get Your API Key
```bash
# Sign up and get your API key
curl -X POST "https://api.parliamentarium.ai/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "you@company.com", "password": "secure_password"}'
```

### 2. Install the SDK
```bash
# JavaScript/Node.js
npm install parliamentarium-sdk

# Python  
pip install parliamentarium

# Or use our CDN for browser
<script src="https://cdn.parliamentarium.ai/sdk/v1/parliamentarium.min.js"></script>
```

### 3. Make Your First Request
```javascript
const parliament = new ParliamentariumSDK({
  apiKey: 'prlm_your_api_key_here'
});

// When your AI is stuck, ask the parliament
const solution = await parliament.requestCouncil({
  agentName: 'YourBot',
  type: 'decision_help', 
  problem: 'User is asking something I cannot understand',
  context: 'Customer support chat, user seems frustrated',
  urgency: 7
});

console.log('Parliament says:', solution.solution);
```

---

## 🧠 **The Parliament Members**

Our 11 AI personas each bring unique expertise:

| Persona | Role | Best For |
|---------|------|----------|
| 🐭 **The Mouse** | Historian | Risk assessment, precedent analysis |
| 🐬 **The Dolphin** | Prognosticator | Future trends, outcome prediction |
| 🔮 **The Patternist** | Analyst | Pattern recognition, system analysis |
| 🌍 **The Contextualist** | Integration Master | Practical solutions, holistic thinking |
| 📚 **The Superscholar** | Meta Intelligence | Complex analysis, research |
| ✨ **The Diviner** | Creative Mystic | Intuitive insights, breakthrough ideas |
| ⚠️ **The Naysayer** | Critical Voice | Risk identification, devil's advocate |
| 🎨 **The Illustrator** | Visual Communicator | Storytelling, clear explanations |
| 🔥 **The ID** | Authentic Voice | Raw insights, authentic solutions |
| ⚖️ **The EGO** | Practical Mediator | Balance, pragmatism, feasibility |
| 🛡️ **The SUPEREGO** | Ethical Guardian | Ethics, compliance, standards |

---

## 🎯 **Core Use Cases**

### 🤖 **Chatbot Enhancement**
```javascript
// When confidence is low, ask parliament
if (botConfidence < 0.6) {
  const help = await parliament.requestCouncil({
    agentName: 'CustomerBot',
    problem: userMessage,
    context: chatHistory,
    urgency: 8,
    type: 'problem_solving'
  });
  
  return help.solution;
}
```

### 🚨 **Emergency Fallback**
```python
# When your agent completely fails
try:
    response = my_agent.process(user_input)
except Exception as e:
    emergency = await parliament.emergency_fallback({
        'failed_agent': 'MyAgent',
        'failure_context': str(e),
        'severity': 9,
        'time_limit': 30
    })
    return emergency['solution']
```

### 🎨 **Creative Solutions**
```javascript
// Need creative ideas?
const creative = await parliament.requestCouncil({
  agentName: 'ContentCreator',
  type: 'creative_solution',
  problem: 'Generate viral marketing campaign ideas',
  context: 'B2B SaaS, developer audience, limited budget',
  personas: ['diviner', 'illustrator', 'patternist'],
  urgency: 4
});
```

### 🔀 **Multi-Agent Coordination**
```javascript
// Orchestrate multiple AI agents
const strategy = await parliament.coordinateAgents({
  agents: [
    {name: 'DataBot', type: 'analytics'},
    {name: 'WriteBot', type: 'content'}, 
    {name: 'SocialBot', type: 'distribution'}
  ],
  task: 'Create and distribute weekly newsletter',
  priority: 6
});
```

---

## 💰 **Pricing That Scales**

### Pay Only For What You Use
```
💸 Decision Help: $0.10 per request
🎨 Creative Solution: $0.15 per request  
🔧 Problem Solving: $0.20 per request
📋 Strategy Planning: $0.30 per request
🚨 Emergency Fallback: $0.50 per request
🤝 Multi-Agent Coordination: $0.75 per request
```

### Urgency Multipliers
- **Casual (1-3)**: 1.0x - 1.2x base price
- **Important (4-6)**: 1.3x - 1.7x base price
- **Urgent (7-9)**: 2.0x - 3.0x base price
- **EMERGENCY (10)**: 4.0x base price ⚡

### Subscription Tiers
- **🆓 Free**: 100 requests/month
- **🥇 Gold ($50/mo)**: Unlimited requests + premium features
- **⭐ VIP ($100/mo)**: Priority processing + advanced analytics
- **🏢 Enterprise ($200/mo)**: Custom integrations + SLA

---

## 📊 **Real-Time Analytics**

Track the performance of every parliament session:

```javascript
// Get detailed analysis
const analysis = await parliament.getAnalysis(sessionId);

console.log(`Overall Quality: ${analysis.overall_score}/1.0`);
console.log(`Personas Used: ${analysis.participating_personas.length}`);
console.log(`Confidence: ${analysis.confidence_score}`);
console.log(`Suggestions: ${analysis.improvement_suggestions}`);

// Monitor your usage and costs
const usage = await parliament.getUsageStats(30);
console.log(`This month: ${usage.summary.total_requests} requests`);
console.log(`Total cost: $${usage.summary.total_cost_units}`);
```

---

## 🛠 **SDK Examples**

### JavaScript/TypeScript
```typescript
import { ParliamentariumSDK } from 'parliamentarium-sdk';

const parliament = new ParliamentariumSDK({
  apiKey: process.env.PARLIAMENT_API_KEY,
  debug: true // Enable request logging
});

// Quick decision helper
const decision = await ParliamentariumHelpers.getDecisionHelp(
  parliament,
  'Should we launch this feature now?',
  'Resource constraints but market pressure'
);

// Stream responses for real-time updates
await parliament.streamResponse(
  '/api/agent/request-council',
  requestPayload,
  (message) => {
    console.log('Parliament update:', message);
  }
);
```

### Python
```python
from parliamentarium import ParliamentariumClient

client = ParliamentariumClient(
    api_key=os.environ['PARLIAMENT_API_KEY'],
    debug=True
)

# Async/await support
async def get_help():
    result = await client.request_council(
        agent_name="MyBot",
        problem="Complex user query I cannot handle",
        context="E-commerce support, VIP customer",
        urgency=8,
        personas=["mouse", "contextualist", "ego"]
    )
    return result.solution

# Sync version also available
result = client.request_council_sync(...)
```

### cURL (Any Language)
```bash
curl -X POST "https://api.parliamentarium.ai/api/agent/request-council" \
  -H "Authorization: Bearer prlm_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "MyAgent",
    "request_type": "decision_help",
    "problem_description": "Need help with complex decision",
    "context": "High stakes situation",
    "urgency_level": 6
  }'
```

---

## 🔐 **Security & Reliability**

### Enterprise-Grade Security
- 🔒 **API Key Authentication** with rate limiting
- 🛡️ **HTTPS Only** with TLS 1.3
- 🔄 **Automatic Key Rotation** supported
- 📊 **Audit Logging** for compliance
- 🏠 **SOC2 Type II** compliant

### 99.9% Uptime SLA
- ⚡ **Sub-30s Response Times** for emergency requests
- 🌍 **Global CDN** for low latency
- 🔄 **Automatic Failover** and redundancy
- 📈 **Real-Time Status** at https://status.parliamentarium.ai

---

## 🚀 **Advanced Features**

### Webhook Integration
```javascript
// Set up webhooks for async processing
const response = await parliament.requestCouncil({
  // ... your request
  callback_url: 'https://yourapp.com/webhooks/parliament'
});

// Your webhook receives:
app.post('/webhooks/parliament', (req, res) => {
  const { session_id, status, solution, cost_units } = req.body;
  console.log(`Session ${session_id} completed: ${solution}`);
  
  // Update your database, notify users, etc.
  updateUserWithSolution(session_id, solution);
  res.status(200).send('OK');
});
```

### Custom Persona Selection
```javascript
// Choose specific personas for your use case
const technical = await parliament.requestCouncil({
  problem: 'Code architecture decision',
  personas: ['mouse', 'patternist', 'naysayer'], // Conservative, analytical approach
  urgency: 3
});

const creative = await parliament.requestCouncil({
  problem: 'Marketing campaign ideas', 
  personas: ['diviner', 'illustrator', 'id'], // Creative, intuitive approach
  urgency: 2
});
```

### Batch Processing
```javascript
// Process multiple requests efficiently
const requests = [
  {agentName: 'Bot1', problem: 'Problem 1'},
  {agentName: 'Bot2', problem: 'Problem 2'},
  {agentName: 'Bot3', problem: 'Problem 3'}
];

const results = await Promise.all(
  requests.map(req => parliament.requestCouncil(req))
);

console.log(`Processed ${results.length} requests`);
```

---

## 📚 **Resources**

### Documentation & Guides
- 📖 **[Complete API Reference](https://docs.parliamentarium.ai/api)**
- 🎓 **[Getting Started Tutorial](https://docs.parliamentarium.ai/tutorial)**
- 💡 **[Best Practices Guide](https://docs.parliamentarium.ai/best-practices)**
- 🔧 **[Integration Examples](https://docs.parliamentarium.ai/examples)**

### Community & Support
- 💬 **[Discord Community](https://discord.gg/parliamentarium)** - Chat with other developers
- 📧 **[Email Support](mailto:support@parliamentarium.ai)** - Technical help
- 🐛 **[GitHub Issues](https://github.com/parliamentarium/sdk)** - Bug reports
- 💡 **[Feature Requests](https://feedback.parliamentarium.ai)** - Vote on new features

### Status & Updates
- 📊 **[System Status](https://status.parliamentarium.ai)** - Real-time uptime
- 📝 **[Changelog](https://changelog.parliamentarium.ai)** - Latest updates  
- 🔔 **[API Updates Newsletter](https://newsletter.parliamentarium.ai)** - Monthly updates

---

## 🤝 **Contributing**

We welcome contributions to make the SDK better!

```bash
# Clone the repository
git clone https://github.com/parliamentarium/sdk.git
cd sdk

# Install dependencies
npm install

# Run tests
npm test

# Submit a pull request
```

### Development Setup
```bash
# Set up development environment
cp .env.example .env
npm run dev

# Run integration tests (requires API key)
PARLIAMENT_API_KEY=prlm_test_key npm run test:integration
```

---

## 📄 **License**

MIT License - see [LICENSE.md](LICENSE.md) for details.

---

## 🌟 **What Developers Are Saying**

> *"Parliamentarium saved our customer support bot. When users ask complex questions, we get thoughtful responses instead of 'I don't understand.'"*  
> — Sarah Chen, Lead Developer at TechCorp

> *"The emergency fallback feature is a game-changer. Our automation never gets completely stuck anymore."*  
> — Mike Rodriguez, DevOps Engineer at StartupXYZ

> *"We use it for strategic planning decisions. Having 11 different perspectives helps us avoid blind spots."*  
> — Jessica Kim, CTO at GrowthCo

---

## 🚀 **Ready to Get Started?**

1. **[Sign up for free](https://parliamentarium.ai/signup)** - Get 100 requests/month
2. **[Read the docs](https://docs.parliamentarium.ai)** - Complete integration guide
3. **[Join our Discord](https://discord.gg/parliamentarium)** - Connect with other developers
4. **[Try the playground](https://playground.parliamentarium.ai)** - Test requests interactively

### Need Enterprise Features?
Contact us at **enterprise@parliamentarium.ai** for:
- Custom integrations and white-labeling
- On-premise deployment options
- Dedicated support and SLA guarantees
- Volume discounts and custom pricing

---

**Make your AI agents smarter. Give them a parliament.** 🏛️✨