export class ClaudeProvider {
  constructor(apiKey, model = 'claude-3-5-haiku-20241022') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
    this.model = model;
    this.version = '2023-06-01';
  }

  /**
   * Send message to Claude API
   */
  async sendMessage(prompt) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': this.version,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: prompt.max_tokens || 500,
          system: prompt.system,
          messages: prompt.messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw this.handleError(response.status, errorData);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API Error:', error);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  handleError(status, errorData) {
    const errorMessage = errorData?.error?.message || 'Unknown error';

    switch (status) {
      case 400:
        return new Error(`Invalid request: ${errorMessage}`);
      case 401:
        return new Error('Invalid API key');
      case 403:
        return new Error('API key does not have permission');
      case 429:
        return new Error('Rate limit exceeded. Please try again later.');
      case 500:
      case 503:
        return new Error('Claude service temporarily unavailable');
      default:
        return new Error(`API Error (${status}): ${errorMessage}`);
    }
  }

  /**
   * Delay helper for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send message with retry logic
   */
  async sendMessageWithRetry(prompt, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.sendMessage(prompt);
      } catch (error) {
        // Don't retry on auth errors
        if (error.message.includes('Invalid API key')) {
          throw error;
        }

        // Last attempt, throw error
        if (attempt === maxRetries - 1) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await this.delay(delay);
      }
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const testPrompt = {
        system: 'You are a helpful assistant.',
        messages: [
          {
            role: 'user',
            content: 'Say "Connection successful" if you can read this.'
          }
        ],
        max_tokens: 50
      };

      const response = await this.sendMessage(testPrompt);
      return response.toLowerCase().includes('connection successful');
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost for request
   */
  calculateCost(inputTokens, outputTokens) {
    // Claude 3.5 Haiku pricing
    const INPUT_COST_PER_MILLION = 0.25;
    const OUTPUT_COST_PER_MILLION = 1.25;

    const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION;
    const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      isFree: false
    };
  }
}
