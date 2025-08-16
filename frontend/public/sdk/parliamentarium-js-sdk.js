/**
 * Parliamentarium JavaScript SDK
 * The AI Parliament Super-Brain for All Agents
 * Version: 1.0.0
 */

class ParliamentariumSDK {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.parliamentarium.ai';
    this.timeout = config.timeout || 30000;
    this.debug = config.debug || false;
    
    if (!this.apiKey) {
      throw new Error('API key is required. Get one at https://parliamentarium.ai/api-keys');
    }
  }

  /**
   * Request council help from the AI parliament
   * @param {Object} request - The agent request
   * @returns {Promise<Object>} Parliament response
   */
  async requestCouncil(request) {
    const payload = {
      agent_name: request.agentName,
      agent_type: request.agentType || 'assistant',
      request_type: request.type || 'decision_help',
      context: request.context,
      problem_description: request.problem,
      attempted_solutions: request.attemptedSolutions || [],
      urgency_level: request.urgency || 1,
      max_response_time: request.maxTime || 300,
      required_personas: request.personas || [],
      api_key: this.apiKey,
      callback_url: request.callbackUrl,
      metadata: request.metadata || {}
    };

    return this._makeRequest('POST', '/api/agent/request-council', payload);
  }

  /**
   * Emergency fallback when your agent is completely stuck
   * @param {Object} fallback - Emergency fallback request
   * @returns {Promise<Object>} Emergency response
   */
  async emergencyFallback(fallback) {
    const payload = {
      failed_agent: fallback.agentName,
      failure_context: fallback.context,
      failure_details: fallback.details || {},
      time_limit: fallback.timeLimit || 60,
      severity_level: fallback.severity || 8,
      backup_instructions: fallback.instructions,
      metadata: fallback.metadata || {}
    };

    return this._makeRequest('POST', '/api/agent/emergency-fallback', payload);
  }

  /**
   * Coordinate multiple agents on complex tasks
   * @param {Object} coordination - Multi-agent coordination request
   * @returns {Promise<Object>} Coordination strategy
   */
  async coordinateAgents(coordination) {
    const payload = {
      agents: coordination.agents,
      coordination_task: coordination.task,
      priority_level: coordination.priority || 5,
      expected_duration: coordination.duration || 600,
      callback_url: coordination.callbackUrl,
      metadata: coordination.metadata || {}
    };

    return this._makeRequest('POST', '/api/agent/coordinate-multi', payload);
  }

  /**
   * Get pricing information for different request types
   * @returns {Promise<Object>} Pricing details
   */
  async getPricing() {
    return this._makeRequest('GET', '/api/agent/pricing');
  }

  /**
   * Get conversation analysis for a completed session
   * @param {string} sessionId - The session ID to analyze
   * @returns {Promise<Object>} Conversation analysis
   */
  async getAnalysis(sessionId) {
    return this._makeRequest('GET', `/api/analytics/conversation/${sessionId}`);
  }

  /**
   * Get usage analytics for your API key
   * @param {number} days - Number of days to analyze (default: 30)
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats(days = 30) {
    return this._makeRequest('GET', `/api/api-keys/usage/${this.apiKey}?days=${days}`);
  }

  /**
   * Stream real-time responses (for supported endpoints)
   * @param {string} endpoint - API endpoint
   * @param {Object} payload - Request payload
   * @param {function} onMessage - Callback for each message
   * @returns {Promise<void>}
   */
  async streamResponse(endpoint, payload, onMessage) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onMessage(data);
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Private method to make HTTP requests
   */
  async _makeRequest(method, endpoint, payload = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: this.timeout
    };

    if (payload) {
      options.body = JSON.stringify(payload);
    }

    if (this.debug) {
      console.log(`[Parliamentarium SDK] ${method} ${url}`, payload);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${data.detail || data.error || 'Unknown error'}`);
      }

      if (this.debug) {
        console.log(`[Parliamentarium SDK] Response:`, data);
      }

      return data;
    } catch (error) {
      if (this.debug) {
        console.error(`[Parliamentarium SDK] Error:`, error);
      }
      throw error;
    }
  }
}

// Helper functions for common use cases
class ParliamentariumHelpers {
  /**
   * Quick decision help - most common use case
   */
  static async getDecisionHelp(sdk, problem, context = '') {
    return sdk.requestCouncil({
      agentName: 'QuickDecision',
      agentType: 'decision_assistant',
      type: 'decision_help',
      problem,
      context,
      urgency: 3
    });
  }

  /**
   * Creative solution generation
   */
  static async getCreativeSolution(sdk, challenge, context = '') {
    return sdk.requestCouncil({
      agentName: 'CreativeHelper',
      agentType: 'creative_assistant',
      type: 'creative_solution',
      problem: challenge,
      context,
      personas: ['diviner', 'patternist', 'illustrator'],
      urgency: 2
    });
  }

  /**
   * Emergency help when stuck
   */
  static async getEmergencyHelp(sdk, agentName, failure) {
    return sdk.emergencyFallback({
      agentName,
      context: failure,
      severity: 9,
      timeLimit: 30
    });
  }

  /**
   * Strategic planning assistance
   */
  static async getStrategy(sdk, goal, constraints = '') {
    return sdk.requestCouncil({
      agentName: 'StrategyPlanner',
      agentType: 'planning_assistant',
      type: 'strategy_planning',
      problem: goal,
      context: constraints,
      personas: ['mouse', 'dolphin', 'superscholar', 'contextualist'],
      urgency: 4
    });
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = { ParliamentariumSDK, ParliamentariumHelpers };
} else if (typeof define === 'function' && define.amd) {
  // AMD
  define([], function() {
    return { ParliamentariumSDK, ParliamentariumHelpers };
  });
} else {
  // Browser globals
  window.ParliamentariumSDK = ParliamentariumSDK;
  window.ParliamentariumHelpers = ParliamentariumHelpers;
}

/**
 * Example Usage:
 * 
 * // Initialize SDK
 * const parliament = new ParliamentariumSDK({
 *   apiKey: 'prlm_your_api_key_here',
 *   baseUrl: 'https://api.parliamentarium.ai'
 * });
 * 
 * // Quick decision help
 * const decision = await ParliamentariumHelpers.getDecisionHelp(
 *   parliament,
 *   'Should I launch this feature now or wait?',
 *   'We have limited resources but market pressure is high'
 * );
 * 
 * // Creative problem solving
 * const solution = await parliament.requestCouncil({
 *   agentName: 'MyBot',
 *   type: 'creative_solution',
 *   problem: 'How can we increase user engagement?',
 *   context: 'SaaS platform with 1000 users',
 *   urgency: 5
 * });
 * 
 * // Emergency fallback
 * const emergency = await parliament.emergencyFallback({
 *   agentName: 'ChatBot',
 *   context: 'User asked a question I cannot understand',
 *   severity: 8,
 *   timeLimit: 30
 * });
 * 
 * console.log('Parliament says:', solution.solution);
 */